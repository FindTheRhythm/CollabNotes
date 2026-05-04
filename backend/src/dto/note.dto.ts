export class CreateNoteDTO {
  title!: string;
  content!: string;
}

export class UpdateNoteDTO {
  title?: string;
  content?: string;
}

export class NoteResponseDTO {
  id!: string;
  title!: string;
  content!: string;
  ownerId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class NoteWithAccessDTO extends NoteResponseDTO {
  isOwner!: boolean;
  permission?: string;
}
