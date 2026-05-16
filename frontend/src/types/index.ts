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

// ========== Application-specific types ==========

export interface ContentBlock {
  id: string;
  type:
    | "text"
    | "heading"
    | "heading2"
    | "heading3"
    | "bullet"
    | "numbered"
    | "checklist"
    | "quote"
    | "code"
    | "image"
    | "table"
    | "divider"
    | "formula";
  content: string;
  metadata?: Record<string, any>;
  order: number;
}

export interface EditorState {
  blocks: ContentBlock[];
  selectedBlockId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
}

export interface SharePermission {
  userId: string;
  type: "view" | "edit" | "comment";
  grantedBy: string;
  grantedAt: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
  changesSummary?: string;
}

export interface ContextMenuItem {
  label: string;
  action: string;
  icon?: string;
  submenu?: ContextMenuItem[];
  isDangerous?: boolean;
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
}

export interface DragDropEvent {
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: string;
  reason: "DROP" | "CANCEL";
}
