import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import axios from "axios";
import getSocket from "@/utils/socket";

interface DebounceRef {
  timer?: number | null;
}

interface TiptapEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps & { pageId?: string; autosave?: boolean }>
= ({ content = "", onUpdate, pageId, autosave = true }) => {
  const debounceRef = useRef<DebounceRef>({ timer: null });
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    if (pageId) {
      socketRef.current.emit('joinPage', { pageId });
    }

    const handleIncoming = (payload: any) => {
      if (!payload) return;
      const { content } = payload;
      // apply incoming content (naive last-write)
      if (editor && content && editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    };

    socketRef.current.on('page:content:update', handleIncoming);

    return () => {
      if (pageId) socketRef.current?.emit('leavePage', { pageId });
      socketRef.current?.off('page:content:update', handleIncoming);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem,
      Image,
      Link.configure({ openOnClick: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);

      // autosave (debounced) and emit via socket
      if (autosave && pageId) {
        if (debounceRef.current.timer) {
          window.clearTimeout(debounceRef.current.timer as number);
        }
        debounceRef.current.timer = window.setTimeout(async () => {
          try {
            // POST save version
            await axios.post(`/api/pages/${pageId}/versions`, { content: html });
            // emit websocket update
            socketRef.current?.emit('page:content:update', { pageId, content: html });
          } catch (err) {
            console.error('Autosave failed', err);
          }
        }, 1000); // 1s debounce
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numbered</button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()}>Checklist</button>
        <button onClick={() => {
          const url = window.prompt("Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>Image</button>
        <button onClick={() => {
          const url = window.prompt("Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}>Table</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
