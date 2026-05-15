import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginForm } from "@/components/Auth/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="auth-page">
        <div className="auth-container">
          <h1>Login to CollabNotes</h1>
          <LoginForm />
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
