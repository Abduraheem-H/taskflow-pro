import { Priority } from './task';

export type AssistantActionType = 'create-task' | 'update-priority' | 'copy-status';

export interface AssistantAction {
  id: string;
  type: AssistantActionType;
  label: string;
  description: string;
  mutates: boolean;
  payload: {
    taskId?: string;
    title?: string;
    description?: string;
    priority?: Priority;
    status?: string;
    projectId?: string;
    content?: string;
    tags?: string[];
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: AssistantAction[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
