export class CreateCommentDTO {
  content!: string;
  noteId!: string;
}

export class UpdateCommentDTO {
  content!: string;
}

export class CommentResponseDTO {
  id!: string;
  noteId!: string;
  userId!: string;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
