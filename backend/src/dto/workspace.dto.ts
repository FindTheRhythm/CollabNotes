export class CreateWorkspaceDTO {
  name!: string;
}

export class UpdateWorkspaceDTO {
  name?: string;
}

export class WorkspaceResponseDTO {
  id!: string;
  name!: string;
  ownerId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
