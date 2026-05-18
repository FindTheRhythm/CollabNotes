import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from "@tiptap/extension-code-block";
import { useAutoSave } from "@/hooks";
import { Page } from "@/store/pageSlice";
import { EditorToolbar } from "./Toolbar/EditorToolbar";
import { CommandPalette } from "./CommandPalette";
import styles from "./PageEditor.module.css";

interface PageEditorProps {
  page: Page;
  sidebarWidth: number;
  onContentChange?: (content: string) => void;
  onSave?: (pageId: string, content: string) => Promise<void> | void;
  readOnly?: boolean;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  sidebarWidth,
  onContentChange,
  onSave,
  readOnly = false,
}) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSideToolbar, setShowSideToolbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageShift, setPageShift] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { handleContentChange } = useAutoSave(page.id, {
    debounceMs: 1000,
    onSave,
  });

  const updateSideToolbar = useCallback(() => {
    const contentEl = contentRef.current;
    if (!contentEl) {
      setShowSideToolbar(false);
      return;
    }

    const contentHeight = contentEl.getBoundingClientRect().height;
    const availableHeight = window.innerHeight - 180;
    const isLong = contentHeight > availableHeight;
    setShowSideToolbar(isLong && window.scrollY > 120);
  }, []);

  const handleManualSave = async () => {
    if (!onSave || !editor) return;

    const content = editor.getHTML();
    setIsSaving(true);

    try {
      await Promise.resolve(onSave(page.id, content));
    } catch (error) {
      console.error("Failed to save page manually:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    updateSideToolbar();

    const handleScroll = () => {
      const contentEl = contentRef.current;
      if (!contentEl) {
        setShowSideToolbar(false);
        return;
      }

      const contentHeight = contentEl.getBoundingClientRect().height;
      const availableHeight = window.innerHeight - 180;
      const isLong = contentHeight > availableHeight;
      setShowSideToolbar(isLong && window.scrollY > 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateSideToolbar);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateSideToolbar);
    };
  }, [updateSideToolbar]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlock,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: page.content || "",
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
      handleContentChange(html);
      updateSideToolbar();
    },
  });

  useEffect(() => {
    const desired = page.content ?? "";
    if (editor && editor.getHTML() !== desired) {
      editor.commands.setContent(desired);
    }

    updateSideToolbar();
  }, [editor, page.content, updateSideToolbar]);

  const updatePageShift = useCallback(() => {
    const el = wrapperRef.current || editorBodyRef.current;
    if (!el) {
      setPageShift(0);
      return;
    }

    const width = el.getBoundingClientRect().width;
    const viewportWidth = window.innerWidth;
    const centeredLeft = viewportWidth / 2 - width / 2;
    const desiredGap = 32; // conservative gap to prevent panel overlay
    const minLeft = sidebarWidth + desiredGap; // keep a small gap
    const requiredShift = minLeft - centeredLeft;

    setPageShift(requiredShift > 0 ? requiredShift : 0);
  }, [sidebarWidth]);

  useEffect(() => {
    updatePageShift();

    window.addEventListener("resize", updatePageShift);
    return () => {
      window.removeEventListener("resize", updatePageShift);
    };
  }, [updatePageShift]);

  const handleSlashCommand = (command: string) => {
    if (!editor) return;

    switch (command) {
      case "heading1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "taskList":
        editor.chain().focus().toggleTaskList().run();
        break;
      case "codeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "table":
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case "horizontalRule":
        editor.chain().focus().setHorizontalRule().run();
        break;
    }
    setShowCommandPalette(false);
  };

  if (!editor) {
    return <div className={styles.loading}>Загрузка редактора...</div>;
  }

  return (
    <div ref={editorRef} className={styles.editor}>
      <div ref={wrapperRef} className={styles.editorWrapper} style={{ transform: pageShift ? `translateX(${pageShift}px)` : undefined }}>
        <EditorToolbar editor={editor} onSave={handleManualSave} isSaving={isSaving} />

        {showCommandPalette && (
          <CommandPalette
            onCommandSelect={handleSlashCommand}
            onClose={() => setShowCommandPalette(false)}
          />
        )}

        <div ref={editorBodyRef} className={styles.editorBody}>
        <div className={styles.editorContent} ref={contentRef}>
          <EditorContent editor={editor} />
        </div>

        {showSideToolbar && (
          <aside className={styles.sideToolbar}>
            <button
              className={`${styles.button} ${styles.sideButton}`}
              title="Отменить"
              aria-label="Отменить"
              onClick={() => editor.chain().focus().undo().run()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" />
                <path d="M20 20a9 9 0 0 0-11-11" />
              </svg>
            </button>

            <button
              className={`${styles.button} ${styles.sideButton}`}
              title="Повторить"
              aria-label="Повторить"
              onClick={() => editor.chain().focus().redo().run()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14l5-5-5-5" />
                <path d="M4 20a9 9 0 0 0 11-11" />
              </svg>
            </button>

            <button
              className={`${styles.button} ${styles.sideButton}`}
              title="Команды"
              aria-label="Открыть палитру команд"
              onClick={() => setShowCommandPalette(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6 1.2c.1.5-.3.9-.8.8a1 1 0 0 0-1.2.6 1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6 1.2c.1.5-.3.9-.8.8" />
              </svg>
            </button>

            <button
              className={`${styles.button} ${styles.sideButton}`}
              title="Сохранить страницу"
              aria-label="Сохранить страницу"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
          </aside>
        )}
        </div>
      </div>
    </div>
  );
};
