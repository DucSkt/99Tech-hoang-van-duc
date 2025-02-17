import { Request, Response } from "express";
import * as ResourceService from "./resource.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

export const createResource = async (req: Request, res: Response): Promise<void> => {
    try {
        const resource = await ResourceService.createResource(req.body);
        successResponse(res, 201, resource);
    } catch (error) {
        errorResponse(res, 500, "Failed to create resource");
    }
};
export const getAllResources = async (req: Request, res: Response): Promise<void> => {
    try {
        const resources = await ResourceService.getAllResources(req.query);
        successResponse(res, 200, resources);
    } catch (error) {
        errorResponse(res, 500, "Failed to fetch resources");
    }
};

export const getResourceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const resource = await ResourceService.getResourceById(req.params.id);
        resource ? successResponse(res, 200, resource) : errorResponse(res, 404, "Resource not found");
    } catch (error) {
        errorResponse(res, 500, "Failed to fetch resource");
    }
};

export const updateResource = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedResource = await ResourceService.updateResource(req.params.id, req.body);
        updatedResource ? successResponse(res, 200, updatedResource) : errorResponse(res, 404, "Resource not found");
    } catch (error) {
        errorResponse(res, 500, "Failed to update resource");
    }
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedResource = await ResourceService.deleteResource(req.params.id);
        deletedResource ? successResponse(res, 200, { message: "Resource soft deleted" }) : errorResponse(res, 404, "Resource not found");
    } catch (error) {
        errorResponse(res, 500, "Failed to delete resource");
    }
};
