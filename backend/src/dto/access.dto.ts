import { AccessPermission } from "../types/index.js";

export class ShareAccessDTO {
  noteId!: string;
  userId!: string;
  permission!: AccessPermission;
}

export class UpdateAccessDTO {
  permission!: AccessPermission;
}

export class AccessResponseDTO {
  id!: string;
  noteId!: string;
  userId!: string;
  permission!: AccessPermission;
  createdAt!: Date;
  updatedAt!: Date;
}
