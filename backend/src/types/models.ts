import { UserRole, AccessPermission, AccessResourceType } from "./index.js";

export interface IUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface INote {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface IResourceAccess {
  id: string;
  resource_type: AccessResourceType;
  resource_id: string;
  user_id: string;
  permission: AccessPermission;
  created_at: Date;
  updated_at: Date;
}

export interface IRefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  createdAt: Date;
}

export interface IComment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
