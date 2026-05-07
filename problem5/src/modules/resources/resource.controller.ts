import type { RequestHandler } from "express";
import {
  CreateResourceSchema,
  IdParamSchema,
  ListResourcesQuerySchema,
  UpdateResourceSchema
} from "./resource.schema.js";
import type { ResourceService } from "./resource.service.js";

export interface ResourceController {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
}

export function createResourceController(
  service: ResourceService
): ResourceController {
  return {
    create(req, res) {
      const input = CreateResourceSchema.parse(req.body);
      const idempotencyKey = req.header("Idempotency-Key")?.trim();
      const result = service.create(input, idempotencyKey || undefined);
      res.status(result.created ? 201 : 200).json({
        success: true,
        data: result.resource,
        idempotent: !result.created
      });
    },

    list(req, res) {
      const query = ListResourcesQuerySchema.parse(req.query);
      const result = service.list(query);
      res.status(200).json({ success: true, data: result });
    },

    getById(req, res) {
      const { id } = IdParamSchema.parse(req.params);
      const resource = service.getById(id);
      res.status(200).json({ success: true, data: resource });
    },

    update(req, res) {
      const { id } = IdParamSchema.parse(req.params);
      const patch = UpdateResourceSchema.parse(req.body);
      const resource = service.update(id, patch);
      res.status(200).json({ success: true, data: resource });
    },

    delete(req, res) {
      const { id } = IdParamSchema.parse(req.params);
      service.delete(id);
      res.status(204).send();
    }
  };
}
