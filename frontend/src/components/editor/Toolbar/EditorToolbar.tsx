import React from "react";
import { Editor } from "@tiptap/react";
import styles from "./EditorToolbar.module.css";

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
  isSaving?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onSave, isSaving }) => {
  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleStrike = () => {
    editor.chain().focus().toggleStrike().run();
  };

  const toggleCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  const toggleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleTaskList = () => {
    editor.chain().focus().toggleTaskList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const insertImage = () => {
    const url = prompt("Введите URL изображения:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const url = prompt("Введите URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const undo = () => {
    editor.chain().focus().undo().run();
  };

  const redo = () => {
    editor.chain().focus().redo().run();
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.button} ${editor.isActive("bold") ? styles.active : ""}`}
          onClick={toggleBold}
          title="Жирный (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          className={`${styles.button} ${editor.isActive("italic") ? styles.active : ""}`}
          onClick={toggleItalic}
          title="Курсив (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          className={`${styles.button} ${editor.isActive("strike") ? styles.active : ""}`}
          onClick={toggleStrike}
          title="Зачёркивание"
        >
          <s>S</s>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.button} ${
            editor.isActive("heading", { level: 1 }) ? styles.active : ""
          }`}
          onClick={() => setHeading(1)}
          title="Заголовок 1"
        >
          H1
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("heading", { level: 2 }) ? styles.active : ""
          }`}
          onClick={() => setHeading(2)}
          title="Заголовок 2"
        >
          H2
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("heading", { level: 3 }) ? styles.active : ""
          }`}
          onClick={() => setHeading(3)}
          title="Заголовок 3"
        >
          H3
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.button} ${
            editor.isActive("bulletList") ? styles.active : ""
          }`}
          onClick={toggleBulletList}
          title="Список с точками"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="6" r="1.5" />
            <path d="M9 6h12M5 12h0m4-4h12M5 18h0m4-4h12" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("orderedList") ? styles.active : ""
          }`}
          onClick={toggleOrderedList}
          title="Нумерованный список"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 6h1v3h-1V6zM5 12h1M5 18h1" stroke="currentColor" strokeWidth="2" />
            <path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("taskList") ? styles.active : ""
          }`}
          onClick={toggleTaskList}
          title="Список задач"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.button} ${editor.isActive("code") ? styles.active : ""}`}
          onClick={toggleCode}
          title="Код"
        >
          <code>&lt;/&gt;</code>
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("codeBlock") ? styles.active : ""
          }`}
          onClick={toggleCodeBlock}
          title="Блок кода"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9 18l-6-6 6-6m6 0l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
        <button
          className={`${styles.button} ${
            editor.isActive("blockquote") ? styles.active : ""
          }`}
          onClick={toggleBlockquote}
          title="Цитата"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 21c3 0 7-1 7-8V5c0-1.25-4.4-4-7-4S3 4 3 5c0 2 2 5 2 5v3c0 1-2 2-2 2s-3-1-3-3V5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          className={styles.button}
          onClick={insertLink}
          title="Вставить ссылку"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
        <button
          className={styles.button}
          onClick={insertImage}
          title="Вставить изображение"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L7 21" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
        <button
          className={styles.button}
          onClick={insertTable}
          title="Вставить таблицу"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="1" />
            <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="1" />
            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1" />
            <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          className={styles.button}
          onClick={insertHorizontalRule}
          title="Горизонтальная линия"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          className={styles.button}
          onClick={undo}
          title="Отменить (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
        <button
          className={styles.button}
          onClick={redo}
          title="Повторить (Ctrl+Y)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.button} ${styles.saveButton}`}
          onClick={onSave}
          title="Сохранить страницу"
          aria-label="Сохранить страницу"
          disabled={isSaving}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>
      </div>
    </div>
  );
};
