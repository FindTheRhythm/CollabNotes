import React from "react";

export const ChecklistBlock: React.FC<{ block: any }> = ({ block }) => {
  const items = block.content?.items || [];
  return (
    <ul className="checklist-block">
      {items.map((it: any, idx: number) => (
        <li key={idx} className={it.checked ? "checked" : ""}>
          <input type="checkbox" checked={!!it.checked} readOnly /> {it.text}
        </li>
      ))}
    </ul>
  );
};

export default ChecklistBlock;
