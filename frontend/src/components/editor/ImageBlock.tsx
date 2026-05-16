import React from "react";

export const ImageBlock: React.FC<{ block: any }> = ({ block }) => {
  return (
    <div className="image-block">
      <img src={block.content?.src} alt={block.content?.alt || "image"} />
    </div>
  );
};

export default ImageBlock;
