import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import { useNotes } from "@/hooks/useNotes.ts";
import { useAuth } from "@/hooks/useAuth.ts";
import { NoteEditor } from "@/components/Notes/NoteEditor.tsx";
import { CommentList } from "@/components/Comments/CommentList.tsx";
import { commentAPI } from "@/api/comment.ts";
import { IComment } from "@/types/index.ts";

export default function NoteDetailsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { currentNote, isLoading, fetchNoteById, updateNoteContent } = useNotes();
  const { user } = useAuth();
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
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSaveNote = async (title: string, content: string): Promise<void> => {
    if (id) {
      await updateNoteContent(id, title, content);
    }
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      await commentAPI.create(id, newComment);
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    try {
      await commentAPI.delete(commentId);
      await loadComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
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
