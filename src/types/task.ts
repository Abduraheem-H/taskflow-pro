export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: Priority;
  createdAt: number;
  tags: string[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}
