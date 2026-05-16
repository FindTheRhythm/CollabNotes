import React, { useEffect, useState } from "react";
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
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onContentChange,
  onSave,
  readOnly = false,
}) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { handleContentChange } = useAutoSave(page.id, {
    debounceMs: 1000,
    onSave,
  });

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
    },
  });

  useEffect(() => {
    if (editor && page.content && editor.getHTML() !== page.content) {
      editor.commands.setContent(page.content);
    }
  }, [editor, page.content]);

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
      <EditorToolbar editor={editor} />

      {showCommandPalette && (
        <CommandPalette
          onCommandSelect={handleSlashCommand}
          onClose={() => setShowCommandPalette(false)}
        />
      )}

      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
