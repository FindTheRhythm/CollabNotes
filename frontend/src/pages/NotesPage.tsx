import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import { useNotes } from "@/hooks/useNotes.ts";
import { NoteList } from "@/components/Notes/NoteList.tsx";
import { NoteToolbar } from "@/components/Notes/NoteToolbar.tsx";
import { NoteEditor } from "@/components/Notes/NoteEditor.tsx";

export default function NotesPage(): React.ReactElement {
  const { notes, isLoading, error, fetchUserNotes, createNote, removeNote } = useNotes();
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUserNotes(currentPage);
  }, [currentPage]);

  const handleCreateNote = (): void => {
    setShowEditor(true);
  };

  const handleSaveNote = async (title: string, content: string): Promise<void> => {
    await createNote(title, content);
    setShowEditor(false);
    fetchUserNotes(1);
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    await removeNote(noteId);
  };

  return (
    <MainLayout>
      <div className="notes-page">
        <h1>My Notes</h1>

        {error && <div className="error-message">{error}</div>}

        <NoteToolbar
          onSearch={() => {}}
          onCreateNew={handleCreateNote}
          isLoading={isLoading}
        />

        {showEditor && (
          <NoteEditor
            onSave={handleSaveNote}
            isLoading={isLoading}
          />
        )}

        <NoteList
          notes={notes}
          isLoading={isLoading}
          onDelete={handleDeleteNote}
        />

        {notes.length > 0 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
