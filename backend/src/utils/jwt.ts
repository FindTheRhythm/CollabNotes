import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { IAuthPayload } from "../types/models.js";

export function generateAccessToken(payload: IAuthPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });
}

export function generateRefreshToken(payload: IAuthPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
}

export function verifyAccessToken(token: string): IAuthPayload | null {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as IAuthPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): IAuthPayload | null {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as IAuthPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.decode(token) as jwt.JwtPayload | null;
  } catch {
    return null;
  }
}
