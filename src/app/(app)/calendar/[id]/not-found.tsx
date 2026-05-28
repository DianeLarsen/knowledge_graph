// app/tasks/[id]/not-found.tsx
import EntityNotFound from "@/components/shared/EntityNotFound";

export default function NotFound() {
  return (
    <EntityNotFound
      entityName="Calendar"
      backHref="/calendar"
      backLabel="Back to calendar"
    />
  );
}
