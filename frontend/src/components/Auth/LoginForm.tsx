import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export function LoginForm(): React.ReactElement {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Show error notification when error state changes
  useEffect(() => {
    if (error) {
      showError(new Error(error), "Login Failed");
    }
  }, [error, showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      showSuccess("Login successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      showError(error, "Login Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
