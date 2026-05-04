import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";
import { UserRole } from "../types/index.js";

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError("User not authenticated");
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError("Insufficient permissions for this action");
    }

    next();
  };
}
