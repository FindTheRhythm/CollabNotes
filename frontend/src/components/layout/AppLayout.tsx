import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { LeftSidebar, SidebarItem } from "./LeftSidebar";
import { NotebookPanel } from "./NotebookPanel/NotebookPanel";
import { SectionPagePanel } from "./SectionPagePanel";
import { WorkspacesPanel } from "./WorkspacesPanel";
import { PageEditor } from "../editor";
import SharedPage from "@/pages/SharedPageReal";
import {
  useWorkspaceManagement,
  useNotebookManagement,
  usePageManagement,
} from "@/hooks";
import { setPages, setCurrentPage } from "@/store/pageSlice";
import styles from "./AppLayout.module.css";

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("notebooks");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isNotebookCreationOpen, setIsNotebookCreationOpen] = useState(false);
  
  // Panel widths
  const [workspacesPanelWidth, setWorkspacesPanelWidth] = useState(224);
  const [notebookPanelWidth, setNotebookPanelWidth] = useState(200);
  const [sectionPagePanelWidth, setSectionPagePanelWidth] = useState(224);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);

  // Load data
  const { currentWorkspace, loadWorkspaces, workspaces, createWorkspace, renameWorkspace, removeWorkspace, selectWorkspace } =
    useWorkspaceManagement();
  const { notebooks, currentNotebook, loadNotebooks, selectNotebook, createNotebook, renameNotebook, removeNotebook, reorderNotebooks } =
    useNotebookManagement();
  const {
    pages,
    currentPage,
    loadPages,
    loadPage: loadPageData,
    savePage,
    createNewPage,
    toggleFavorite,
    movePage,
    deletePage,
  } = usePageManagement();

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Load panel widths from localStorage
  useEffect(() => {
    const savedWorkspacesWidth = localStorage.getItem('workspacesPanelWidth');
    const savedNotebookWidth = localStorage.getItem('notebookPanelWidth');
    const savedSectionPageWidth = localStorage.getItem('sectionPagePanelWidth');
    
    if (savedWorkspacesWidth) setWorkspacesPanelWidth(parseInt(savedWorkspacesWidth));
    if (savedNotebookWidth) setNotebookPanelWidth(parseInt(savedNotebookWidth));
    if (savedSectionPageWidth) setSectionPagePanelWidth(parseInt(savedSectionPageWidth));
  }, []);

  // Mouse move handler for resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX;
      const minWidth = 150; // minimum panel width
      const maxWidth = 400; // maximum panel width

      if (isResizing === 'workspaces') {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, workspacesPanelWidth + delta));
        setWorkspacesPanelWidth(newWidth);
        localStorage.setItem('workspacesPanelWidth', newWidth.toString());
      } else if (isResizing === 'notebook') {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, notebookPanelWidth + delta));
        setNotebookPanelWidth(newWidth);
        localStorage.setItem('notebookPanelWidth', newWidth.toString());
      } else if (isResizing === 'sectionPage') {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, sectionPagePanelWidth + delta));
        setSectionPagePanelWidth(newWidth);
        localStorage.setItem('sectionPagePanelWidth', newWidth.toString());
      }

      setResizeStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartX, workspacesPanelWidth, notebookPanelWidth, sectionPagePanelWidth]);

  useEffect(() => {
    if (currentWorkspace) {
      loadNotebooks();
      dispatch(setPages([]));
      dispatch(setCurrentPage(null));
    }
  }, [currentWorkspace, loadNotebooks, dispatch]);

  useEffect(() => {
    if (currentNotebook) {
      console.log('[AppLayout] currentNotebook changed, loading pages:', { notebookId: currentNotebook.id });
      loadPages();
    }
  }, [currentNotebook, loadPages]);

  const handleSelectNotebook = (notebook: any) => {
    selectNotebook(notebook.id);
  };

  const handleSelectPage = (page: any) => {
    loadPageData(page.id);
  };

  const handleCreatePage = async (title: string) => {
    console.log('[AppLayout] handleCreatePage called:', { title });
    try {
      await createNewPage(title);
      console.log('[AppLayout] handleCreatePage completed successfully');
    } catch (error) {
      console.error('[AppLayout] handleCreatePage failed:', error);
    }
  };

  const handleSavePage = async (pageId: string, content: string) => {
    console.log('[AppLayout] handleSavePage called:', { pageId });
    try {
      await savePage(pageId, content);
      console.log('[AppLayout] handleSavePage completed successfully');
    } catch (error) {
      console.error('[AppLayout] handleSavePage failed:', error);
    }
  };

  const handleSidebarContextMenu = (
    itemId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // currently we don't open sidebar context menu for notebooks
    if (itemId === "notebooks") return;
    // other items may use context menu in future
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleSidebarDrop = (targetId: string, data: { type: string; id: string }) => {
    // if dropped on trash, delete corresponding item
    if (targetId === 'trash') {
      if (data.type === 'workspace') {
        removeWorkspace(data.id);
      } else if (data.type === 'notebook') {
        removeNotebook(data.id);
      } else if (data.type === 'page') {
        deletePage(data.id);
      }
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleContextCreateNotebook = () => {
    setIsNotebookCreationOpen(true);
    handleCloseContextMenu();
  };

  // No global fallback for notebooks; panels handle their own context interactions

  // Sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      id: "workspaces",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-1h2v19h-2zm4 4h2v15h-2z" />
        </svg>
      ),
      label: "Рабочие области",
      active: activeSection === "workspaces",
    },
    {
      id: "notebooks",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4V4m2 2v12h12V6H6z" />
        </svg>
      ),
      label: "Блокноты",
      active: activeSection === "notebooks",
    },
    {
      id: "recent",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
      ),
      label: "Недавние",
    },
    {
      id: "favorites",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
      label: "Избранные",
    },
    {
      id: "shared",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77C15.64 16.16 14.42 15 12.96 15 11.5 15 10.36 16.16 10.04 17.77c-.52-.47-1.2-.77-1.96-.77C6.72 16 5 17.88 5 20s1.72 4 3.84 4c2.02 0 3.68-1.43 3.98-3.33h1.36c.3 1.9 1.96 3.33 3.98 3.33 2.12 0 3.84-1.88 3.84-4s-1.72-4-3.84-4zm0-2c2.12 0 3.84-1.88 3.84-4s-1.72-4-3.84-4-3.84 1.88-3.84 4 1.72 4 3.84 4z" />
        </svg>
      ),
      label: "Общие",
    },
    {
      id: "trash",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
        </svg>
      ),
      label: "Корзина",
    },
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <div 
          className={`${styles.sidePanels} ${sidebarCollapsed ? styles.collapsed : ""}`}
          style={{
            width: sidebarCollapsed ? 72 : activeSection === "workspaces"
              ? 72 + workspacesPanelWidth + 1
              : 72 + notebookPanelWidth + sectionPagePanelWidth + 2,
          }}
        >
          <LeftSidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            onItemClick={(itemId) => {
              setActiveSection(itemId);
              handleCloseContextMenu();
            }}
            onItemContextMenu={handleSidebarContextMenu}
            onItemDrop={handleSidebarDrop}
          />

          {activeSection === "workspaces" && (
            <WorkspacesPanel
              workspaces={workspaces || []}
              currentWorkspace={currentWorkspace || undefined}
              onSelectWorkspace={(workspace) => {
                selectWorkspace(workspace.id);
                setActiveSection("notebooks");
                handleCloseContextMenu();
              }}
              onCreateWorkspace={async (name) => {
                await createWorkspace?.(name);
              }}
              onRenameWorkspace={async (id, name) => {
                await renameWorkspace?.(id, name);
              }}
              onDeleteWorkspace={async (id) => {
                await removeWorkspace?.(id);
              }}
              className={sidebarCollapsed ? "collapsed" : ""}
              width={workspacesPanelWidth}
              onResizeStart={(e) => {
                setIsResizing('workspaces');
                setResizeStartX(e.clientX);
              }}
            />
          )}

          {activeSection === "notebooks" && (
            <>
              <NotebookPanel
                notebooks={notebooks}
                currentNotebook={currentNotebook || undefined}
                workspaceName={currentWorkspace?.name}
                onSelectNotebook={handleSelectNotebook}
                onCreateNotebook={createNotebook}
                isCreating={isNotebookCreationOpen}
                onToggleCreating={setIsNotebookCreationOpen}
                onRenameNotebook={renameNotebook}
                onDeleteNotebook={removeNotebook}
                onReorder={(ids) => {
                  reorderNotebooks?.(ids);
                }}
                className={sidebarCollapsed ? "collapsed" : ""}
                width={notebookPanelWidth}
                onResizeStart={(e) => {
                  setIsResizing('notebook');
                  setResizeStartX(e.clientX);
                }}
              />

              {currentNotebook && (
                <SectionPagePanel
                  pages={pages}
                  currentPage={currentPage || undefined}
                  onSelectPage={handleSelectPage}
                  onCreatePage={handleCreatePage}
                  onToggleFavorite={toggleFavorite}
                  onReorderPages={(pageId, targetIndex) => movePage?.(pageId, targetIndex)}
                  className={sidebarCollapsed ? "collapsed" : ""}
                  width={sectionPagePanelWidth}
                  onResizeStart={(e) => {
                    setIsResizing('sectionPage');
                    setResizeStartX(e.clientX);
                  }}
                />
              )}
            </>
          )}
        </div>

        {activeSection === "notebooks" ? (
          currentNotebook ? (
            currentPage ? (
              <div className={styles.editorArea}>
                <PageEditor 
                  page={currentPage} 
                  onSave={handleSavePage} 
                  sidebarWidth={sidebarCollapsed ? 72 : 72 + notebookPanelWidth + sectionPagePanelWidth + 2} 
                />
              </div>
            ) : (
              <div className={styles.editorArea}>
                <div className={styles.emptyState}>
                  <h2>Выберите страницу</h2>
                  <p>Нажмите на страницу в списке, чтобы начать редактирование.</p>
                </div>
              </div>
            )
          ) : (
            <div className={`${styles.editorArea} ${sidebarCollapsed ? styles.editorAreaCollapsed : ''}`}>
              <div className={styles.emptyState}>
                <h2>Откройте блокнот</h2>
                <p>Выберите блокнот слева или создайте новый, чтобы начать работу.</p>
              </div>
            </div>
          )
        ) : activeSection === "shared" ? (
          <SharedPage />
        ) : (
          <div className={styles.editorArea}>
            <div className={styles.emptyState}>
              <h2>Выберите раздел</h2>
              <p>Переключитесь на блокнот или другую секцию для редактирования.</p>
            </div>
          </div>
        )}
      </div>
      {contextMenu.visible && (
        <div className={styles.contextMenuOverlay} onClick={handleCloseContextMenu}>
          <div
            className={styles.contextMenu}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleContextCreateNotebook}
            >
              Создать блокнот
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
