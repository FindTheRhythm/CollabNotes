import React from "react";
import styles from "./TopToolbar.module.css";
import { Workspace } from "@/store/workspaceSlice";

interface TopToolbarProps {
  workspace?: Workspace;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  workspace,
  onSearchClick,
  onSettingsClick,
}) => {
  return (
    <div className={styles.toolbar}>
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
      </div>
    </div>
  );
};
