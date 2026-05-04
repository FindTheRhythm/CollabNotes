import bcrypt from "bcryptjs";
import { CONSTANTS } from "../constants/index.js";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, CONSTANTS.PASSWORD.SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];

  if (password.length < CONSTANTS.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${CONSTANTS.PASSWORD.MIN_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}
