import React, { useState } from "react";
import { Section } from "@/store/sectionSlice";
import { Page } from "@/store/pageSlice";
import styles from "./SectionPagePanel.module.css";

interface SectionPagePanelProps {
  sections: Section[];
  pages: Page[];
  currentSection?: Section;
  currentPage?: Page;
  onSelectSection?: (section: Section) => void;
  onSelectPage?: (page: Page) => void;
  onCreateSection?: (name: string) => void;
  onCreatePage?: (title: string) => void;
  onToggleFavorite?: (pageId: string) => void;
}

export const SectionPagePanel: React.FC<SectionPagePanelProps> = ({
  sections,
  pages,
  currentSection,
  currentPage,
  onSelectSection,
  onSelectPage,
  onCreateSection,
  onCreatePage,
  onToggleFavorite,
}) => {
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renamePageValue, setRenamePageValue] = useState("");

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      onCreateSection?.(newSectionName);
      setNewSectionName("");
      setIsCreatingSection(false);
    }
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageTitle.trim()) {
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
    <div className={styles.panel}>
      {/* Section Tabs */}
      <div className={styles.sectionsTabs}>
        <div className={styles.tabsScroll}>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`${styles.tab} ${
                currentSection?.id === section.id ? styles.activeTab : ""
              }`}
              onClick={() => onSelectSection?.(section)}
            >
              {section.color && (
                <span
                  className={styles.sectionColor}
                  style={{ backgroundColor: section.color }}
                />
              )}
              <span className={styles.tabLabel}>{section.name}</span>
            </button>
          ))}
        </div>
        <button
          className={styles.addSectionButton}
          onClick={() => setIsCreatingSection(true)}
          title="Добавить секцию"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {isCreatingSection && (
        <form className={styles.createSectionForm} onSubmit={handleCreateSection}>
          <input
            type="text"
            className={styles.createInput}
            placeholder="Название секции"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            autoFocus
            onBlur={() => !newSectionName && setIsCreatingSection(false)}
          />
        </form>
      )}

      {/* Pages List */}
      <div className={styles.pagesContainer}>
        <div className={styles.pagesHeader}>
          <h3 className={styles.pagesTitle}>Страницы</h3>
          <button
            className={styles.addPageButton}
            onClick={() => setIsCreatingPage(true)}
            title="Создать страницу"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>

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

        <div className={styles.pagesList}>
          {pages.map((page) => (
            <div
              key={page.id}
              className={`${styles.pageItem} ${
                currentPage?.id === page.id ? styles.activePage : ""
              }`}
              onClick={() => onSelectPage?.(page)}
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
    </div>
  );
};
