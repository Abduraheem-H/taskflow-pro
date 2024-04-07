import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';
import { Column } from './Column';
import { AddTaskModal } from './AddTaskModal';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Bell, 
  Settings,
  Menu,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

export const KanbanBoard = () => {
  const { tasks, columns, columnOrder, moveTask, reorderColumn } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      reorderColumn(source.droppableId, source.index, destination.index);
    } else {
      moveTask(
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index,
        draggableId
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-brand-border flex items-center px-8 justify-between bg-brand-bg/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TaskFlow</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {['Dashboard', 'My Tasks', 'Projects', 'Team'].map((item) => (
              <button 
                key={item}
                className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white transition-all rounded-lg hover:bg-white/5"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 transition-all w-64"
            />
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl text-brand-muted hover:text-white transition-all">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl text-brand-muted hover:text-white transition-all">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10" />
        </div>
      </header>

      {/* Sub-header */}
      <div className="px-8 py-6 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-bg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold tracking-tight">Product Roadmap</h2>
            <button className="p-1 hover:bg-white/5 rounded-md text-brand-muted">
              <ChevronDown size={16} />
            </button>
          </div>
          <p className="text-sm text-brand-muted">Manage and track your product development lifecycle.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-brand-border rounded-xl p-1">
            <button className="p-1.5 bg-white/10 text-white rounded-lg shadow-sm">
              <LayoutGrid size={18} />
            </button>
            <button className="p-1.5 text-brand-muted hover:text-white rounded-lg transition-all">
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/5"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-[#080808]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 h-full min-w-max">
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              const columnTasks = column.taskIds
                .map((taskId) => tasks[taskId])
                .filter(task => 
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  task.description.toLowerCase().includes(searchQuery.toLowerCase())
                );

              return (
                <Column 
                  key={column.id} 
                  id={column.id} 
                  title={column.title} 
                  tasks={columnTasks} 
                />
              );
            })}
            
            {/* Add Column Placeholder */}
            <div className="w-80 shrink-0 h-full">
              <button className="w-full h-12 border border-dashed border-brand-border rounded-2xl flex items-center justify-center gap-2 text-brand-muted hover:text-white hover:border-white/20 transition-all group">
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Section</span>
              </button>
            </div>
          </div>
        </DragDropContext>
      </main>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>

  );
};
