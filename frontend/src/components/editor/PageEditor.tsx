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
import CodeBlock from "@tiptap/extension-code-block";
import { useAutoSave } from "@/hooks";
import { Page } from "@/store/pageSlice";
import { EditorToolbar } from "./Toolbar/EditorToolbar";
import { CommandPalette } from "./CommandPalette";
import styles from "./PageEditor.module.css";

interface PageEditorProps {
  page: Page;
  onContentChange?: (content: string) => void;
  onSave?: (pageId: string, content: string) => Promise<void> | void;
  readOnly?: boolean;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onContentChange,
  onSave,
  readOnly = false,
}) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSideToolbar, setShowSideToolbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

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
    if (editor && page.content && editor.getHTML() !== page.content) {
      editor.commands.setContent(page.content);
    }

    updateSideToolbar();
  }, [editor, page.content, updateSideToolbar]);

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
    <div className={styles.editor}>
      <EditorToolbar editor={editor} onSave={handleManualSave} isSaving={isSaving} />

      {showCommandPalette && (
        <CommandPalette
          onCommandSelect={handleSlashCommand}
          onClose={() => setShowCommandPalette(false)}
        />
      )}

      <div className={styles.editorBody}>
        <div className={styles.editorContent} ref={contentRef}>
          <EditorContent editor={editor} />
        </div>

        {showSideToolbar && (
          <aside className={styles.sideToolbar}>
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
  );
};
