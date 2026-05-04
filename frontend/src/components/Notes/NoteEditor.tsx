import React, { useState } from "react";
import { INoteWithAccess } from "@/types/index.ts";

interface NoteEditorProps {
  note?: INoteWithAccess;
  onSave: (title: string, content: string) => Promise<void>;
  isLoading: boolean;
}

export function NoteEditor({ note, onSave, isLoading }: NoteEditorProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await onSave(title, content);
  };

  return (
    <form onSubmit={handleSubmit} className="note-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        required
        disabled={isLoading}
        className="note-title-input"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content"
        disabled={isLoading}
        className="note-content-input"
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Note"}
      </button>
    </form>
  );
}
