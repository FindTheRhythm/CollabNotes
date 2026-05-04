export const CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    SALT_ROUNDS: 10
  },
  JWT: {
    ACCESS_TOKEN_EXPIRES_IN: "15m",
    REFRESH_TOKEN_EXPIRES_IN: "7d"
  },
  REDIS: {
    SESSION_PREFIX: "session:",
    CACHE_PREFIX: "cache:",
    LOCK_PREFIX: "lock:",
    TTL: 3600
  }
} as const;

export const API_PATHS = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  NOTES: "/api/notes",
  ACCESS: "/api/access",
  COMMENTS: "/api/comments"
} as const;

export const MESSAGES = {
  SUCCESS: "Operation successful",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource conflict",
  INTERNAL_ERROR: "Internal server error"
} as const;
