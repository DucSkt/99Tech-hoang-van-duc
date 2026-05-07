import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../errors.js";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  UpdateResourceInput
} from "./resource.schema.js";
import type { ResourceRepository } from "./resource.repository.js";
import type { ListResourcesResult, Resource } from "./resource.types.js";

export interface ResourceService {
  create(
    input: CreateResourceInput,
    idempotencyKey?: string
  ): { resource: Resource; created: boolean };
  list(query: ListResourcesQuery): ListResourcesResult;
  getById(id: string): Resource;
  update(id: string, patch: UpdateResourceInput): Resource;
  delete(id: string): void;
}

export function createResourceService(
  repository: ResourceRepository
): ResourceService {
  return {
    create(input, idempotencyKey) {
      const now = new Date().toISOString();
      const resourceInput = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now
      };

      if (idempotencyKey) {
        return repository.insertIdempotent(resourceInput, idempotencyKey);
      }

      return {
        resource: repository.insert(resourceInput),
        created: true
      };
    },

    list(query) {
      return repository.list(query);
    },

    getById(id) {
      const resource = repository.findById(id);
      if (!resource) throw new NotFoundError("Resource", id);
      return resource;
    },

    update(id, patch) {
      const resource = repository.update(id, {
        ...patch,
        updatedAt: new Date().toISOString()
      });
      if (!resource) throw new NotFoundError("Resource", id);
      return resource;
    },

    delete(id) {
      const deleted = repository.delete(id);
      if (!deleted) throw new NotFoundError("Resource", id);
    }
  };
}
