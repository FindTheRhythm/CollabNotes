import React from "react";
import { INoteWithAccess } from "@/types/index.ts";
import { NoteCard } from "@/components/Notes/NoteCard.tsx";

interface NoteListProps {
  notes: INoteWithAccess[];
  isLoading: boolean;
  onDelete?: (noteId: string) => void;
}

export function NoteList({ notes, isLoading, onDelete }: NoteListProps): React.ReactElement {
  if (isLoading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="no-notes">No notes found</div>;
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteCard key={note.id} note={note} onDelete={onDelete} />
      ))}
    </div>
  );
}
