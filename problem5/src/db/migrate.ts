import type { Db } from "./connection.js";

export function migrate(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      key TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
    CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
    CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON resources(updated_at);
    CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON resources(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_idempotency_keys_resource_id ON idempotency_keys(resource_id);
  `);

  const columns = db.prepare("PRAGMA table_info(resources)").all() as Array<{
    name: string;
  }>;

  if (!columns.some((column) => column.name === "deleted_at")) {
    db.exec("ALTER TABLE resources ADD COLUMN deleted_at TEXT DEFAULT NULL");
  }
}
