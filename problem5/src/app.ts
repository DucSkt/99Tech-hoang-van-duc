import cors from "cors";
import express, { type Application } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config/env.js";
import { openDatabase, type Db } from "./db/connection.js";
import { migrate } from "./db/migrate.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { requestId } from "./middlewares/request-id.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { createResourceController } from "./modules/resources/resource.controller.js";
import { createResourceRepository } from "./modules/resources/resource.repository.js";
import { createResourceRouter } from "./modules/resources/resource.routes.js";
import { createResourceService } from "./modules/resources/resource.service.js";

export interface AppHandle {
  app: Application;
  db: Db;
  close: () => void;
}

export function createApp(options: { databasePath?: string } = {}): AppHandle {
  const db = openDatabase(options.databasePath ?? config.databasePath);
  migrate(db);

  const repository = createResourceRepository(db);
  const service = createResourceService(repository);
  const controller = createResourceController(service);
  const app = express();

  app.disable("x-powered-by");
  if (config.nodeEnv === "production") {
    app.set("trust proxy", 1);
  }

  app.use(requestId());
  app.use(requestLogger());
  app.use(helmet());
  if (config.corsOrigins.length > 0) {
    app.use(cors({ origin: config.corsOrigins }));
  }
  app.use(express.json({ limit: "100kb" }));

  if (config.nodeEnv !== "test") {
    app.use(
      rateLimit({
        windowMs: 60_000,
        limit: 120,
        standardHeaders: "draft-8",
        legacyHeaders: false
      })
    );
  }

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", (_req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.status(200).json({ status: "ready", database: "ok" });
    } catch (error) {
      console.error({ error }, "readiness check failed");
      res.status(503).json({ status: "not_ready", database: "unavailable" });
    }
  });

  app.use("/resources", createResourceRouter(controller));
  app.use(notFound());
  app.use(errorHandler);

  return {
    app,
    db,
    close: () => db.close()
  };
}
