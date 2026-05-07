import type { Db } from "../../db/connection.js";
import { AppError } from "../../errors.js";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  UpdateResourceInput
} from "./resource.schema.js";
import type { ListResourcesResult, Resource } from "./resource.types.js";

interface ResourceRow {
  id: string;
  name: string;
  description: string;
  status: Resource["status"];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

interface DecodedCursor {
  createdAt: string;
  id: string;
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): DecodedCursor {
  let decoded = "";

  try {
    decoded = Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid cursor");
  }

  const [createdAt, id] = decoded.split("|", 2);

  if (!createdAt || !id) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid cursor");
  }

  return { createdAt, id };
}

export interface ResourceRepository {
  insert(
    input: CreateResourceInput & {
      id: string;
      createdAt: string;
      updatedAt: string;
    }
  ): Resource;
  insertIdempotent(
    input: CreateResourceInput & {
      id: string;
      createdAt: string;
      updatedAt: string;
    },
    idempotencyKey: string
  ): { resource: Resource; created: boolean };
  findById(id: string): Resource | null;
  list(query: ListResourcesQuery): ListResourcesResult;
  update(
    id: string,
    patch: UpdateResourceInput & { updatedAt: string }
  ): Resource | null;
  delete(id: string): boolean;
}

export function createResourceRepository(db: Db): ResourceRepository {
  const insertStmt = db.prepare(`
    INSERT INTO resources (id, name, description, status, created_at, updated_at)
    VALUES (@id, @name, @description, @status, @createdAt, @updatedAt)
  `);

  const insertIdempotencyKeyStmt = db.prepare(`
    INSERT INTO idempotency_keys (key, resource_id, created_at)
    VALUES (@key, @resourceId, @createdAt)
  `);

  const findIdempotencyKeyStmt = db.prepare<[string], { resource_id: string }>(`
    SELECT resource_id
    FROM idempotency_keys
    WHERE key = ?
  `);

  const findByIdStmt = db.prepare<[string], ResourceRow>(`
    SELECT id, name, description, status, created_at, updated_at, deleted_at
    FROM resources
    WHERE id = ? AND deleted_at IS NULL
  `);

  const softDeleteStmt = db.prepare(`
    UPDATE resources
    SET deleted_at = @deletedAt, updated_at = @deletedAt
    WHERE id = @id AND deleted_at IS NULL
  `);

  return {
    insert(input) {
      insertStmt.run(input);
      const row = findByIdStmt.get(input.id);
      if (!row) {
        throw new Error("Resource insert succeeded but row could not be read");
      }
      return toResource(row);
    },

    insertIdempotent(input, idempotencyKey) {
      // Idempotency-Key protects create from retry/double-click duplicates
      // without forcing business uniqueness on fields like `name`.
      const run = db.transaction(() => {
        const existing = findIdempotencyKeyStmt.get(idempotencyKey);

        if (existing) {
          const existingRow = findByIdStmt.get(existing.resource_id);
          if (!existingRow) {
            throw new AppError(
              409,
              "IDEMPOTENCY_CONFLICT",
              "Idempotency key points to a resource that is no longer available"
            );
          }

          return { resource: toResource(existingRow), created: false };
        }

        insertStmt.run(input);
        insertIdempotencyKeyStmt.run({
          key: idempotencyKey,
          resourceId: input.id,
          createdAt: input.createdAt
        });

        const row = findByIdStmt.get(input.id);
        if (!row) {
          throw new Error("Resource insert succeeded but row could not be read");
        }

        return { resource: toResource(row), created: true };
      });

      return run();
    },

    findById(id) {
      const row = findByIdStmt.get(id);
      return row ? toResource(row) : null;
    },

    list(query) {
      const where: string[] = ["deleted_at IS NULL"];
      const params: Record<string, unknown> = {
        limit: query.limit,
        offset: (query.page - 1) * query.limit
      };

      if (query.status) {
        where.push("status = @status");
        params.status = query.status;
      }

      if (query.q) {
        // Prefix search keeps the filter useful while still being friendlier to
        // the name index than a contains search such as `%keyword%`.
        where.push("name LIKE @q COLLATE NOCASE ESCAPE '\\'");
        params.q = `${escapeLike(query.q)}%`;
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

      if (query.cursor) {
        // Cursor pagination is better for "load more" / infinite-scroll screens:
        // it avoids large OFFSET scans and is more stable while rows are added.
        const { createdAt, id } = decodeCursor(query.cursor);
        const cursorParams = {
          ...params,
          cursorCreatedAt: createdAt,
          cursorId: id,
          limit: query.limit + 1
        };
        const cursorWhereSql = `${whereSql} AND (created_at < @cursorCreatedAt OR (created_at = @cursorCreatedAt AND id < @cursorId))`;
        const rows = db
          .prepare(
            `SELECT id, name, description, status, created_at, updated_at, deleted_at
             FROM resources
             ${cursorWhereSql}
             ORDER BY created_at DESC, id DESC
             LIMIT @limit`
          )
          .all(cursorParams) as ResourceRow[];

        const hasMore = rows.length > query.limit;
        const pageRows = hasMore ? rows.slice(0, query.limit) : rows;
        const last = pageRows[pageRows.length - 1];

        return {
          items: pageRows.map(toResource),
          pagination: {
            mode: "cursor",
            limit: query.limit,
            nextCursor:
              hasMore && last ? encodeCursor(last.created_at, last.id) : null,
            hasMore
          }
        };
      }

      // Page pagination is kept for classic admin-table UIs where users expect
      // page numbers and total counts.
      const rows = db
        .prepare(
          `SELECT id, name, description, status, created_at, updated_at, deleted_at
           FROM resources
           ${whereSql}
           ORDER BY created_at DESC, id DESC
           LIMIT @limit OFFSET @offset`
        )
        .all(params) as ResourceRow[];

      const totalRow = db
        .prepare(`SELECT COUNT(*) AS total FROM resources ${whereSql}`)
        .get(params) as { total: number };
      const last = rows[rows.length - 1];
      const hasMore = query.page * query.limit < totalRow.total;

      return {
        items: rows.map(toResource),
        pagination: {
          mode: "page",
          total: totalRow.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(totalRow.total / query.limit),
          nextCursor:
            hasMore && last ? encodeCursor(last.created_at, last.id) : null,
          hasMore
        }
      };
    },

    update(id, patch) {
      const fields: string[] = [];
      const params: Record<string, unknown> = { id, updatedAt: patch.updatedAt };

      if (patch.name !== undefined) {
        fields.push("name = @name");
        params.name = patch.name;
      }

      if (patch.description !== undefined) {
        fields.push("description = @description");
        params.description = patch.description;
      }

      if (patch.status !== undefined) {
        fields.push("status = @status");
        params.status = patch.status;
      }

      fields.push("updated_at = @updatedAt");

      const result = db
        .prepare(
          `UPDATE resources
           SET ${fields.join(", ")}
           WHERE id = @id AND deleted_at IS NULL`
        )
        .run(params);

      if (result.changes === 0) return null;
      return this.findById(id);
    },

    delete(id) {
      // Soft delete preserves data for audit/recovery. Public read/update/list
      // queries all include `deleted_at IS NULL`, so deleted rows disappear from
      // the API without being physically removed from SQLite.
      return softDeleteStmt.run({
        id,
        deletedAt: new Date().toISOString()
      }).changes > 0;
    }
  };
}
