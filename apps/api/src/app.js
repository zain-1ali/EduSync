import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import pinoHttp from "pino-http";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { requestContext } from "./middleware/requestContext.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { syncRouter } from "./routes/syncRoutes.js";
import { userRouter } from "./routes/userRoutes.js";

function isDevelopmentLocalOrigin(origin) {
  if (env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestContext);
  app.use(
    pinoHttp({
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
      ],
      customProps: (req) => ({ requestId: req.id }),
    }),
  );

  if (process.env.VERCEL) {
    app.use((req, _res, next) => {
      const marked = Array.isArray(req.query?.edusyncPath)
        ? req.query.edusyncPath[0]
        : req.query?.edusyncPath;
      if (typeof marked === "string" && marked.startsWith("/")) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(req.query)) {
          if (key === "edusyncPath") continue;
          const values = Array.isArray(value) ? value : [value];
          for (const item of values) {
            if (item != null) params.append(key, String(item));
          }
        }
        const query = params.toString();
        req.url = query ? `${marked}?${query}` : marked;
        delete req.query.edusyncPath;
      }
      next();
    });
    app.use(async (req, _res, next) => {
      if ((req.url || "").split("?")[0] === "/health/live") {
        next();
        return;
      }
      try {
        await connectDatabase();
        next();
      } catch (error) {
        req.log?.error({ err: error }, "Database connection failed");
        next(
          new AppError(
            503,
            "DATABASE_UNAVAILABLE",
            "The school database is not reachable",
          ),
        );
      }
    });
  }

  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (
          !origin ||
          origin === "null" ||
          env.clientOrigins.includes(origin) ||
          isDevelopmentLocalOrigin(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1_000,
      limit: 1_000,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res
      .status(ready ? 200 : 503)
      .json({ status: ready ? "ready" : "not_ready" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", userRouter);
  app.use("/api/sync", syncRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
