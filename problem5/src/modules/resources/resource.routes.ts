import { Router } from "express";
import type { ResourceController } from "./resource.controller.js";

export function createResourceRouter(controller: ResourceController): Router {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
