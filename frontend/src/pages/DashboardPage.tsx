import React from "react";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import { useAuth } from "@/hooks/useAuth.ts";

export default function DashboardPage(): React.ReactElement {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <MainLayout><div className="loading">Loading dashboard...</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="dashboard-page">
        <h1>Welcome to CollabNotes</h1>
        <p>Hello, {user?.username}!</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Your Role</h3>
            <p>{user?.role}</p>
          </div>
          <div className="stat-card">
            <h3>Email</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="dashboard-info">
          <h2>Getting Started</h2>
          <ul>
            <li>Create a new note to get started</li>
            <li>Share notes with other users</li>
            <li>Collaborate in real-time</li>
            <li>Add comments to discuss changes</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
