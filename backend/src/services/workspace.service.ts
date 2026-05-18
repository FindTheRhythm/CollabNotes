import { workspaceRepository } from "../repositories/workspace.repository.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import {
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
  WorkspaceResponseDTO,
} from "../dto/workspace.dto.js";
import { WorkspaceModel } from "../models/workspace.model.js";
import { accessService } from "../services/access.service.js";
import { AccessPermission, AccessResourceType, UserRole } from "../types/index.js";

export class WorkspaceService {
  async getWorkspaces(userId: string): Promise<WorkspaceResponseDTO[]> {
    const workspaces = await workspaceRepository.findAccessibleByUserId(userId);
    return workspaces.map((workspace) => this.mapWorkspaceToDTO(workspace));
  }

  async getWorkspace(workspaceId: string, userId: string, userRole: UserRole): Promise<WorkspaceResponseDTO> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const isOwner = workspace.owner_id === userId;
    const canReadWorkspace = isOwner || userRole === UserRole.ADMIN || await accessService.canAccess(
      AccessResourceType.WORKSPACE,
      workspaceId,
      userId,
      AccessPermission.READ,
      userRole
    );

    if (!canReadWorkspace) {
      const accessibleWorkspaces = await workspaceRepository.findAccessibleByUserId(userId);
      const hasWorkspace = accessibleWorkspaces.some(w => w.id === workspaceId);
      if (!hasWorkspace) {
        throw new ForbiddenError("You do not have permission to view this workspace");
      }
    }

    return this.mapWorkspaceToDTO(workspace);
  }

  async createWorkspace(
    dto: CreateWorkspaceDTO,
    ownerId: string
  ): Promise<WorkspaceResponseDTO> {
    const workspace = await workspaceRepository.create(dto.name, ownerId);
    return this.mapWorkspaceToDTO(workspace);
  }

  async updateWorkspace(
    workspaceId: string,
    dto: UpdateWorkspaceDTO,
    ownerId: string
  ): Promise<WorkspaceResponseDTO> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    if (workspace.owner_id !== ownerId) {
      throw new ForbiddenError("You do not have access to update this workspace");
    }
    const updatedWorkspace = await workspaceRepository.update(workspaceId, {
      name: dto.name,
    });
    if (!updatedWorkspace) {
      throw new NotFoundError("Workspace not found");
    }
    return this.mapWorkspaceToDTO(updatedWorkspace);
  }

  async deleteWorkspace(workspaceId: string, ownerId: string): Promise<void> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    if (workspace.owner_id !== ownerId) {
      throw new ForbiddenError("You do not have access to delete this workspace");
    }
    await workspaceRepository.delete(workspaceId);
  }

  private mapWorkspaceToDTO(
    workspace: WorkspaceModel
  ): WorkspaceResponseDTO {
    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.owner_id,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
    };
  }
}

export const workspaceService = new WorkspaceService();
