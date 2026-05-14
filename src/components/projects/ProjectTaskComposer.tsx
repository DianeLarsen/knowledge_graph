"use client";

import { useRouter } from "next/navigation";
import NewTaskForm from "@/components/tasks/NewTaskForm";
import type { TaskStatus } from "@/components/tasks/Taskboard";
import { createProjectTaskAction } from "@/app/actions/projects";

type ProjectTaskComposerProps = {
  projectId: string;
  status?: TaskStatus;
};

export default function ProjectTaskComposer({
  projectId,
  status = "todo",
}: ProjectTaskComposerProps) {
  const router = useRouter();

  return (
    <NewTaskForm
      status={status}
      startOpen
      hideToggle
      onCreateTask={async (input) => {
        await createProjectTaskAction({
          projectId,
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          dueDate: input.dueDate,
        });

        router.refresh();
      }}
    />
  );
}
