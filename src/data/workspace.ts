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
