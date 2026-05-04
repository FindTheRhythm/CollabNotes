import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import { userAPI } from "@/api/user.ts";
import { IUser } from "@/types/index.ts";
import { UserList } from "@/components/Users/UserList.tsx";

export default function AdminPage(): React.ReactElement {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await userAPI.getAll(currentPage, 20);
      setUsers(result.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="admin-page">
        <h1>User Management</h1>

        <UserList
          users={users}
          isLoading={isLoading}
        />

        {users.length > 0 && (
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
