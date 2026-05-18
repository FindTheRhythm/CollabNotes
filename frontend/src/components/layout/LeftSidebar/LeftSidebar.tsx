import React from "react";
import styles from "./LeftSidebar.module.css";

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}

interface LeftSidebarProps {
  items: SidebarItem[];
  onItemClick?: (itemId: string) => void;
  onItemContextMenu?: (itemId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onItemDrop?: (targetId: string, data: { type: string; id: string }) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  items,
  onItemClick,
  onItemContextMenu,
  collapsed = false,
  onCollapsedChange,
  onItemDrop,
}) => {
  const handleToggleCollapse = () => {
    onCollapsedChange?.(!collapsed);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarContent}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${item.active ? styles.active : ""}`}
            onClick={() => onItemClick?.(item.id)}
            onContextMenu={(e) => {
              onItemContextMenu?.(item.id, e);
            }}
            title={item.label}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("application/collabnotes");
              if (!raw) return;
              try {
                const data = JSON.parse(raw);
                onItemDrop?.(item.id, data);
              } catch (err) {
                console.error('LeftSidebar drop parse error', err);
              }
            }}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && item.badge !== undefined && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      <button
        className={styles.sidebarItem}
        onClick={handleToggleCollapse}
        title={collapsed ? "Развернуть" : "Свернуть"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          {collapsed ? (
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
          ) : (
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" />
          )}
        </svg>
      </button>
    </aside>
  );
};
