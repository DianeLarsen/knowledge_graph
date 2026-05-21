// CaptureAnalysisTypes.ts

export type CaptureAnalysisData = {
  summary: string;
  projectCreated?: boolean;
  projectId?: string;
  projectTitle?: string;
  possibleTasks: {
    title: string;
    description: string;
    priority: string;
    status: string;
    created?: boolean;
    taskId?: string;
    duplicateWarning?: boolean;
    similarTaskId?: string;
    similarTaskTitle?: string;
  }[];
  possibleNotes: {
    title: string;
    content: string;
    created?: boolean;
    noteId?: string;
  }[];
  possibleReferences: {
    type?: string;
    title?: string;
    author?: string;
    url?: string;
    notes?: string;
    created?: boolean;
    referenceId?: string;
    duplicateWarning?: boolean;
    existingReferenceTitle?: string;
  }[];
  aiPrompts: string[];
  nextSteps: string[];
  openQuestions: string[];
  risks: string[];
};
