import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, Column, ColumnId } from '../types/task';

interface TaskState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: ColumnId[];
  
  // Actions
  addTask: (columnId: ColumnId, title: string, description: string, priority: Priority) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: ColumnId) => void;
  moveTask: (
    sourceColumnId: ColumnId,
    destinationColumnId: ColumnId,
    sourceIndex: number,
    destinationIndex: number,
    taskId: string
  ) => void;
  reorderColumn: (columnId: ColumnId, startIndex: number, endIndex: number) => void;
  addColumn: (title: string) => ColumnId;
  renameColumn: (columnId: ColumnId, title: string) => void;
  deleteColumn: (columnId: ColumnId) => void;
}

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Design System Architecture',
    description: 'Define the core components and design tokens for the new project.',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now(),
    tags: ['design', 'core']
  },
  'task-2': {
    id: 'task-2',
    title: 'Implement Auth Flow',
    description: 'Set up Firebase authentication and protected routes.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: Date.now(),
    tags: ['auth', 'backend']
  }
};

const initialColumns: Record<string, Column> = {
  'todo': { id: 'todo', title: 'To Do', taskIds: ['task-1'] },
  'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: ['task-2'] },
  'review': { id: 'review', title: 'Review', taskIds: [] },
  'done': { id: 'done', title: 'Done', taskIds: [] }
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      columns: initialColumns,
      columnOrder: ['todo', 'in-progress', 'review', 'done'],

      addTask: (columnId, title, description, priority) => {
        const id = uuidv4();
        const newTask: Task = {
          id,
          title,
          description,
          status: columnId,
          priority,
          createdAt: Date.now(),
          tags: []
        };

        set((state) => ({
          tasks: { ...state.tasks, [id]: newTask },
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              taskIds: [...state.columns[columnId].taskIds, id]
            }
          }
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], ...updates }
          }
        }));
      },

      deleteTask: (taskId, columnId) => {
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[taskId];
          
          return {
            tasks: newTasks,
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                taskIds: state.columns[columnId].taskIds.filter(id => id !== taskId)
              }
            }
          };
        });
      },

      moveTask: (sourceColId, destColId, sourceIdx, destIdx, taskId) => {
        set((state) => {
          const sourceCol = state.columns[sourceColId];
          const destCol = state.columns[destColId];
          
          const newSourceTaskIds = Array.from(sourceCol.taskIds);
          newSourceTaskIds.splice(sourceIdx, 1);
          
          const newDestTaskIds = Array.from(destCol.taskIds);
          newDestTaskIds.splice(destIdx, 0, taskId);
          
          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...state.tasks[taskId], status: destColId }
            },
            columns: {
              ...state.columns,
              [sourceColId]: { ...sourceCol, taskIds: newSourceTaskIds },
              [destColId]: { ...destCol, taskIds: newDestTaskIds }
            }
          };
        });
      },

      reorderColumn: (columnId, startIdx, endIdx) => {
        set((state) => {
          const column = state.columns[columnId];
          const newTaskIds = Array.from(column.taskIds);
          const [removed] = newTaskIds.splice(startIdx, 1);
          newTaskIds.splice(endIdx, 0, removed);
          
          return {
            columns: {
              ...state.columns,
              [columnId]: { ...column, taskIds: newTaskIds }
            }
          };
        });
      },

      addColumn: (title) => {
        const id = `col-${uuidv4().slice(0, 8)}`;

        set((state) => ({
          columns: {
            ...state.columns,
            [id]: { id, title, taskIds: [] }
          },
          columnOrder: [...state.columnOrder, id]
        }));

        return id;
      },

      renameColumn: (columnId, title) => {
        set((state) => {
          if (!state.columns[columnId]) return state;

          return {
            columns: {
              ...state.columns,
              [columnId]: { ...state.columns[columnId], title }
            }
          };
        });
      },

      deleteColumn: (columnId) => {
        set((state) => {
          if (!state.columns[columnId] || state.columnOrder.length <= 1) return state;

          const remainingOrder = state.columnOrder.filter((id) => id !== columnId);
          const fallbackColumnId = remainingOrder[0];
          const removedTaskIds = state.columns[columnId].taskIds;

          const newColumns = { ...state.columns };
          delete newColumns[columnId];

          const newTasks = { ...state.tasks };

          if (fallbackColumnId) {
            removedTaskIds.forEach((taskId) => {
              if (newTasks[taskId]) {
                newTasks[taskId] = { ...newTasks[taskId], status: fallbackColumnId };
              }
            });

            const fallbackColumn = newColumns[fallbackColumnId];
            newColumns[fallbackColumnId] = {
              ...fallbackColumn,
              taskIds: [...fallbackColumn.taskIds, ...removedTaskIds]
            };
          } else {
            removedTaskIds.forEach((taskId) => {
              delete newTasks[taskId];
            });
          }

          return {
            tasks: newTasks,
            columns: newColumns,
            columnOrder: remainingOrder
          };
        });
      }
    }),
    {
      name: 'taskflow-storage'
    }
  )
);
