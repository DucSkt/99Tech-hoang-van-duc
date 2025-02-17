import { Response } from "express";

export const successResponse = (res: Response, statusCode: number, data: any) => {
    return res.status(statusCode).json({ success: true, data });
};

export const errorResponse = (res: Response, statusCode: number, message: string) => {
    return res.status(statusCode).json({ success: false, error: message });
};
