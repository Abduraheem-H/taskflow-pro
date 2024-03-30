import { create } from 'zustand';
import { Task, Priority } from '../types/task';

interface ColumnState {
  id: string;
  title: string;
  taskIds: string[];
}

interface TaskState {
  tasks: Record<string, Task>;
  columns: Record<string, ColumnState>;
  columnOrder: string[];
  addTask: (title: string, description: string, priority: Priority) => void;
  moveTask: (
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number,
    taskId: string
  ) => void;
  reorderColumn: (columnId: string, startIndex: number, endIndex: number) => void;
}

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Design system audit',
    description: 'Review existing patterns and update tokens.',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now(),
    tags: ['design']
  }
};

const initialColumns: Record<string, ColumnState> = {
  todo: { id: 'todo', title: 'To Do', taskIds: ['task-1'] },
  'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
  review: { id: 'review', title: 'Review', taskIds: [] },
  done: { id: 'done', title: 'Done', taskIds: [] }
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: initialTasks,
  columns: initialColumns,
  columnOrder: ['todo', 'in-progress', 'review', 'done'],
  addTask: (title, description, priority) => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      id,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: Date.now(),
      tags: []
    };
    set((state) => ({
      tasks: { ...state.tasks, [id]: newTask },
      columns: {
        ...state.columns,
        todo: {
          ...state.columns.todo,
          taskIds: [...state.columns.todo.taskIds, id]
        }
      }
    }));
  },
  moveTask: (sourceColumnId, destinationColumnId, sourceIndex, destinationIndex, taskId) => {
    set((state) => {
      const sourceColumn = state.columns[sourceColumnId];
      const destinationColumn = state.columns[destinationColumnId];
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      const destinationTaskIds = Array.from(destinationColumn.taskIds);

      sourceTaskIds.splice(sourceIndex, 1);
      destinationTaskIds.splice(destinationIndex, 0, taskId);

      return {
        tasks: {
          ...state.tasks,
          [taskId]: { ...state.tasks[taskId], status: destinationColumnId }
        },
        columns: {
          ...state.columns,
          [sourceColumnId]: { ...sourceColumn, taskIds: sourceTaskIds },
          [destinationColumnId]: { ...destinationColumn, taskIds: destinationTaskIds }
        }
      };
    });
  },
  reorderColumn: (columnId, startIndex, endIndex) => {
    set((state) => {
      const column = state.columns[columnId];
      const newTaskIds = Array.from(column.taskIds);
      const [removed] = newTaskIds.splice(startIndex, 1);
      newTaskIds.splice(endIndex, 0, removed);

      return {
        columns: {
          ...state.columns,
          [columnId]: { ...column, taskIds: newTaskIds }
        }
      };
    });
  }
}));