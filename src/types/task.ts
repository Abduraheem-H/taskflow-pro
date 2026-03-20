export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  priority: Priority;
  createdAt: number;
  tags: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}
