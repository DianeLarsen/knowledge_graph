// app/notes/[id]/not-found.tsx
import EntityNotFound from "@/components/shared/EntityNotFound";

export default function NotFound() {
  return (
    <EntityNotFound
      entityName="Note"
      backHref="/notes"
      backLabel="Back to notes"
    />
  );
}
