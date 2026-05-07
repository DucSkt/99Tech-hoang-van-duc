import type { RequestHandler } from "express";
import { config } from "../config/env.js";

export function requestLogger(): RequestHandler {
  return (req, res, next) => {
    if (config.nodeEnv === "test") {
      next();
      return;
    }

    const startedAt = Date.now();
    res.on("finish", () => {
      console.info({
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });

    next();
  };
}
