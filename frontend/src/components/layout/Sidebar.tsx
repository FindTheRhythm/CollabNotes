import React from "react";

interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-header">Notebooks</div>
      <div className="sidebar-content">{children}</div>
    </aside>
  );
};

export default Sidebar;
