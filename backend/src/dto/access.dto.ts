import { AccessPermission, AccessResourceType } from "../types/index.js";

export class ShareAccessDTO {
  resourceType!: AccessResourceType;
  resourceId!: string;
  userId!: string;
  permission!: AccessPermission;
}

export class UpdateAccessDTO {
  permission!: AccessPermission;
}

export class AccessResponseDTO {
  id!: string;
  resourceType!: AccessResourceType;
  resourceId!: string;
  userId!: string;
  permission!: AccessPermission;
  createdAt!: Date;
  updatedAt!: Date;
}
