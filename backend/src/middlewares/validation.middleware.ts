import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { createErrorResponse } from "../utils/errors.js";

export function validationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {};

    errors.array().forEach((error) => {
      const field = error.param || "unknown";
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    });

    res.status(400).json(
      createErrorResponse(400, "Validation failed", formattedErrors)
    );
    return;
  }

  next();
}
