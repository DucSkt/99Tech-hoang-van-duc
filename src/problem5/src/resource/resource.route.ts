import express, {RequestHandler} from "express";
import * as ResourceController from "./resource.controller";
import {CreateResourceDto, UpdateResourceDto} from "./dto/resource.dto";
import {validateDto} from "../middlewares/validate.middleware";

const routerResource = express.Router();

routerResource.post("/", validateDto(CreateResourceDto) as RequestHandler, ResourceController.createResource);
routerResource.put("/:id", validateDto(UpdateResourceDto) as RequestHandler, ResourceController.updateResource);
 routerResource.get("/", ResourceController.getAllResources);
routerResource.get("/:id", ResourceController.getResourceById);
 routerResource.delete("/:id", ResourceController.deleteResource);

export {routerResource};
