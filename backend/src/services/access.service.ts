import { accessRepository } from "../repositories/access.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";
import { workspaceRepository } from "../repositories/workspace.repository.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { AccessResponseDTO } from "../dto/access.dto.js";
import { IResourceAccess } from "../types/models.js";
import { AccessPermission, AccessResourceType, UserRole } from "../types/index.js";

const permissionRank: Record<AccessPermission, number> = {
  [AccessPermission.READ]: 1,
  [AccessPermission.WRITE]: 2,
  [AccessPermission.ADMIN]: 3
};

export class AccessService {
  async shareResource(
    resourceType: AccessResourceType,
    resourceId: string,
    userId: string,
    permission: AccessPermission,
    currentUserId: string
  ): Promise<AccessResponseDTO> {
    const resource = await this.findResource(resourceType, resourceId);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (resource.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the resource owner can share access");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const access = await accessRepository.create(resourceType, resourceId, userId, permission);
    return this.mapAccessToDTO(access);
  }

  async getResourceAccess(resourceType: AccessResourceType, resourceId: string, currentUserId: string): Promise<AccessResponseDTO[]> {
    const resource = await this.findResource(resourceType, resourceId);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (resource.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the resource owner can view access list");
    }

    const accessList = await accessRepository.findByResource(resourceType, resourceId);
    return accessList.map(access => this.mapAccessToDTO(access));
  }

  async updateAccess(id: string, permission: AccessPermission, currentUserId: string): Promise<AccessResponseDTO> {
    const access = await accessRepository.findById(id);
    if (!access) {
      throw new NotFoundError("Access not found");
    }

    const resource = await this.findResource(access.resource_type, access.resource_id);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (resource.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the resource owner can update access");
    }

    const updatedAccess = await accessRepository.update(id, permission);
    if (!updatedAccess) {
      throw new NotFoundError("Access not found");
    }

    return this.mapAccessToDTO(updatedAccess);
  }

  async removeAccess(id: string, currentUserId: string): Promise<void> {
    const access = await accessRepository.findById(id);
    if (!access) {
      throw new NotFoundError("Access not found");
    }

    const resource = await this.findResource(access.resource_type, access.resource_id);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (resource.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the resource owner can remove access");
    }

    await accessRepository.delete(id);
  }

  async canAccess(
    resourceType: AccessResourceType,
    resourceId: string,
    userId: string | undefined,
    requiredPermission: AccessPermission,
    userRole?: UserRole
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    if (userRole === UserRole.ADMIN) {
      return true;
    }

    const resource = await this.findResource(resourceType, resourceId);
    if (!resource) {
      return false;
    }

    if (resource.owner_id === userId) {
      return true;
    }

    const access = await accessRepository.findByResourceAndUser(resourceType, resourceId, userId);
    if (access && permissionRank[access.permission] >= permissionRank[requiredPermission]) {
      return true;
    }

    if (resourceType === AccessResourceType.NOTEBOOK || resourceType === AccessResourceType.NOTE) {
      const workspaceId = await this.getWorkspaceIdForResource(resourceType, resource);
      if (!workspaceId) {
        return false;
      }

      const workspaceAccess = await accessRepository.findByResourceAndUser(
        AccessResourceType.WORKSPACE,
        workspaceId,
        userId
      );
      if (workspaceAccess && permissionRank[workspaceAccess.permission] >= permissionRank[requiredPermission]) {
        return true;
      }
    }

    return false;
  }

  private async getWorkspaceIdForResource(resourceType: AccessResourceType, resource: any): Promise<string | null> {
    switch (resourceType) {
      case AccessResourceType.NOTEBOOK:
        return resource.workspace_id ?? null;
      case AccessResourceType.NOTE:
        const section = await sectionRepository.findById(resource.section_id);
        if (!section) {
          return null;
        }
        const notebook = await notebookRepository.findById(section.notebook_id);
        return notebook?.workspace_id ?? null;
      default:
        return null;
    }
  }

  private async findResource(resourceType: AccessResourceType, resourceId: string): Promise<any> {
    switch (resourceType) {
      case AccessResourceType.NOTE:
        return noteRepository.findById(resourceId);
      case AccessResourceType.WORKSPACE:
        return workspaceRepository.findById(resourceId);
      case AccessResourceType.NOTEBOOK:
        return notebookRepository.findById(resourceId);
      default:
        return null;
    }
  }

  private mapAccessToDTO(access: IResourceAccess): AccessResponseDTO {
    return {
      id: access.id,
      resourceType: access.resource_type,
      resourceId: access.resource_id,
      userId: access.user_id,
      permission: access.permission,
      createdAt: access.created_at,
      updatedAt: access.updated_at
    };
  }
}

export const accessService = new AccessService();
