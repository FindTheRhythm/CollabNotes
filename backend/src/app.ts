import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import accessRoutes from "./routes/access.routes.js";
import commentRoutes from "./routes/comment.routes.js";

const app: Application = express();

// Middlewares
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/comments", commentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found"
  });
});

// Error handler
app.use(errorHandler);

export default app;
