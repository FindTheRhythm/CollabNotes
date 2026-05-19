import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface ProfileFormState {
  username: string;
  email: string;
}

export default function ProfilePage(): React.ReactElement {
  const { user, isLoading, updateProfile } = useAuth();
  const { showError, showSuccess, showInfo, showValidationError } = useToast();
  const [form, setForm] = useState<ProfileFormState>({ username: "", email: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      username: user.username,
      email: user.email
    });
    setHasChanges(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHasChanges(false);
      return;
    }

    setHasChanges(
      form.username.trim() !== user.username || form.email.trim() !== user.email
    );
  }, [form, user]);

  const handleChange = (field: keyof ProfileFormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!hasChanges) {
      showInfo("No changes to save.", "Nothing changed");
      return;
    }

    setIsSaving(true);

    try {
      const updates = {
        username: form.username.trim(),
        email: form.email.trim()
      };

      await updateProfile(updates);
      showSuccess("Your profile has been updated.", "Profile saved");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        showValidationError(error);
      } else {
        showError(error, "Unable to save profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Update your username or email address and save to keep your account details current.</p>
        </div>

        {!user ? (
          <div className="profile-loading">Loading profile...</div>
        ) : (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-card">
              <div className="profile-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(event) => handleChange("username", event.target.value)}
                  placeholder="Enter username"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Role</label>
                <input type="text" value={user.role} readOnly />
              </div>

              <div className="profile-field">
                <label>Joined</label>
                <input type="text" value={new Date(user.createdAt).toLocaleDateString()} readOnly />
              </div>

              <div className="profile-field">
                <label>Last Updated</label>
                <input type="text" value={new Date(user.updatedAt).toLocaleDateString()} readOnly />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="button button-primary" disabled={isSaving || isLoading || !hasChanges}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
