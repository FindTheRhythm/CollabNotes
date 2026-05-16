import React from "react";

interface RichTextEditorProps {
  value?: any;
  onChange?: (value: any) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">Toolbar (placeholder)</div>
      <div className="editor-area" contentEditable suppressContentEditableWarning onInput={(e) => onChange?.((e.target as HTMLElement).innerHTML)}>
        {typeof value === "string" ? <div dangerouslySetInnerHTML={{ __html: value }} /> : ""}
      </div>
    </div>
  );
};

export default RichTextEditor;
