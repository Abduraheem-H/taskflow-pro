import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem, Task, Priority, Column, ColumnId, ProjectId, AssigneeId } from '../types/task';
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
    tags?: string[],
    checklist?: ChecklistItem[]
  ) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTaskComment: (taskId: string, content: string, author?: AssigneeId) => void;
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
  resetWorkspace: () => void;
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
    comments: [],
    activity: [
      { id: 'activity-1', label: 'Task created from sample workspace', createdAt: Date.now() }
    ],
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
    comments: [],
    activity: [
      { id: 'activity-2', label: 'Task created from sample workspace', createdAt: Date.now() }
    ],
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
  checklist: Array.isArray(task.checklist) ? task.checklist : [],
  comments: Array.isArray(task.comments) ? task.comments : [],
  activity: Array.isArray(task.activity) ? task.activity : []
});

const createActivity = (label: string) => ({
  id: uuidv4(),
  label,
  createdAt: Date.now()
});

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      columns: initialColumns,
      columnOrder: ['todo', 'in-progress', 'review', 'done'],

      addTask: (columnId, title, description, priority, assignee, dueDate, projectId, tags = [], checklist = []) => {
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
          checklist,
          comments: [],
          activity: [{ id: uuidv4(), label: 'Task created', createdAt: now }],
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
          const activityLabels = [
            updates.status && updates.status !== currentTask.status
              ? `Moved to ${state.columns[nextStatus]?.title ?? nextStatus}`
              : '',
            updates.priority && updates.priority !== currentTask.priority
              ? `Priority changed to ${updates.priority}`
              : '',
            updates.assignee && updates.assignee !== currentTask.assignee
              ? `Assigned to ${updates.assignee}`
              : '',
            updates.dueDate !== undefined && updates.dueDate !== currentTask.dueDate
              ? updates.dueDate ? 'Due date updated' : 'Due date cleared'
              : '',
            updates.title && updates.title !== currentTask.title ? 'Title updated' : '',
            updates.description !== undefined && updates.description !== currentTask.description ? 'Description updated' : '',
            updates.tags && updates.tags.join(',') !== currentTask.tags.join(',') ? 'Tags updated' : '',
            updates.checklist && updates.checklist !== currentTask.checklist ? 'Checklist updated' : ''
          ].filter(Boolean);

          const updatedTask = normalizeTask({
            ...currentTask,
            ...updates,
            status: shouldMove ? nextStatus : currentTask.status,
            updatedAt: Date.now(),
            activity: [
              ...(currentTask.activity ?? []),
              ...activityLabels.map((label) => createActivity(label))
            ]
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

      addTaskComment: (taskId, content, author = defaultAssignee) => {
        set((state) => {
          const currentTask = state.tasks[taskId];
          const trimmed = content.trim();
          if (!currentTask || !trimmed) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: normalizeTask({
                ...currentTask,
                updatedAt: Date.now(),
                comments: [
                  ...(currentTask.comments ?? []),
                  {
                    id: uuidv4(),
                    author,
                    content: trimmed,
                    createdAt: Date.now()
                  }
                ],
                activity: [
                  ...(currentTask.activity ?? []),
                  createActivity(`Comment added by ${author}`)
                ]
              })
            }
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
      },

      resetWorkspace: () => {
        set({
          tasks: initialTasks,
          columns: initialColumns,
          columnOrder: ['todo', 'in-progress', 'review', 'done']
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
