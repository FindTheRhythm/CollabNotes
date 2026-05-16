import React from "react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/api/client';
import BlockRenderer from './BlockRenderer';

interface BlockItem {
  id: string;
  type: string;
  content: any;
}

interface BlockListProps {
  pageId?: string | null;
  blocks: BlockItem[];
  onChange?: (items: BlockItem[]) => void;
}

const BlockList: React.FC<BlockListProps> = ({ pageId, blocks, onChange }) => {
  const [items, setItems] = React.useState<BlockItem[]>(blocks);

  React.useEffect(() => {
    setItems(blocks);
  }, [blocks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const nextItems = arrayMove(items, oldIndex, newIndex);
      setItems(nextItems);
      onChange?.(nextItems);

      if (!pageId) {
        console.warn("Block reorder skipped because pageId is missing");
        return;
      }

      try {
        await api.post('/blocks/reorder', { pageId, orderedIds: nextItems.map(item => item.id) });
      } catch (err) {
        console.error('Block reorder failed', err);
      }
    }
  };

  const SortableBlock: React.FC<{ item: BlockItem }> = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab'
    } as React.CSSProperties;

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="block-list-item">
        <BlockRenderer block={item} />
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="block-list">
          {items.map(item => (
            <SortableBlock key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default BlockList;
