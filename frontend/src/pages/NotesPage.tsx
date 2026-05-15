import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/useToast";
import { NoteList } from "@/components/Notes/NoteList";
import { NoteToolbar } from "@/components/Notes/NoteToolbar";
import { NoteEditor } from "@/components/Notes/NoteEditor";

export default function NotesPage(): React.ReactElement {
  const { notes, isLoading, error, fetchUserNotes, createNote, removeNote } = useNotes();
  const { showError, showSuccess } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Show error notification when error state changes
  useEffect(() => {
    if (error) {
      showError(new Error(error), "Notes Operation Failed");
    }
  }, [error, showError]);

  useEffect(() => {
    fetchUserNotes(currentPage);
  }, [currentPage]);

  const handleCreateNote = (): void => {
    setShowEditor(true);
  };

  const handleSaveNote = async (title: string, content: string): Promise<void> => {
    try {
      await createNote(title, content);
      setShowEditor(false);
      showSuccess("Note created successfully!");
      fetchUserNotes(1);
    } catch (error) {
      showError(error, "Failed to Create Note");
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    try {
      await removeNote(noteId);
      showSuccess("Note deleted successfully!");
    } catch (error) {
      showError(error, "Failed to Delete Note");
    }
  };

  return (
    <MainLayout>
      <div className="notes-page">
        <h1>My Notes</h1>

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
