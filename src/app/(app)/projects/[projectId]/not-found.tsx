// app/projects/[id]/not-found.tsx
import EntityNotFound from "@/components/shared/EntityNotFound";

export default function NotFound() {
  return (
    <EntityNotFound
      entityName="Project"
      backHref="/projects"
      backLabel="Back to projects"
    />
  );
}
