import type { TaskTemplate } from '../types/task';

export type WorkspaceProject = {
  id: string;
  name: string;
  description: string;
};

export const WORKSPACE_PROJECTS: WorkspaceProject[] = [
  {
    id: 'roadmap',
    name: 'Product Roadmap',
    description: 'Manage and track your product development lifecycle.'
  },
  {
    id: 'launch',
    name: 'Launch Plan',
    description: 'Coordinate milestones and release deliverables in one view.'
  },
  {
    id: 'growth',
    name: 'Growth Experiments',
    description: 'Run experiments and capture insights with your team.'
  }
];

export const WORKSPACE_ASSIGNEES = [
  'You',
  'Sarah Kim',
  'Daniel Ruiz',
  'Lena Patel',
  'Avery Morgan'
];

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'launch-task',
    name: 'Launch task',
    description: 'A structured task for release work.',
    title: 'Prepare launch deliverable',
    taskDescription: 'Define owner, due date, dependencies, and final acceptance criteria for this launch item.',
    priority: 'high',
    tags: ['launch', 'release'],
    checklist: ['Confirm owner', 'Define acceptance criteria', 'Prepare handoff notes']
  },
  {
    id: 'experiment',
    name: 'Growth experiment',
    description: 'Plan a measurable experiment.',
    title: 'Run growth experiment',
    taskDescription: 'Document the hypothesis, audience, success metric, and follow-up decision for this experiment.',
    priority: 'medium',
    tags: ['growth', 'experiment'],
    checklist: ['Write hypothesis', 'Choose metric', 'Schedule readout']
  },
  {
    id: 'bug-fix',
    name: 'Bug fix',
    description: 'Capture a defect and verification steps.',
    title: 'Investigate product issue',
    taskDescription: 'Reproduce the issue, identify root cause, implement a fix, and verify the expected behavior.',
    priority: 'medium',
    tags: ['bug', 'quality'],
    checklist: ['Reproduce issue', 'Patch root cause', 'Verify fix']
  }
];
