import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task } from '../types/task';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export const Column = ({ id, title, tasks }: ColumnProps) => {
  return (
    <div className="flex flex-col w-80 shrink-0 h-full">
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest opacity-60">
            {title}
          </h3>
          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-brand-muted hover:text-white">
            <Plus size={16} />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-brand-muted hover:text-white">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 px-2 py-1 rounded-2xl transition-all min-h-[150px]",
              snapshot.isDraggingOver ? "bg-white/[0.02]" : "bg-transparent"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
