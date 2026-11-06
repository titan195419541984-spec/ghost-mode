import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFeedsRouter } from "./api/feeds.js";

const app = express();
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "HEAD", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(express.json({ limit: "32kb", strict: true }));

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store").json({
    ok: true,
    service: "ghost-mode-alternative",
    timestamp: new Date().toISOString()
  });
});

const feedsRouter = createFeedsRouter();
app.use("/api/feeds", feedsRouter);
app.use("/api/trends", feedsRouter);

app.use(express.static(PUBLIC_DIR, {
  index: "index.html",
  etag: true,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith("sw.js") || filePath.endsWith("manifest.json")) {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found." });
  }
  return res.sendFile(path.join(PUBLIC_DIR, "index.html"), error => {
    if (error) next(error);
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error("Request failed:", error.message);
  res.status(status).json({
    error: status >= 500 ? "Internal server error." : error.message
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("Ghost Mode Alternative listening on port " + PORT);
});

function shutdown(signal) {
  console.log(signal + " received. Closing HTTP server.");
  server.close(error => {
    if (error) {
      console.error("Server shutdown failed:", error);
      process.exitCode = 1;
    }
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;