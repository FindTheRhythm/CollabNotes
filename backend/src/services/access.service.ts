import { accessRepository } from "../repositories/access.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { AccessResponseDTO } from "../dto/access.dto.js";
import { ISharedAccess } from "../types/models.js";

export class AccessService {
  async shareNote(noteId: string, userId: string, permission: string, currentUserId: string): Promise<AccessResponseDTO> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the note owner can share notes");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const access = await accessRepository.create(noteId, userId, permission);
    return this.mapAccessToDTO(access);
  }

  async getNoteAccess(noteId: string, currentUserId: string): Promise<AccessResponseDTO[]> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the note owner can view access list");
    }

    const accessList = await accessRepository.findByNoteId(noteId);
    return accessList.map(access => this.mapAccessToDTO(access));
  }

  async updateAccess(id: string, permission: string, currentUserId: string): Promise<AccessResponseDTO> {
    const access = await accessRepository.findById(id);
    if (!access) {
      throw new NotFoundError("Access not found");
    }

    const note = await noteRepository.findById(access.note_id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the note owner can update access");
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

    const note = await noteRepository.findById(access.note_id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== currentUserId) {
      throw new ForbiddenError("Only the note owner can remove access");
    }

    await accessRepository.delete(id);
  }

  private mapAccessToDTO(access: ISharedAccess): AccessResponseDTO {
    return {
      id: access.id,
      noteId: access.note_id,
      userId: access.user_id,
      permission: access.permission,
      createdAt: access.created_at,
      updatedAt: access.updated_at
    };
  }
}

export const accessService = new AccessService();
