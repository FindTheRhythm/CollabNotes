import React from "react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NotebookItem {
  id: string;
  title: string;
}

interface NotebookPanelProps {
  notebooks?: NotebookItem[];
  onSelect?: (id: string) => void;
  onReorder?: (orderedIds: string[]) => void;
}

export const NotebookPanel: React.FC<NotebookPanelProps> = ({ notebooks = [], onSelect, onReorder }) => {
  const [items, setItems] = React.useState<string[]>(notebooks.map(nb => nb.id));

  React.useEffect(() => {
    setItems(notebooks.map(nb => nb.id));
  }, [notebooks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const nextItems = arrayMove(items, oldIndex, newIndex);
      setItems(nextItems);
      onReorder?.(nextItems);
    }
  };

  const SortableItem: React.FC<{ id: string; title: string }> = ({ id, title }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    } as React.CSSProperties;

    return (
      <div ref={setNodeRef} style={style} className="notebook-item" {...attributes} {...listeners} onClick={() => onSelect?.(id)}>
        <span className="notebook-icon">📚</span>
        <span className="notebook-title">{title}</span>
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="notebook-panel">
          {notebooks.map(nb => (
            <SortableItem key={nb.id} id={nb.id} title={nb.title} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default NotebookPanel;
