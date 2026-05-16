import React, { useState } from "react";
import { Notebook } from "@/store/notebookSlice";
import styles from "./NotebookPanel.module.css";

interface NotebookPanelProps {
  notebooks: Notebook[];
  currentNotebook?: Notebook;
  onSelectNotebook?: (notebook: Notebook) => void;
  onCreateNotebook?: (name: string) => void;
  isCreating?: boolean;
  onToggleCreating?: (value: boolean) => void;
  onRenameNotebook?: (notebookId: string, newName: string) => void;
  onDeleteNotebook?: (notebookId: string) => void;
}

export const NotebookPanel: React.FC<NotebookPanelProps> = ({
  notebooks,
  currentNotebook,
  onSelectNotebook,
  onCreateNotebook,
  isCreating = false,
  onToggleCreating,
  onRenameNotebook,
  onDeleteNotebook,
}) => {
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [notebookContextMenu, setNotebookContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    notebookId?: string;
  }>({ visible: false, x: 0, y: 0 });

  const handleCreate = (e: React.FormEvent | React.KeyboardEvent) => {
    if (e.preventDefault) {
      e.preventDefault();
    }

    if (newName.trim()) {
      console.log('[NotebookPanel] create triggered:', newName.trim());
      onCreateNotebook?.(newName.trim());
      setNewName("");
      onToggleCreating?.(false);
    }
  };

  const handleSaveRename = (_notebookId?: string) => {
    if (renameValue.trim() && _notebookId) {
      onRenameNotebook?.(_notebookId, renameValue.trim());
      setRenamingId(null);
      setRenameValue("");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header} onContextMenu={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Блокноты</h2>
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
            onBlur={() => {
              if (!newName.trim()) {
                onToggleCreating?.(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate(e);
              }
            }}
          />
        </form>
      )}

      <div
        className={styles.list}
        onContextMenu={(e) => {
          e.preventDefault();
          // Only show create menu when right-clicking empty area (not on a notebook item)
          if ((e.target as HTMLElement).className === styles.list) {
            setNotebookContextMenu({ visible: false, x: 0, y: 0 });
            setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
          }
        }}
      >
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            className={`${styles.item} ${
              currentNotebook?.id === notebook.id ? styles.active : ""
            }`}
            onClick={() => onSelectNotebook?.(notebook)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Close create menu, open notebook-specific menu
              setContextMenu({ visible: false, x: 0, y: 0 });
              setNotebookContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                notebookId: notebook.id,
              });
            }}
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

      {contextMenu.visible && (
        <div
          className={styles.contextMenuOverlay}
          onClick={() => {
            setContextMenu({ visible: false, x: 0, y: 0 });
            setNotebookContextMenu({ visible: false, x: 0, y: 0 });
          }}
        >
          <div
            className={styles.contextMenu}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                onToggleCreating?.(true);
                setContextMenu({ visible: false, x: 0, y: 0 });
                setNotebookContextMenu({ visible: false, x: 0, y: 0 });
              }}
            >
              Создать блокнот
            </button>
          </div>
        </div>
      )}

      {notebookContextMenu.visible && (
        <div
          className={styles.contextMenuOverlay}
          onClick={() => {
            setContextMenu({ visible: false, x: 0, y: 0 });
            setNotebookContextMenu({ visible: false, x: 0, y: 0 });
          }}
        >
          <div
            className={styles.contextMenu}
            style={{
              left: notebookContextMenu.x,
              top: notebookContextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                if (notebookContextMenu.notebookId) {
                  setRenamingId(notebookContextMenu.notebookId);
                  setRenameValue(
                    notebooks.find((n) => n.id === notebookContextMenu.notebookId)
                      ?.name || ""
                  );
                }
                setContextMenu({ visible: false, x: 0, y: 0 });
                setNotebookContextMenu({ visible: false, x: 0, y: 0 });
              }}
            >
              Переименовать блокнот
            </button>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                if (notebookContextMenu.notebookId) {
                  onDeleteNotebook?.(notebookContextMenu.notebookId);
                }
                setContextMenu({ visible: false, x: 0, y: 0 });
                setNotebookContextMenu({ visible: false, x: 0, y: 0 });
              }}
            >
              Удалить блокнот
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
