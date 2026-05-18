import React, { useEffect, useState } from "react";
import styles from "./SharedPage.module.css";
import { WorkspacesPanel } from "@/components/layout/WorkspacesPanel/WorkspacesPanel";
import { useWorkspaceManagement } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/client";

interface SharedItem {
  id: string;
  name: string;
  type: "workspace" | "notebook";
  owner?: string;
  permission?: string;
}

export const SharedPageReal: React.FC = () => {
  const { workspaces, loadWorkspaces } = useWorkspaceManagement();
  const { user } = useAuth();

  const [ownWorkspaces, setOwnWorkspaces] = useState<any[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);

  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [pendingShareTarget, setPendingShareTarget] = useState<null | { type: string; id: string }>(null);

  // user search & selection
  const [allUsers, setAllUsers] = useState<Array<{ id: string; email: string; name?: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; email: string; name?: string }>>([]);
  const [shareRole, setShareRole] = useState<string>("WRITE");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    // compute own (not-shared) workspaces: owner === current user && no extra members
    const load = async () => {
      if (!workspaces || !user) return;
      setLoadingOwn(true);
      try {
        const owned = workspaces.filter((w: any) => w.ownerId === user.id);
        // Пока убираем дополнительную проверку участников, чтобы быстрее отобразить воркспейсы
        setOwnWorkspaces(owned);
      } finally {
        setLoadingOwn(false);
      }
    };
    load();
  }, [workspaces, user]);

  const normalizeResourceType = (type: string): "WORKSPACE" | "NOTEBOOK" | "NOTE" => {
    switch (type.toLowerCase()) {
      case "workspace":
        return "WORKSPACE";
      case "notebook":
        return "NOTEBOOK";
      case "note":
        return "NOTE";
      default:
        return "WORKSPACE";
    }
  };

  const handleSelectWorkspace = (ws: any) => {
    setPendingShareTarget({ type: "WORKSPACE", id: ws.id });
    setIsShareModalOpen(true);
  };

  const handleDrop = (data: any) => {
    setPendingShareTarget({ type: normalizeResourceType(data.type), id: data.id });
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return;

      try {
        const resp = await api.get(`/users/search`, { params: { query: "", limit: 100 } });
        const payload = resp.data.data;
        const list = Array.isArray(payload)
          ? payload
          : payload?.users ?? [];
        setAllUsers(list.filter((u: { id: string }) => u.id !== user.id));
      } catch (err) {
        console.error("Failed to load users", err);
        setAllUsers([]);
      }
    };

    loadUsers();
  }, [user]);

  const handleSelectedUsersChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(event.target.selectedOptions).map((option) => option.value);
    const selected = allUsers.filter((user) => selectedIds.includes(user.id));
    setSelectedUsers(selected);
  };

  const removeSelectedUser = (email: string) => {
    setSelectedUsers((s) => s.filter((x) => x.email !== email));
  };

  const handleConfirmShare = async () => {
    if (!pendingShareTarget) return;
    const userIds = selectedUsers.map((s) => s.id);
    if (userIds.length === 0) {
      setFeedback("Выберите хотя бы одного участника");
      return;
    }
    try {
      await Promise.all(
        userIds.map((userId) =>
          api.post(`/access/share`, {
            resourceType: pendingShareTarget.type,
            resourceId: pendingShareTarget.id,
            userId,
            permission: shareRole,
          })
        )
      );

      setSharedItems((s) => [
        ...s,
        {
          id: pendingShareTarget.id,
          name:
            pendingShareTarget.type === "WORKSPACE"
              ? `Workspace ${pendingShareTarget.id}`
              : pendingShareTarget.type === "NOTEBOOK"
              ? `Notebook ${pendingShareTarget.id}`
              : `Note ${pendingShareTarget.id}`,
          type: pendingShareTarget.type as any,
          owner: "you",
          permission: shareRole,
        },
      ]);

      setFeedback("Шеринг успешно создан");
      setTimeout(() => setFeedback(null), 3000);
      setIsShareModalOpen(false);
      setPendingShareTarget(null);
      setSelectedUsers([]);
    } catch (err: any) {
      console.error("Share failed", err);
      setFeedback(err?.response?.data?.message || "Ошибка шаринга");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <h3>Собственные рабочие области</h3>
        <div style={{fontSize:12, color:'#666', marginBottom:8}}>
          <div>Всего воркспейсов: {workspaces?.length ?? 0}</div>
          <div>Отфильтровано для шаринга: {ownWorkspaces.length}</div>
        </div>
        {loadingOwn ? (
          <div>Загрузка...</div>
        ) : (
          <WorkspacesPanel
            workspaces={ownWorkspaces}
            onSelectWorkspace={handleSelectWorkspace}
            onCreateWorkspace={undefined}
            onRenameWorkspace={undefined}
            onDeleteWorkspace={undefined}
          />
        )}
      </div>

      <div
        className={styles.rightColumn}
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const raw = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("application/collabnotes");
          if (!raw) return;
          try {
            const data = JSON.parse(raw);
            handleDrop(data);
          } catch (err) {
            console.error('SharedPage drop parse error', err);
          }
        }}
      >
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

            <label>Выберите участников</label>
            <select
              multiple
              value={selectedUsers.map((u) => u.id)}
              onChange={handleSelectedUsersChange}
              style={{ width: "100%", minHeight: 140, marginBottom: 12 }}
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}{u.name ? ` · ${u.name}` : ""}
                </option>
              ))}
            </select>

            {allUsers.length === 0 && <div>Пользователи не загружены или отсутствуют.</div>}

            <label>Выбранные</label>
            <div className={styles.tagsRow}>
              {selectedUsers.map((s) => (
                <span key={s.email} className={styles.tag}>
                  {s.email}
                  <button onClick={() => removeSelectedUser(s.email)}>×</button>
                </span>
              ))}
            </div>

            <label>Роль</label>
            <select value={shareRole} onChange={(e) => setShareRole(e.target.value)}>
              <option value="READ">READ</option>
              <option value="WRITE">WRITE</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {feedback && <div className={styles.feedback}>{feedback}</div>}

            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsShareModalOpen(false)}>Отмена</button>
              <button type="button" onClick={handleConfirmShare}>Поделиться</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPageReal;
