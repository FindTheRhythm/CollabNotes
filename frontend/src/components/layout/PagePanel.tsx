import React from "react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/api/client';

interface PageItem {
  id: string;
  title: string;
}

interface PagePanelProps {
  pages?: PageItem[];
  sectionId?: string | null;
  onSelect?: (id: string) => void;
  onReorder?: (orderedIds: string[]) => void;
}

export const PagePanel: React.FC<PagePanelProps> = ({ pages = [], sectionId, onSelect, onReorder }) => {
  const [items, setItems] = React.useState<string[]>(pages.map(p => p.id));

  React.useEffect(() => {
    setItems(pages.map(p => p.id));
  }, [pages]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorder?.(newItems);

      if (!sectionId) {
        console.warn("Page reorder skipped because sectionId is missing");
        return;
      }

      try {
        await api.post('/pages/reorder', { sectionId, orderedIds: newItems });
      } catch (err) {
        console.error('Reorder failed', err);
      }
    }
  };

  const SortableItem: React.FC<{ id: string; title: string; onClick?: () => void }> = ({ id, title, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    } as React.CSSProperties;

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="page-item" onClick={onClick}>
        {title}
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="page-panel">
          {pages.map(p => (
            <SortableItem key={p.id} id={p.id} title={p.title} onClick={() => onSelect?.(p.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default PagePanel;
