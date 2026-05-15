import React from "react";
import { INoteWithAccess } from "@/types/index";
import { Link } from "react-router-dom";

interface NoteCardProps {
  note: INoteWithAccess;
  onDelete?: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps): React.ReactElement {
  const handleDelete = (): void => {
    if (onDelete && confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  return (
    <div className="note-card">
      <Link to={`/notes/${note.id}`}>
        <h3>{note.title}</h3>
      </Link>
      <p className="note-preview">{note.content?.substring(0, 100)}...</p>
      <div className="note-meta">
        <span className="date">{new Date(note.createdAt).toLocaleDateString()}</span>
        {!note.isOwner && note.permission && (
          <span className="permission">{note.permission}</span>
        )}
      </div>
      {note.isOwner && onDelete && (
        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
