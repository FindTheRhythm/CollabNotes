import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUIState } from "@/hooks/useUIState";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useUIState();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Переключить тему">
              {theme === "dark" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 1}}>
                  <circle cx="12" cy="12" r="6"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 1}}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
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
        <p>&copy; 2026 CollabNotes FindTheRhythm. All rights reserved.</p>
      </footer>
    </div>
  );
}
