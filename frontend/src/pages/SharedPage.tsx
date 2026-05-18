import React, { useState } from "react";
import styles from "./SharedPage.module.css";
import { WorkspacesPanel } from "@/components/layout/WorkspacesPanel/WorkspacesPanel";

interface SharedItem {
  id: string;
  name: string;
  type: "workspace" | "notebook";
  owner?: string;
  permission?: string;
}

export const SharedPage: React.FC = () => {
  const [/* selectedWorkspaceId */ , /* setSelectedWorkspaceId */] = useState<string | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [pendingShareTarget, setPendingShareTarget] = useState<null | { type: string; id: string }>(null);

  // TODO: replace with real workspaces from hook
  const demoWorkspaces = [
    { id: "ws-1", name: "Моя рабочая 1" },
    { id: "ws-2", name: "Моя рабочая 2" },
    { id: "ws-3", name: "Моя рабочая 3" },
  ];

  const handleSelectWorkspace = (_ws: any) => {
    // noop for demo
  };

  // drops are handled inline on right column

  const handleConfirmShare = (payload: { emails: string[]; permission: string }) => {
    // For quick UI: add to local shared list
    if (!pendingShareTarget) return;
    setSharedItems((s) => [
      ...s,
      {
        id: pendingShareTarget.id,
        name: pendingShareTarget.type === "workspace" ? `Workspace ${pendingShareTarget.id}` : `Notebook ${pendingShareTarget.id}`,
        type: pendingShareTarget.type as any,
        owner: "you",
        permission: payload.permission,
      },
    ]);
    setIsShareModalOpen(false);
    setPendingShareTarget(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <h3>Собственные рабочие области</h3>
        <WorkspacesPanel
          workspaces={demoWorkspaces}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={undefined}
          onRenameWorkspace={undefined}
          onDeleteWorkspace={undefined}
        />
      </div>

      <div className={styles.rightColumn} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("application/collabnotes");
        if (!raw) return;
        try {
          const data = JSON.parse(raw);
          // accept drops
          setPendingShareTarget(data);
          setIsShareModalOpen(true);
        } catch (err) {
          console.error('SharedPage drop parse error', err);
        }
      }}>
        <h3>Общие рабочие области и блокноты</h3>
        <div className={styles.sharedList}>
          {sharedItems.length === 0 ? (
            <div className={styles.empty}>Перетащите рабочую область сюда, чтобы поделиться</div>
          ) : (
            sharedItems.map((s) => (
              <div key={`${s.type}-${s.id}`} className={styles.sharedItem}>
                <div className={styles.sharedTitle}>{s.name}</div>
                <div className={styles.sharedMeta}>{s.type} • {s.permission} • {s.owner}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {isShareModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsShareModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4>Поделиться</h4>
            <p>Тип: {pendingShareTarget?.type}</p>
            <p>ID: {pendingShareTarget?.id}</p>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmShare({ emails: ["demo@example.com"], permission: "WRITE" }); }}>
              <label>Участники (email)</label>
              <input type="text" placeholder="Введите e‑mail" />
              <label>Роль</label>
              <select defaultValue="WRITE">
                <option value="READ">READ</option>
                <option value="WRITE">WRITE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsShareModalOpen(false)}>Отмена</button>
                <button type="submit">Поделиться</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPage;
