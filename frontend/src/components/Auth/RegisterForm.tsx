import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const log = {
  info: (msg: string, data?: any) => console.log(`[REGISTER FORM] ${msg}`, data || ""),
  error: (msg: string, data?: any) => console.error(`[REGISTER FORM ERROR] ${msg}`, data || ""),
  debug: (msg: string, data?: any) => console.log(`[REGISTER FORM DEBUG] ${msg}`, data || ""),
};

export function RegisterForm(): React.ReactElement {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { showError, showSuccess, showValidationError } = useToast();
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    log.debug(`Input change: ${name}`, { value: name === 'password' ? '***' : value });
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    log.info("Form submit", { email: formData.email, username: formData.username });
    
    try {
      log.debug("Calling register hook...");
      await register(formData.email, formData.username, formData.password);
      log.info("Register hook completed successfully");
      showSuccess("Registration successful! Redirecting to dashboard...");
      log.info("Navigating to dashboard...");
      navigate("/dashboard");
    } catch (error: any) {
      log.error("Form submit error", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Check if it's a validation error
      if ((error as any)?.response?.data?.errors) {
        log.debug("Validation error detected");
        showValidationError(error);
      } else {
        log.debug("General error detected");
        showError(error, "Registration Failed");
      }
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
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          minLength={3}
          maxLength={30}
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
          minLength={8}
          required
          disabled={isLoading}
        />
        <small>Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character</small>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
