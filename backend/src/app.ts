import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import accessRoutes from "./routes/access.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import pageRoutes from "./routes/page.routes.js";
import notebookRoutes from "./routes/notebook.routes.js";
import contentBlockRoutes from "./routes/contentBlock.routes.js";

const app: Application = express();

console.log(`[APP] Initializing Express application...`);
console.log(`[APP] Environment: ${config.node.env}`);
console.log(`[APP] CORS origin: ${config.cors.origin}`);

// Middlewares
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[HTTP] ${timestamp} ${req.method} ${req.path}`;
  console.log(logMsg, {
    headers: req.headers,
    body: req.body
  });
  
  // Log response when it finishes
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[HTTP] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  console.log(`[APP] Root endpoint called`);
  res.status(200).json({
    message: "CollabNotes API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
      users: "/api/users",
      notes: "/api/notes",
      access: "/api/access",
      comments: "/api/comments"
    },
    notes: "Most API groups require auth. Use /api/auth to register/login and obtain tokens."
  });
});

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "CollabNotes API groups",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      notes: "/api/notes",
      access: "/api/access",
      comments: "/api/comments"
    },
    info: "Use GET /api/auth for auth route discovery. Most other groups require Bearer token authentication."
  });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  console.log(`[APP] Health check called`);
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/blocks", contentBlockRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  console.log(`[APP] 404 - Route not found: ${_req.method} ${_req.path}`);
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found"
  });
});

// Error handler
app.use(errorHandler);

console.log(`[APP] Express application initialized successfully`);

export default app;
