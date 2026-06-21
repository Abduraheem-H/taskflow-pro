export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = string;
export type ProjectId = string;
export type AssigneeId = string;

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: AssigneeId;
  content: string;
  createdAt: number;
}

export interface TaskActivity {
  id: string;
  label: string;
  createdAt: number;
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
  comments?: TaskComment[];
  activity?: TaskActivity[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  taskDescription: string;
  priority: Priority;
  tags: string[];
  checklist: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}
