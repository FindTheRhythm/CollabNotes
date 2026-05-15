import { Request, Response, NextFunction } from "express";
import { AppError, createErrorResponse } from "../utils/errors.js";
import { config } from "../config/index.js";

const log = {
  error: (msg: string, data?: any) => console.error(`[ERROR MIDDLEWARE] ${msg}`, data || ""),
  debug: (msg: string, data?: any) => console.log(`[ERROR MIDDLEWARE DEBUG] ${msg}`, data || ""),
};

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();

  console.error(`\n[ERROR] ${timestamp} ${method} ${url}`);
  console.error("Error:", err);

  if (err instanceof AppError) {
    log.error("AppError caught", {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      method,
      url
    });

    res.status(err.statusCode).json(
      createErrorResponse(err.statusCode, err.message, err.errors)
    );
    return;
  }

  log.error("Unexpected error", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    method,
    url
  });

  if (config.node.isDev) {
    res.status(500).json(
      createErrorResponse(500, err.message || "Internal server error", {
        stack: err.stack
      })
    );
  } else {
    res.status(500).json(
      createErrorResponse(500, "Internal server error")
    );
  }
}

