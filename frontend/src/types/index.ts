export interface IUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface INote {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteWithAccess extends INote {
  isOwner: boolean;
  permission?: string;
}

export interface IComment {
  id: string;
  noteId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISharedAccess {
  id: string;
  noteId: string;
  userId: string;
  permission: AccessPermission;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "USER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN"
}

export enum AccessPermission {
  READ = "READ",
  EDIT = "EDIT"
}

export interface IAuthResponse {
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
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

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
