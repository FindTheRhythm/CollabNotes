import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { TopToolbar } from "./TopToolbar";
import { LeftSidebar, SidebarItem } from "./LeftSidebar";
import { NotebookPanel } from "./NotebookPanel/NotebookPanel";
import { SectionPagePanel } from "./SectionPagePanel";
import { PageEditor } from "../editor";
import {
  useWorkspaceManagement,
  useNotebookManagement,
  useSectionManagement,
  usePageManagement,
} from "@/hooks";
import {
  setSections,
  setCurrentSection,
} from "@/store/sectionSlice";
import { setPages, setCurrentPage } from "@/store/pageSlice";
import styles from "./AppLayout.module.css";

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("notebooks");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isNotebookCreationOpen, setIsNotebookCreationOpen] = useState(false);

  // Load data
  const { currentWorkspace, loadWorkspaces } =
    useWorkspaceManagement();
  const { notebooks, currentNotebook, loadNotebooks, selectNotebook, createNotebook, renameNotebook, removeNotebook } =
    useNotebookManagement();
  const { sections, currentSection, loadSections, selectSection, createSection } =
    useSectionManagement();
  const {
    pages,
    currentPage,
    loadPages,
    loadPage: loadPageData,
    savePage,
    createNewPage,
    toggleFavorite,
  } = usePageManagement();

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (currentWorkspace) {
      loadNotebooks();
      dispatch(setSections([]));
      dispatch(setCurrentSection(null));
      dispatch(setPages([]));
      dispatch(setCurrentPage(null));
    }
  }, [currentWorkspace, loadNotebooks, dispatch]);

  useEffect(() => {
    if (currentNotebook) {
      console.log('[AppLayout] currentNotebook changed, loading sections:', { notebookId: currentNotebook.id });
      loadSections();
    }
  }, [currentNotebook, loadSections]);

  useEffect(() => {
    console.log('[AppLayout] sections changed:', { sectionsCount: sections.length, currentSectionId: currentSection?.id });
    if (sections.length > 0 && !currentSection) {
      console.log('[AppLayout] Selecting first section:', { sectionId: sections[0].id });
      selectSection(sections[0].id);
    }
  }, [sections, currentSection, selectSection]);

  useEffect(() => {
    console.log('[AppLayout] currentSection changed:', { sectionId: currentSection?.id });
    if (currentSection) {
      loadPages();
      dispatch(setCurrentPage(null));
    }
  }, [currentSection, loadPages, dispatch]);

  const handleSelectNotebook = (notebook: any) => {
    selectNotebook(notebook.id);
  };

  const handleSelectSection = (section: any) => {
    selectSection(section.id);
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

  const handleCreateSection = async (name: string) => {
    console.log('[AppLayout] handleCreateSection called:', { name });
    try {
      await createSection(name);
      console.log('[AppLayout] handleCreateSection completed successfully');
    } catch (error) {
      console.error('[AppLayout] handleCreateSection failed:', error);
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
      id: "home",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-1h2v19h-2zm4 4h2v15h-2z" />
        </svg>
      ),
      label: "Главная",
      active: activeSection === "home",
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
      <TopToolbar workspace={currentWorkspace || undefined} />

      <div className={styles.mainContent}>
        <LeftSidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onItemClick={(itemId) => {
            setActiveSection(itemId);
            handleCloseContextMenu();
          }}
          onItemContextMenu={handleSidebarContextMenu}
        />

        {activeSection === "notebooks" && (
          <>
            <NotebookPanel
              notebooks={notebooks}
              currentNotebook={currentNotebook || undefined}
              onSelectNotebook={handleSelectNotebook}
              onCreateNotebook={createNotebook}
              isCreating={isNotebookCreationOpen}
              onToggleCreating={setIsNotebookCreationOpen}
              onRenameNotebook={renameNotebook}
              onDeleteNotebook={removeNotebook}
            />

            {currentNotebook ? (
              <>
                <SectionPagePanel
                  sections={sections}
                  pages={pages}
                  currentSection={currentSection || undefined}
                  currentPage={currentPage || undefined}
                  onSelectSection={handleSelectSection}
                  onSelectPage={handleSelectPage}
                  onCreatePage={handleCreatePage}
                  onCreateSection={handleCreateSection}
                  onToggleFavorite={toggleFavorite}
                />

                {currentPage ? (
                  <div className={styles.editorArea}>
                    <PageEditor page={currentPage} onSave={handleSavePage} />
                  </div>
                ) : (
                  <div className={styles.editorArea}>
                    <div className={styles.emptyState}>
                      <h2>Выберите страницу</h2>
                      <p>Нажмите на страницу в списке, чтобы начать редактирование.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.editorArea}>
                <div className={styles.emptyState}>
                  <h2>Откройте блокнот</h2>
                  <p>Выберите блокнот слева или создайте новый, чтобы начать работу.</p>
                </div>
              </div>
            )}
          </>
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
