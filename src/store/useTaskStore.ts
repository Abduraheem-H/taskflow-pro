import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, Column, ColumnId, ProjectId, AssigneeId } from '../types/task';
import { WORKSPACE_PROJECTS, WORKSPACE_ASSIGNEES } from '../data/workspace';

interface TaskState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: ColumnId[];
  
  // Actions
  addTask: (
    columnId: ColumnId,
    title: string,
    description: string,
    priority: Priority,
    assignee: AssigneeId | undefined,
    dueDate: string | undefined,
    projectId: ProjectId,
    tags?: string[]
  ) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId?: ColumnId) => void;
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

const defaultProjectId = WORKSPACE_PROJECTS[0]?.id ?? 'roadmap';
const defaultAssignee = WORKSPACE_ASSIGNEES[0] ?? 'You';

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Design System Architecture',
    description: 'Define the core components and design tokens for the new project.',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['design', 'core'],
    checklist: [],
    projectId: defaultProjectId,
    assignee: defaultAssignee,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  'task-2': {
    id: 'task-2',
    title: 'Implement Auth Flow',
    description: 'Set up Firebase authentication and protected routes.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['auth', 'backend'],
    checklist: [],
    projectId: defaultProjectId,
    assignee: WORKSPACE_ASSIGNEES[1],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
  }
};

const initialColumns: Record<string, Column> = {
  'todo': { id: 'todo', title: 'To Do', taskIds: ['task-1'] },
  'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: ['task-2'] },
  'review': { id: 'review', title: 'Review', taskIds: [] },
  'done': { id: 'done', title: 'Done', taskIds: [] }
};

const normalizeTask = (task: Task): Task => ({
  ...task,
  updatedAt: task.updatedAt ?? task.createdAt ?? Date.now(),
  tags: Array.isArray(task.tags) ? task.tags : [],
  checklist: Array.isArray(task.checklist) ? task.checklist : []
});

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      columns: initialColumns,
      columnOrder: ['todo', 'in-progress', 'review', 'done'],

      addTask: (columnId, title, description, priority, assignee, dueDate, projectId, tags = []) => {
        const id = uuidv4();
        const now = Date.now();
        const newTask: Task = {
          id,
          title,
          description,
          status: columnId,
          priority,
          createdAt: now,
          updatedAt: now,
          tags,
          checklist: [],
          projectId,
          assignee,
          dueDate: dueDate || undefined
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
        set((state) => {
          const currentTask = state.tasks[taskId];
          if (!currentTask) return state;

          const nextStatus = updates.status ?? currentTask.status;
          const shouldMove = updates.status && updates.status !== currentTask.status && state.columns[nextStatus];
          const updatedTask = normalizeTask({
            ...currentTask,
            ...updates,
            status: shouldMove ? nextStatus : currentTask.status,
            updatedAt: Date.now()
          });

          if (!shouldMove) {
            return {
              tasks: {
                ...state.tasks,
                [taskId]: updatedTask
              }
            };
          }

          const nextColumns = Object.fromEntries(
            Object.entries(state.columns).map(([columnId, column]) => {
              const taskIds = column.taskIds.filter((id) => id !== taskId);
              return [columnId, { ...column, taskIds }];
            })
          ) as Record<string, Column>;

          nextColumns[nextStatus] = {
            ...nextColumns[nextStatus],
            taskIds: [...nextColumns[nextStatus].taskIds, taskId]
          };

          return {
            tasks: {
              ...state.tasks,
              [taskId]: updatedTask
            },
            columns: nextColumns
          };
        });
      },

      deleteTask: (taskId, columnId) => {
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[taskId];
          const targetColumnId = columnId ?? state.tasks[taskId]?.status;
          
          return {
            tasks: newTasks,
            columns: Object.fromEntries(
              Object.entries(state.columns).map(([id, column]) => [
                id,
                id === targetColumnId || column.taskIds.includes(taskId)
                  ? { ...column, taskIds: column.taskIds.filter((id) => id !== taskId) }
                  : column
              ])
            ) as Record<string, Column>
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
              [taskId]: { ...state.tasks[taskId], status: destColId, updatedAt: Date.now() }
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
      name: 'taskflow-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<TaskState>;
        const columns = state.columns ?? initialColumns;
        const columnOrder = state.columnOrder ?? ['todo', 'in-progress', 'review', 'done'];
        const tasks = Object.fromEntries(
          Object.entries(state.tasks ?? initialTasks).map(([id, task]) => [id, normalizeTask(task as Task)])
        ) as Record<string, Task>;

        return {
          ...state,
          tasks,
          columns,
          columnOrder
        };
      }
    }
  )
);
