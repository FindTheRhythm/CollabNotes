import { commentRepository } from "../repositories/comment.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { NotFoundError } from "../utils/errors.js";
import { CommentResponseDTO } from "../dto/comment.dto.js";
import { IComment } from "../types/models.js";

export class CommentService {
  async getNoteComments(noteId: string): Promise<CommentResponseDTO[]> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const comments = await commentRepository.findByNoteId(noteId);
    return comments.map(comment => this.mapCommentToDTO(comment));
  }

  async createComment(noteId: string, userId: string, content: string): Promise<CommentResponseDTO> {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const comment = await commentRepository.create(noteId, userId, content);
    return this.mapCommentToDTO(comment);
  }

  async updateComment(id: string, content: string, userId: string): Promise<CommentResponseDTO> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user_id !== userId) {
      throw new NotFoundError("Comment not found");
    }

    const updatedComment = await commentRepository.update(id, content);
    if (!updatedComment) {
      throw new NotFoundError("Comment not found");
    }

    return this.mapCommentToDTO(updatedComment);
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user_id !== userId) {
      throw new NotFoundError("Comment not found");
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
