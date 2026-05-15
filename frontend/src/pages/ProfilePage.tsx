import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage(): React.ReactElement {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="profile-page">
        <h1>User Profile</h1>

        {user && (
          <div className="profile-info">
            <div className="profile-field">
              <label>Username</label>
              <p>{user.username}</p>
            </div>

            <div className="profile-field">
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            <div className="profile-field">
              <label>Role</label>
              <p>{user.role}</p>
            </div>

            <div className="profile-field">
              <label>Joined</label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="profile-field">
              <label>Last Updated</label>
              <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
