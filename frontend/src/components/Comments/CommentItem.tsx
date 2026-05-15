import React from "react";
import { IComment } from "@/types/index";

interface CommentItemProps {
  comment: IComment;
  isOwner: boolean;
  onDelete: (id: string) => void;
}

export function CommentItem({ comment, isOwner, onDelete }: CommentItemProps): React.ReactElement {
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
        {isOwner && (
          <button className="delete-btn" onClick={() => onDelete(comment.id)}>
            Delete
          </button>
        )}
      </div>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
}
