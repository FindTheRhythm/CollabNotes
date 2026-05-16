import React from "react";
import ImageBlock from "./ImageBlock";
import CodeBlock from "./CodeBlock";
import ChecklistBlock from "./ChecklistBlock";

interface BlockRendererProps {
  block: any;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case "image":
      return <ImageBlock block={block} />;
    case "code":
      return <CodeBlock block={block} />;
    case "checklist":
      return <ChecklistBlock block={block} />;
    default:
      return <div dangerouslySetInnerHTML={{ __html: block.content || "" }} />;
  }
};

export default BlockRenderer;
