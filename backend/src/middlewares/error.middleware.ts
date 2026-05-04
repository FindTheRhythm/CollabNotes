import { Request, Response, NextFunction } from "express";
import { AppError, createErrorResponse } from "../utils/errors.js";
import { config } from "../config/index.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      createErrorResponse(err.statusCode, err.message, err.errors)
    );
    return;
  }

  if (config.node.isDev) {
    res.status(500).json(
      createErrorResponse(500, err.message || "Internal server error")
    );
  } else {
    res.status(500).json(
      createErrorResponse(500, "Internal server error")
    );
  }
}
