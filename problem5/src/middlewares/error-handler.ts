import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "../config/env.js";
import { AppError } from "../errors.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      requestId: req.requestId
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {})
      },
      requestId: req.requestId
    });
    return;
  }

  console.error({
    requestId: req.requestId,
    error
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        config.nodeEnv === "production"
          ? "Internal server error"
          : error instanceof Error
            ? error.message
            : "Internal server error"
    },
    requestId: req.requestId
  });
};
