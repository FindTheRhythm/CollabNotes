export enum UserRole {
  USER = "USER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN"
}

export enum AccessPermission {
  READ = "READ",
  WRITE = "WRITE",
  ADMIN = "ADMIN"
}

export enum AccessResourceType {
  NOTE = "NOTE",
  WORKSPACE = "WORKSPACE",
  NOTEBOOK = "NOTEBOOK"
}

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
}
