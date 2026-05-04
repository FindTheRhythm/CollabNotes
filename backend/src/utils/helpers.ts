import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getPaginationParams(page?: any, limit?: any) {
  const parsedPage = Math.max(1, parseInt(String(page || 1), 10));
  const parsedLimit = Math.min(
    Math.max(1, parseInt(String(limit || 20), 10)),
    100
  );
  const offset = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, offset };
}

export function calculatePages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function getCurrentTimestamp(): Date {
  return new Date();
}
