import React from "react";
import { IUser } from "@/types/index.ts";

interface UserCardProps {
  user: IUser;
  onSelect?: (userId: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps): React.ReactElement {
  return (
    <div className="user-card">
      <h4>{user.username}</h4>
      <p className="user-email">{user.email}</p>
      <p className="user-role">{user.role}</p>
      {onSelect && (
        <button onClick={() => onSelect(user.id)}>
          Select
        </button>
      )}
    </div>
  );
}
