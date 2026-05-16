import React from "react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionItem {
  id: string;
  title: string;
}

interface SectionPanelProps {
  sections?: SectionItem[];
  onSelect?: (id: string) => void;
  onReorder?: (orderedIds: string[]) => void;
}

export const SectionPanel: React.FC<SectionPanelProps> = ({ sections = [], onSelect, onReorder }) => {
  const [items, setItems] = React.useState<string[]>(sections.map(s => s.id));

  React.useEffect(() => {
    setItems(sections.map(s => s.id));
  }, [sections]);

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
      <div ref={setNodeRef} style={style} className="section-item" {...attributes} {...listeners} onClick={() => onSelect?.(id)}>
        {title}
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="section-panel">
          <div className="section-list">
            {sections.map(s => (
              <SortableItem key={s.id} id={s.id} title={s.title} />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SectionPanel;
