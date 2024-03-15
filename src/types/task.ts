export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  createdAt: number;
  tags: string[];
}