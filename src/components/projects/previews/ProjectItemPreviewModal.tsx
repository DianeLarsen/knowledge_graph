import Link from "next/link";
import { X } from "lucide-react";
import ProjectNotePreviewContent from "@/components/projects/previews/ProjectNotePreviewContent";

type ProjectItemPreviewModalProps = {
  projectId: string;
  previewType: string;
  previewId: string;
};

export default function ProjectItemPreviewModal({
  projectId,
  previewType,
  previewId,
}: ProjectItemPreviewModalProps) {
  const closeHref = `/projects/${projectId}/workspace`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex justify-end">
          <Link
            href={closeHref}
            scroll={false}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        {previewType === "note" ? (
          <ProjectNotePreviewContent noteId={previewId} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preview for {previewType} is not built yet.
          </p>
        )}
      </div>
    </div>
  );
}
