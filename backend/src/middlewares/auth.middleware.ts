import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { IAuthPayload } from "../types/models.js";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
      token?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  req.user = payload;
  req.token = token;
  next();
}
