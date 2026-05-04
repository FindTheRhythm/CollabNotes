import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.ts";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="main-layout">
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            CollabNotes
          </Link>

          <nav className="navbar-menu">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/notes">Notes</Link>
                <Link to="/profile">Profile</Link>
                {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
              </>
            )}
          </nav>

          <div className="navbar-user">
            {isAuthenticated ? (
              <>
                <span className="user-greeting">Hi, {user?.username}</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>&copy; 2024 CollabNotes. All rights reserved.</p>
      </footer>
    </div>
  );
}
