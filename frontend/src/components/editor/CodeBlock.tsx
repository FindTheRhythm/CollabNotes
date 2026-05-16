import React from "react";

export const CodeBlock: React.FC<{ block: any }> = ({ block }) => {
  return (
    <pre className="code-block">
      <code>{block.content?.code || ""}</code>
    </pre>
  );
};

export default CodeBlock;
