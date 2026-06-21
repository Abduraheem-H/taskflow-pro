export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = string;
export type ProjectId = string;
export type AssigneeId = string;

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  priority: Priority;
  createdAt: number;
  tags: string[];
  projectId: ProjectId;
  assignee?: AssigneeId;
  dueDate?: string;
  updatedAt?: number;
  checklist?: ChecklistItem[];
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}
