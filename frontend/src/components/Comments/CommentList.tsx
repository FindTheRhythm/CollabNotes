import React from "react";
import { IComment } from "@/types/index.ts";
import { CommentItem } from "@/components/Comments/CommentItem.tsx";

interface CommentListProps {
  comments: IComment[];
  currentUserId: string;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function CommentList({ comments, currentUserId, onDelete, isLoading }: CommentListProps): React.ReactElement {
  if (isLoading) {
    return <div className="loading">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return <div className="no-comments">No comments yet</div>;
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={comment.userId === currentUserId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
