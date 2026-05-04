import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/router/ProtectedRoute.tsx";

// Pages
import LoginPage from "@/pages/LoginPage.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import NotesPage from "@/pages/NotesPage.tsx";
import NoteDetailsPage from "@/pages/NoteDetailsPage.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";
import AdminPage from "@/pages/AdminPage.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";

export function AppRouter(): React.ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
