import React from "react";
import { IUser } from "@/types";
import { UserCard } from "@/components/Users/UserCard";

interface UserListProps {
  users: IUser[];
  isLoading: boolean;
  onSelectUser?: (userId: string) => void;
}

export function UserList({ users, isLoading, onSelectUser }: UserListProps): React.ReactElement {
  if (isLoading) {
    return <div className="loading">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="no-users">No users found</div>;
  }

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} onSelect={onSelectUser} />
      ))}
    </div>
  );
}
