import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';
import { Column } from './Column';
import { AddTaskModal } from './AddTaskModal';
import { TaskList } from './TaskList';
import { Priority } from '../types/task';
import { 
  Search, 
  Filter,
  LayoutGrid, 
  List, 
  Plus, 
  Bell, 
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface KanbanBoardProps {
  onOpenAssistant?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'my-tasks', label: 'My Tasks' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' }
];

const PROJECTS = [
  {
    id: 'roadmap',
    name: 'Product Roadmap',
    description: 'Manage and track your product development lifecycle.'
  },
  {
    id: 'launch',
    name: 'Launch Plan',
    description: 'Coordinate milestones and release deliverables in one view.'
  },
  {
    id: 'growth',
    name: 'Growth Experiments',
    description: 'Run experiments and capture insights with your team.'
  }
];

export const KanbanBoard = ({ onOpenAssistant }: KanbanBoardProps) => {
  const { 
    tasks, 
    columns, 
    columnOrder, 
    moveTask, 
    reorderColumn,
    addColumn,
    renameColumn,
    deleteColumn
  } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activePriorities, setActivePriorities] = useState<Priority[]>([]);
  const [activeNav, setActiveNav] = useState(NAV_ITEMS[0].id);
  const [activeProjectId, setActiveProjectId] = useState(PROJECTS[0].id);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeNav) ?? NAV_ITEMS[0];
  const activeProject = PROJECTS.find((project) => project.id === activeProjectId) ?? PROJECTS[0];

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

  const openTaskModal = (columnId?: string) => {
    setActiveColumnId(columnId ?? columnOrder[0] ?? null);
    setIsModalOpen(true);
  };

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const matchesSearch = (title: string, description: string) => {
    if (!normalizedQuery) return true;
    return (
      title.toLowerCase().includes(normalizedQuery) ||
      description.toLowerCase().includes(normalizedQuery)
    );
  };

  const matchesPriority = (priority: Priority) => {
    if (activePriorities.length === 0) return true;
    return activePriorities.includes(priority);
  };

  const matchesFilters = (title: string, description: string, priority: Priority) => {
    return matchesSearch(title, description) && matchesPriority(priority);
  };

  const listTasks = columnOrder.flatMap((columnId) =>
    columns[columnId].taskIds
      .map((taskId) => tasks[taskId])
      .filter((task) => matchesFilters(task.title, task.description, task.priority))
  );

  const togglePriority = (priority: Priority) => {
    setActivePriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((item) => item !== priority)
        : [...prev, priority]
    );
  };

  const handleAddColumn = () => {
    const name = prompt('Column name');
    if (!name || !name.trim()) return;
    addColumn(name.trim());
  };

  const handleRenameColumn = (columnId: string) => {
    const currentTitle = columns[columnId]?.title ?? 'Column';
    const nextTitle = prompt('Rename column', currentTitle);
    if (!nextTitle || !nextTitle.trim()) return;
    renameColumn(columnId, nextTitle.trim());
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns[columnId];
    if (!column) return;

    const remaining = columnOrder.filter((id) => id !== columnId);
    const fallbackTitle = remaining.length > 0 ? columns[remaining[0]]?.title : '';
    const confirmationMessage = remaining.length > 0
      ? `Delete "${column.title}"? Tasks will move to "${fallbackTitle}".`
      : `Delete "${column.title}"? This will remove all tasks in the column.`;

    if (confirm(confirmationMessage)) {
      deleteColumn(columnId);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsProjectMenuOpen(false);
  };

  const activeFilterCount = activePriorities.length;

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
            {NAV_ITEMS.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all rounded-lg",
                  activeNav === item.id
                    ? "text-white bg-white/10"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
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
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-brand-border text-brand-muted hover:text-white hover:border-white/20 transition-all"
            >
              <Sparkles size={16} />
              Assistant
            </button>
          )}
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
          <div className="flex items-center gap-3 mb-1 relative">
            <button
              onClick={() => setIsProjectMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-2xl font-bold tracking-tight">
                {activeProject.name}
              </h2>
              <ChevronDown
                size={16}
                className={cn(
                  "text-brand-muted transition-transform",
                  isProjectMenuOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </button>
            <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10 text-brand-muted">
              {activeNavItem.label}
            </span>

            {isProjectMenuOpen && (
              <div className="absolute left-0 top-12 w-64 bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-2 z-30">
                {PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl transition-all",
                      activeProjectId === project.id
                        ? "bg-white/10 text-white"
                        : "text-brand-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <p className="text-sm font-semibold">{project.name}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {project.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-brand-muted">{activeProject.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-brand-border rounded-xl bg-white/5 text-brand-muted hover:text-white hover:border-white/20 transition-all"
            >
              <Filter size={16} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-3 z-30">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted mb-2">
                  Priority
                </div>
                <div className="space-y-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((priority) => {
                    const isActive = activePriorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={
                          isActive
                            ? "w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 text-white"
                            : "w-full flex items-center justify-between px-3 py-2 rounded-xl text-brand-muted hover:bg-white/5 hover:text-white"
                        }
                      >
                        <span className="text-xs font-medium capitalize">{priority}</span>
                        <span className="text-[10px]">
                          {isActive ? 'On' : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setActivePriorities([])}
                  className="w-full mt-3 text-xs text-brand-muted hover:text-white transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center bg-white/5 border border-brand-border rounded-xl p-1">
            <button 
              onClick={() => setViewMode('board')}
              className={
                viewMode === 'board'
                  ? "p-1.5 bg-white/10 text-white rounded-lg shadow-sm"
                  : "p-1.5 text-brand-muted hover:text-white rounded-lg transition-all"
              }
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={
                viewMode === 'list'
                  ? "p-1.5 bg-white/10 text-white rounded-lg shadow-sm"
                  : "p-1.5 text-brand-muted hover:text-white rounded-lg transition-all"
              }
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => openTaskModal()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/5"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Board / List */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-[#080808]">
        {viewMode === 'board' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-8 h-full min-w-max">
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                const columnTasks = column.taskIds
                  .map((taskId) => tasks[taskId])
                  .filter((task) => matchesFilters(task.title, task.description, task.priority));

                return (
                  <Column 
                    key={column.id} 
                    id={column.id} 
                    title={column.title} 
                    tasks={columnTasks} 
                    onAddTask={() => openTaskModal(column.id)}
                    onRename={handleRenameColumn}
                    onDelete={handleDeleteColumn}
                    canDelete={columnOrder.length > 1}
                  />
                );
              })}
              
              {/* Add Column Placeholder */}
              <div className="w-80 shrink-0 h-full">
                <button
                  onClick={handleAddColumn}
                  className="w-full h-12 border border-dashed border-brand-border rounded-2xl flex items-center justify-center gap-2 text-brand-muted hover:text-white hover:border-white/20 transition-all group"
                >
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Section</span>
                </button>
              </div>
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <TaskList tasks={listTasks} columns={columns} />
          </div>
        )}
      </main>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setActiveColumnId(null);
        }}
        defaultColumnId={activeColumnId}
      />
    </div>

  );
};
