import React, { useState } from "react";
import { Notebook } from "@/store/notebookSlice";
import styles from "./NotebookPanel.module.css";

interface NotebookPanelProps {
  notebooks: Notebook[];
  currentNotebook?: Notebook;
  onSelectNotebook?: (notebook: Notebook) => void;
  onCreateNotebook?: (name: string) => void;
  onContextMenu?: (
    e: React.MouseEvent,
    notebook: Notebook
  ) => void;
}

export const NotebookPanel: React.FC<NotebookPanelProps> = ({
  notebooks,
  currentNotebook,
  onSelectNotebook,
  onCreateNotebook,
  onContextMenu,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateNotebook?.(newName);
      setNewName("");
      setIsCreating(false);
    }
  };

  const handleSaveRename = (_notebookId?: string) => {
    if (renameValue.trim()) {
      setRenamingId(null);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Блокноты</h2>
        <button
          className={styles.addButton}
          onClick={() => setIsCreating(true)}
          title="Создать блокнот"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {isCreating && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            type="text"
            className={styles.createInput}
            placeholder="Название блокнота"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            onBlur={() => !newName && setIsCreating(false)}
          />
        </form>
      )}

      <div className={styles.list}>
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            className={`${styles.item} ${
              currentNotebook?.id === notebook.id ? styles.active : ""
            }`}
            onClick={() => onSelectNotebook?.(notebook)}
            onContextMenu={(e) => onContextMenu?.(e, notebook)}
          >
            {renamingId === notebook.id ? (
              <input
                type="text"
                className={styles.renameInput}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleSaveRename(notebook.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveRename(notebook.id);
                  } else if (e.key === "Escape") {
                    setRenamingId(null);
                  }
                }}
                autoFocus
              />
            ) : (
              <>
                {notebook.color && (
                  <span
                    className={styles.colorIndicator}
                    style={{ backgroundColor: notebook.color }}
                  />
                )}
                <span className={styles.name}>{notebook.name}</span>
                <span className={styles.collaborators}>
                  {notebook.collaborators.length > 0 && (
                    <span className={styles.collaboratorCount}>
                      +{notebook.collaborators.length}
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
