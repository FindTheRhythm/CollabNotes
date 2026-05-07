import { commentRepository } from "../repositories/comment.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { accessRepository } from "../repositories/access.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { CommentResponseDTO } from "../dto/comment.dto.js";
import { IComment } from "../types/models.js";
import { UserRole } from "../types/index.js";

export class CommentService {
  async getNoteComments(noteId: string, currentUserId: string, currentUserRole: UserRole): Promise<CommentResponseDTO[]> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (currentUserRole !== UserRole.ADMIN && note.owner_id !== currentUserId) {
      const access = await accessRepository.findByNoteAndUser(noteId, currentUserId);
      if (!access) {
        throw new ForbiddenError("You don't have permission to view comments for this note");
      }
    }

    const comments = await commentRepository.findByNoteId(noteId);
    return comments.map(comment => this.mapCommentToDTO(comment));
  }

  async createComment(noteId: string, userId: string, userRole: UserRole, content: string): Promise<CommentResponseDTO> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (note.owner_id !== userId && userRole !== UserRole.ADMIN) {
      const access = await accessRepository.findByNoteAndUser(noteId, userId);
      if (!access) {
        throw new ForbiddenError("You don't have permission to comment on this note");
      }
    }

    const comment = await commentRepository.create(noteId, userId, content);
    return this.mapCommentToDTO(comment);
  }

  async updateComment(id: string, content: string, userId: string, userRole: UserRole): Promise<CommentResponseDTO> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("You don't have permission to update this comment");
    }

    const updatedComment = await commentRepository.update(id, content);
    if (!updatedComment) {
      throw new NotFoundError("Comment not found");
    }

    return this.mapCommentToDTO(updatedComment);
  }

  async deleteComment(id: string, userId: string, userRole: UserRole): Promise<void> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("You don't have permission to delete this comment");
    }

    await commentRepository.delete(id);
  }

  private mapCommentToDTO(comment: IComment): CommentResponseDTO {
    return {
      id: comment.id,
      noteId: comment.note_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    };
  }
}

export const commentService = new CommentService();
