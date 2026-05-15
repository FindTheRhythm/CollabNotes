import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { NoteEditor } from "@/components/Notes/NoteEditor";
import { CommentList } from "@/components/Comments/CommentList";
import { commentAPI } from "@/api/comment";
import { IComment } from "@/types";

export default function NoteDetailsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { currentNote, isLoading, fetchNoteById, updateNoteContent } = useNotes();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNoteById(id);
      loadComments();
    }
  }, [id]);

  const loadComments = async (): Promise<void> => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const data = await commentAPI.getNoteComments(id);
      setComments(data);
    } catch (error) {
      showError(error, "Failed to Load Comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSaveNote = async (title: string, content: string): Promise<void> => {
    try {
      if (id) {
        await updateNoteContent(id, title, content);
        showSuccess("Note updated successfully!");
      }
    } catch (error) {
      showError(error, "Failed to Update Note");
    }
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      await commentAPI.create(id, newComment);
      setNewComment("");
      showSuccess("Comment added successfully!");
      await loadComments();
    } catch (error) {
      showError(error, "Failed to Add Comment");
    }
  };

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    try {
      await commentAPI.delete(commentId);
      showSuccess("Comment deleted successfully!");
      await loadComments();
    } catch (error) {
      showError(error, "Failed to Delete Comment");
    }
  };

  if (isLoading) {
    return <MainLayout><div className="loading">Loading note...</div></MainLayout>;
  }

  if (!currentNote) {
    return <MainLayout><div className="error">Note not found</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="note-details-page">
        <h1>{currentNote.title}</h1>

        {currentNote.isOwner && (
          <NoteEditor
            note={currentNote}
            onSave={handleSaveNote}
            isLoading={isLoading}
          />
        )}

        {!currentNote.isOwner && (
          <div className="note-view">
            <p>{currentNote.content}</p>
          </div>
        )}

        <div className="note-comments">
          <h2>Comments</h2>

          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
            />
            <button type="submit" disabled={!newComment.trim() || commentsLoading}>
              Add Comment
            </button>
          </form>

          <CommentList
            comments={comments}
            currentUserId={user?.id || ""}
            onDelete={handleDeleteComment}
            isLoading={commentsLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
}
