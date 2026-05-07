import { noteRepository } from "../repositories/note.repository.js";
import { accessRepository } from "../repositories/access.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { NoteResponseDTO, NoteWithAccessDTO } from "../dto/note.dto.js";
import { INote } from "../types/models.js";
import { UserRole, AccessPermission } from "../types/index.js";

export class NoteService {
  async getNoteById(id: string, userId: string, userRole: UserRole): Promise<NoteWithAccessDTO> {
    const note = await noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const isOwner = note.owner_id === userId;
    if (isOwner || userRole === UserRole.ADMIN) {
      return {
        ...this.mapNoteToDTO(note),
        isOwner,
        permission: isOwner ? AccessPermission.EDIT : undefined
      };
    }

    const access = await accessRepository.findByNoteAndUser(id, userId);
    if (!access) {
      throw new ForbiddenError("You don't have permission to view this note");
    }

    return {
      ...this.mapNoteToDTO(note),
      isOwner: false,
      permission: access.permission
    };
  }

  async getUserNotes(userId: string, page: number, limit: number): Promise<{ notes: NoteWithAccessDTO[]; total: number }> {
    const offset = (page - 1) * limit;
    const { notes, total } = await noteRepository.findByOwnerId(userId, offset, limit);

    return {
      notes: notes.map(note => ({
        ...this.mapNoteToDTO(note),
        isOwner: true,
        permission: AccessPermission.EDIT
      })),
      total
    };
  }

  async getAllNotes(userId: string, userRole: UserRole, page: number, limit: number): Promise<{ notes: NoteWithAccessDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    if (userRole === UserRole.ADMIN) {
      const { notes, total } = await noteRepository.findAll(offset, limit);
      return {
        notes: notes.map(note => ({
          ...this.mapNoteToDTO(note),
          isOwner: note.owner_id === userId,
          permission: note.owner_id === userId ? AccessPermission.EDIT : undefined
        })),
        total
      };
    }

    const { notes, total } = await noteRepository.findAccessibleByUserId(userId, offset, limit);
    return {
      notes: notes.map(note => ({
        ...this.mapNoteToDTO(note),
        isOwner: note.owner_id === userId,
        permission: note.owner_id === userId ? AccessPermission.EDIT : note.permission
      })),
      total
    };
  }

  async createNote(title: string, content: string, ownerId: string): Promise<NoteResponseDTO> {
    const note = await noteRepository.create(title, content, ownerId);
    return this.mapNoteToDTO(note);
  }

  async updateNote(id: string, title: string | undefined, content: string | undefined, userId: string, userRole: UserRole): Promise<NoteResponseDTO> {
    const note = await noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const isOwner = note.owner_id === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      const access = await accessRepository.findByNoteAndUser(id, userId);
      if (!access || access.permission !== AccessPermission.EDIT) {
        throw new ForbiddenError("You don't have permission to edit this note");
      }
    }

    const updatedNote = await noteRepository.update(id, { title, content });
    if (!updatedNote) {
      throw new NotFoundError("Note not found");
    }

    return this.mapNoteToDTO(updatedNote);
  }

  async deleteNote(id: string, userId: string, userRole: UserRole): Promise<void> {
    const note = await noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("You don't have permission to delete this note");
    }

    await noteRepository.delete(id);
  }

  async searchNotes(query: string, userId: string, userRole: UserRole, page: number, limit: number): Promise<{ notes: NoteWithAccessDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    if (userRole === UserRole.ADMIN) {
      const { notes, total } = await noteRepository.search(query, offset, limit);
      return {
        notes: notes.map(note => ({
          ...this.mapNoteToDTO(note),
          isOwner: note.owner_id === userId,
          permission: note.owner_id === userId ? AccessPermission.EDIT : undefined
        })),
        total
      };
    }

    const { notes, total } = await noteRepository.searchAccessibleByUserId(query, userId, offset, limit);
    return {
      notes: notes.map(note => ({
        ...this.mapNoteToDTO(note),
        isOwner: note.owner_id === userId,
        permission: note.owner_id === userId ? AccessPermission.EDIT : note.permission
      })),
      total
    };
  }

  private mapNoteToDTO(note: INote): NoteResponseDTO {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      ownerId: note.owner_id,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    };
  }
}

export const noteService = new NoteService();
