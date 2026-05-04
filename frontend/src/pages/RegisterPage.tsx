import React from "react";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import { RegisterForm } from "@/components/Auth/RegisterForm.tsx";
import { Link } from "react-router-dom";

export default function RegisterPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="auth-page">
        <div className="auth-container">
          <h1>Register for CollabNotes</h1>
          <RegisterForm />
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
