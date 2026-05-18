import React, { useState } from "react";
import styles from "./WorkspacesPanel.module.css";

export interface WorkspaceItem {
  id: string;
  name: string;
  color?: string;
}

interface WorkspacesPanelProps {
  workspaces: WorkspaceItem[];
  currentWorkspace?: WorkspaceItem;
  onSelectWorkspace?: (workspace: WorkspaceItem) => void;
  onCreateWorkspace?: (name: string) => void;
  onRenameWorkspace?: (workspaceId: string, newName: string) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  className?: string;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#85C1E2',
  '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#A8D8EA'
];

export const WorkspacesPanel: React.FC<WorkspacesPanelProps> = ({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  className,
  width = 224,
  onResizeStart,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, workspaceId: "" });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handlePanelContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      workspaceId: "",
    });
  };

  const handleCreateFromMenu = () => {
    setIsCreating(true);
    setContextMenu({ visible: false, x: 0, y: 0, workspaceId: "" });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateWorkspace?.(newName.trim());
      setNewName("");
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      setRenamingId(id);
      setRenameValue(workspace.name);
      setContextMenu({ visible: false, x: 0, y: 0, workspaceId: "" });
    }
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenameWorkspace?.(renamingId, renameValue.trim());
      setRenamingId(null);
      setRenameValue("");
    }
  };

  const handleDelete = (id: string) => {
    onDeleteWorkspace?.(id);
    setContextMenu({ visible: false, x: 0, y: 0, workspaceId: "" });
  };

  const handleContextMenu = (e: React.MouseEvent, workspaceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      workspaceId,
    });
  };

  const getWorkspaceColor = (workspaceId: string, index: number): string => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace?.color) return workspace.color;
    return COLORS[index % COLORS.length];
  };

  const handleDragStart = (e: React.DragEvent, workspaceId: string) => {
    setDraggedId(workspaceId);
    e.dataTransfer.effectAllowed = "move";
    const payload = JSON.stringify({ type: "workspace", id: workspaceId });
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.setData("application/collabnotes", payload);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className={`${styles.panel} ${className || ""}`} style={{ width: `${width}px` }}>
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

      <div className={styles.header}>
        <h2 className={styles.title}>Рабочие области</h2>
      </div>

      {isCreating && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            type="text"
            className={styles.createInput}
            placeholder="Название рабочей области"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            onBlur={() => {
              if (!newName.trim()) {
                setIsCreating(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate(e);
              } else if (e.key === "Escape") {
                setIsCreating(false);
                setNewName("");
              }
            }}
          />
        </form>
      )}

      <div className={styles.workspacesGrid} onContextMenu={handlePanelContextMenu}>
        {workspaces.map((workspace, index) => (
          <div key={workspace.id}>
            {renamingId === workspace.id ? (
              <input
                type="text"
                className={styles.renameInput}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  } else if (e.key === "Escape") {
                    setRenamingId(null);
                    setRenameValue("");
                  }
                }}
              />
            ) : (
            <div
                draggable
                className={`${styles.workspaceTile} ${
                  currentWorkspace?.id === workspace.id ? styles.active : ""
                } ${draggedId === workspace.id ? styles.dragging : ""}`}
                onClick={() => onSelectWorkspace?.(workspace)}
                onContextMenu={(e) => handleContextMenu(e, workspace.id)}
                onDragStart={(e) => handleDragStart(e, workspace.id)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={styles.workspaceColor}
                  style={{
                    backgroundColor: getWorkspaceColor(workspace.id, index),
                  }}
                />
                <span className={styles.workspaceName}>{workspace.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu.visible && (
        <div
          className={styles.contextMenuOverlay}
          onClick={() => setContextMenu({ visible: false, x: 0, y: 0, workspaceId: "" })}
        >
          <div
            className={styles.contextMenu}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.workspaceId ? (
              <>
                <button
                  type="button"
                  className={styles.contextMenuItem}
                  onClick={() => handleRename(contextMenu.workspaceId)}
                >
                  Переименовать
                </button>
                <button
                  type="button"
                  className={styles.contextMenuItem}
                  onClick={() => handleDelete(contextMenu.workspaceId)}
                >
                  Удалить
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.contextMenuItem}
                onClick={handleCreateFromMenu}
              >
                Создать рабочую область
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
