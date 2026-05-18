import React, { useState } from "react";
import { Page } from "@/store/pageSlice";
import styles from "./SectionPagePanel.module.css";

interface SectionPagePanelProps {
  pages: Page[];
  currentPage?: Page;
  onSelectPage?: (page: Page) => void;
  onCreatePage?: (title: string) => void;
  onToggleFavorite?: (pageId: string) => void;
  onReorderPages?: (pageId: string, targetIndex: number) => void;
  className?: string;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export const SectionPagePanel: React.FC<SectionPagePanelProps> = ({
  pages,
  currentPage,
  onSelectPage,
  onCreatePage,
  onToggleFavorite,
  onReorderPages,
  className,
  width = 224,
  onResizeStart,
}) => {
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renamePageValue, setRenamePageValue] = useState("");
  const [pageContextMenu, setPageContextMenu] = useState({ visible: false, x: 0, y: 0 });

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SectionPagePanel] handleCreatePage called:', { newPageTitle, isCreatingPage });
    if (newPageTitle.trim()) {
      console.log('[SectionPagePanel] Calling onCreatePage with:', newPageTitle);
      onCreatePage?.(newPageTitle);
      setNewPageTitle("");
      setIsCreatingPage(false);
    }
  };

  const handleSaveRenamePage = (_pageId?: string) => {
    if (renamePageValue.trim()) {
      setRenamingPageId(null);
    }
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

      {/* Pages Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Страницы</h2>
      </div>

      {/* Pages List */}
      <div className={styles.pagesContainer}>
        {isCreatingPage && (
          <form className={styles.createPageForm} onSubmit={handleCreatePage}>
            <input
              type="text"
              className={styles.createInput}
              placeholder="Название страницы"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              autoFocus
              onBlur={() => !newPageTitle && setIsCreatingPage(false)}
            />
          </form>
        )}

        <div
          className={styles.pagesList}
          onContextMenu={(e) => {
            e.preventDefault();
            // show context menu when user right-clicks empty area under pages
            setPageContextMenu({ visible: true, x: e.clientX, y: e.clientY });
          }}
        >
          {pages.map((page, pidx) => (
            <div
              key={page.id}
              data-index={pidx}
              draggable
              className={`${styles.pageItem} ${
                currentPage?.id === page.id ? styles.activePage : ""
              }`}
              onClick={() => onSelectPage?.(page)}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/collabnotes",
                  JSON.stringify({ type: "page", id: page.id })
                );
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const raw = e.dataTransfer.getData("application/collabnotes");
                if (!raw) return;
                try {
                  const data = JSON.parse(raw);
                  if (data.type !== "page") return;
                  const ids = pages.map((p) => p.id);
                  const from = ids.indexOf(data.id);
                  const to = Number((e.currentTarget as HTMLElement).dataset.index);
                  if (from === -1 || to === -1 || from === to) return;
                  // inform parent of move: source id and target index
                  onReorderPages?.(data.id, to);
                } catch (err) {
                  console.error('Page drop parse error', err);
                }
              }}
            >
              {renamingPageId === page.id ? (
                <input
                  type="text"
                  className={styles.renameInput}
                  value={renamePageValue}
                  onChange={(e) => setRenamePageValue(e.target.value)}
                  onBlur={() => handleSaveRenamePage(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveRenamePage(page.id);
                    } else if (e.key === "Escape") {
                      setRenamingPageId(null);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <div className={styles.pageInfo}>
                    <span className={styles.pageTitle}>{page.title}</span>
                    {page.content && (
                      <span className={styles.pagePreview}>
                        {page.content.substring(0, 50)}...
                      </span>
                    )}
                  </div>
                  <button
                    className={`${styles.favoriteButton} ${
                      page.isFavorite ? styles.isFavorite : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(page.id);
                    }}
                    title={page.isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {pageContextMenu.visible && (
        <div
          className={styles.contextMenuOverlay}
          onClick={() => setPageContextMenu({ visible: false, x: 0, y: 0 })}
        >
          <div
            className={styles.contextMenu}
            style={{ left: pageContextMenu.x, top: pageContextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                setIsCreatingPage(true);
                setPageContextMenu({ visible: false, x: 0, y: 0 });
              }}
            >
              Создать страницу
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
