import { ErrorCode } from "../types/index.js";
import { IApiResponse } from "../types/models.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>, message = "Validation failed") {
    super(400, ErrorCode.VALIDATION_ERROR, message, errors);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(401, ErrorCode.UNAUTHORIZED, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, ErrorCode.FORBIDDEN, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, ErrorCode.NOT_FOUND, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(409, ErrorCode.CONFLICT, message);
    this.name = "ConflictError";
  }
}

export function createSuccessResponse<T>(
  data: T,
  message = "Operation successful",
  statusCode = 200
): IApiResponse<T> {
  return {
    success: true,
    statusCode,
    message,
    data
  };
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>
): IApiResponse<null> {
  return {
    success: false,
    statusCode,
    message,
    errors
  };
}
