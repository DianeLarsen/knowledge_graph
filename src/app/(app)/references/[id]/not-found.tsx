// app/tasks/[id]/not-found.tsx
import EntityNotFound from "@/components/shared/EntityNotFound";

export default function NotFound() {
  return (
    <EntityNotFound
      entityName="References"
      backHref="/references"
      backLabel="Back to references"
    />
  );
}
