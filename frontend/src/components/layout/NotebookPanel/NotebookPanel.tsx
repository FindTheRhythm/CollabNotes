import React, { useState } from "react";
import { Notebook } from "@/store/notebookSlice";
import styles from "./NotebookPanel.module.css";

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
  '#FFD3B6', '#FFAAA5', '#FF8B94', '#A8D8EA', '#C4B5E0'
];

interface NotebookPanelProps {
  notebooks: Notebook[];
  currentNotebook?: Notebook;
  workspaceName?: string;
  onSelectNotebook?: (notebook: Notebook) => void;
  onCreateNotebook?: (name: string) => void;
  isCreating?: boolean;
  onToggleCreating?: (value: boolean) => void;
  onRenameNotebook?: (notebookId: string, newName: string) => void;
  onDeleteNotebook?: (notebookId: string) => void;
  onReorder?: (notebookIds: string[]) => void;
  className?: string;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export const NotebookPanel: React.FC<NotebookPanelProps> = ({
  notebooks,
  currentNotebook,
  workspaceName,
  onSelectNotebook,
  onCreateNotebook,
  isCreating = false,
  onToggleCreating,
  onRenameNotebook,
  onDeleteNotebook,
  onReorder,
  className,
  width = 200,
  onResizeStart,
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

  const getNotebookColor = (notebookId: string, index: number): string => {
    const notebook = notebooks.find(n => n.id === notebookId);
    if (notebook?.color) return notebook.color;
    return COLORS[index % COLORS.length];
  };

  return (
    <div className={`${styles.panel} ${className || ""}`} style={{ width: `${width}px` }}>
      {workspaceName && (
        <div className={styles.workspaceHeader}>
          <div className={styles.workspaceTitle}>Рабочая область</div>
          <div className={styles.workspaceNameDisplay}>{workspaceName}</div>
        </div>
      )}

      <div className={styles.header} onContextMenu={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Блокноты</h2>
      </div>

      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          right: -4,
          top: 0,
          width: 8,
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
        }}
        onMouseDown={onResizeStart}
      />

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
        className={styles.notebooksGrid}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
        }}
      >
        {notebooks.map((notebook, idx) => (
          <div key={notebook.id}>
            {renamingId === notebook.id ? (
              <input
                type="text"
                className={styles.renameInput}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onBlur={() => handleSaveRename(notebook.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveRename(notebook.id);
                  } else if (e.key === "Escape") {
                    setRenamingId(null);
                    setRenameValue("");
                  }
                }}
              />
            ) : (
              <div
                draggable
                data-index={idx}
                className={`${styles.notebookTile} ${
                  currentNotebook?.id === notebook.id ? styles.active : ""
                }`}
                onClick={() => onSelectNotebook?.(notebook)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                  setNotebookContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    notebookId: notebook.id,
                  });
                }}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/collabnotes",
                    JSON.stringify({ type: "notebook", id: notebook.id })
                  );
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const raw = e.dataTransfer.getData("application/collabnotes");
                  if (!raw) return;
                  try {
                    const data = JSON.parse(raw);
                    if (data.type !== "notebook") return;
                    const ids = notebooks.map((n) => n.id);
                    const from = ids.indexOf(data.id);
                    const to = idx;
                    if (from === -1 || to === -1) return;
                    if (from === to) return;
                    ids.splice(from, 1);
                    ids.splice(to, 0, data.id);
                    onReorder?.(ids);
                  } catch (err) {
                    console.error('NotebookPanel drop parse error', err);
                  }
                }}
              >
                <div
                  className={styles.notebookColor}
                  style={{
                    backgroundColor: getNotebookColor(notebook.id, idx),
                  }}
                />
                <span className={styles.notebookName}>{notebook.name}</span>
              </div>
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
