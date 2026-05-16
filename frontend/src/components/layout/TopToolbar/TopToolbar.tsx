import React from "react";
import { useUIState } from "@/hooks";
import styles from "./TopToolbar.module.css";
import { Workspace } from "@/store/workspaceSlice";

interface TopToolbarProps {
  workspace?: Workspace;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
  onThemeToggle?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  workspace,
  onSearchClick,
  onSettingsClick,
  onThemeToggle,
}) => {
  const { theme, toggleTheme } = useUIState();

  const handleThemeToggle = () => {
    toggleTheme();
    onThemeToggle?.();
  };

  return (
    <div className={`${styles.toolbar} ${styles[theme]}`}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
          </svg>
        </div>
        
        {workspace && (
          <div className={styles.workspaceInfo}>
            <span className={styles.workspaceName}>{workspace.name}</span>
          </div>
        )}
      </div>

      <div className={styles.center}>
        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Поиск..."
            className={styles.searchInput}
            onClick={onSearchClick}
          />
          <kbd className={styles.searchHint}>⌘K</kbd>
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconButton}
          onClick={onSettingsClick}
          title="Параметры"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>

        <button
          className={styles.themeButton}
          onClick={handleThemeToggle}
          title={`Переключить на ${theme === "dark" ? "светлую" : "тёмную"} тему`}
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
          <span className={styles.themeLabel}>
            {theme === "dark" ? "Светлая" : "Тёмная"}
          </span>
        </button>

        <button className={styles.avatar} title="Профиль">
          <span className={styles.initials}>VS</span>
        </button>
      </div>
    </div>
  );
};
