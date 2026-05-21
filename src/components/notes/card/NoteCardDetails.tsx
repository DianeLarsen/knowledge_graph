import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import LinkedReferenceCard from "@/components/references/LinkedReferenceCard";
import { removeReferenceFromNoteAction } from "@/app/actions/references";
import { getRelationshipLabel } from "@/lib/entityRelationships";
import type {
  Backlink,
  NoteDetails,
  OutgoingLink,
  SharedTagNote,
} from "./noteCardTypes";
import {
  getEventDateLabel,
  getEventStatusLabel,
  getLinkedItemLabel,
  getLinkPillClass,
  getTaskStatusLabel,
} from "./noteCardUtils";

type NoteCardDetailsProps = {
  noteId: string;
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  outgoingLinks: OutgoingLink[];
  backlinks: Backlink[];
  sharedTags: SharedTagNote[];
  references: NonNullable<NoteDetails["references"]>;
  userId: string;
  onOpenNote?: (noteId: string) => void;
  router: AppRouterInstance;
};

export default function NoteCardDetails({
  noteId,
  showDetails,
  setShowDetails,
  outgoingLinks,
  backlinks,
  sharedTags,
  references,
  userId,
  onOpenNote,
  router,
}: NoteCardDetailsProps) {
  function openLinkedItem({ type, id }: { type: string; id: string }) {
    if (type === "note") {
      onOpenNote?.(id);
      return;
    }

    if (type === "task") {
      router.push(`/tasks#${id}`);
      return;
    }

    if (type === "event") {
      router.push(`/calendar#${id}`);
    }
  }

  return (
    <div className="px-4 py-3 text-sm">
      <button
        type="button"
        onClick={() => setShowDetails((current) => !current)}
        className="
          rounded-full border border-gray-300 bg-gray-50 px-3 py-1
          text-xs font-medium text-gray-700 transition
          hover:bg-gray-100
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
          dark:hover:bg-gray-800
        "
      >
        {showDetails ? "Hide additional info" : "Show additional info"}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4">
          {outgoingLinks.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                This note links to
              </h2>

              <div className="flex flex-wrap gap-2">
                {outgoingLinks.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() =>
                      openLinkedItem({
                        type: link.targetType,
                        id: link.targetId,
                      })
                    }
                    className={`
                      rounded-full border px-3 py-1 text-xs transition
                      ${getLinkPillClass({
                        itemType: link.targetType,
                        taskStatus: link.targetTask?.status,
                        eventStatus: link.targetEvent?.status,
                        direction: "outgoing",
                      })}
                    `}
                  >
                    {link.targetTitle ?? `Untitled ${link.targetType}`}

                    <span className="ml-1 text-[10px] opacity-70">
                      ({getLinkedItemLabel(link)})
                    </span>

                    {link.targetTask && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getTaskStatusLabel(link.targetTask.status)}
                      </span>
                    )}

                    {link.targetEvent && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getEventStatusLabel(link.targetEvent.status)} ·{" "}
                        {getEventDateLabel(link.targetEvent)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {backlinks.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Links back here
              </h2>

              <div className="flex flex-wrap gap-2">
                {backlinks.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() =>
                      openLinkedItem({
                        type: link.sourceType,
                        id: link.sourceId,
                      })
                    }
                    className={`
                      rounded-full border px-3 py-1 text-xs transition
                      ${getLinkPillClass({
                        itemType: link.sourceType,
                        taskStatus: link.sourceTask?.status,
                        eventStatus: link.sourceEvent?.status,
                        direction: "backlink",
                      })}
                    `}
                  >
                    {link.sourceTitle ?? `Untitled ${link.sourceType}`}

                    <span className="ml-1 text-[10px] opacity-70">
                      ({getRelationshipLabel(link.relationshipType)})
                    </span>

                    {link.sourceTask && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getTaskStatusLabel(link.sourceTask.status)}
                      </span>
                    )}

                    {link.sourceEvent && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getEventStatusLabel(link.sourceEvent.status)} ·{" "}
                        {getEventDateLabel(link.sourceEvent)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {sharedTags.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Related by tag
              </h2>

              <div className="flex flex-wrap gap-2">
                {sharedTags.map((related) => (
                  <button
                    type="button"
                    key={`${related.id}-${related.sharedTagId}`}
                    onClick={() => onOpenNote?.(related.id)}
                    className="
                      rounded-full border border-gray-200 bg-gray-50 px-3 py-1
                      text-xs text-gray-700 hover:bg-gray-100
                      dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
                      dark:hover:bg-gray-800
                    "
                  >
                    {related.title}
                    <span className="ml-1 text-[10px] text-gray-500">
                      #{related.sharedTagName}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {references.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-[rgb(var(--text))]">
                References
              </h2>

              <div className="space-y-2">
                {references.map((reference) => (
                  <LinkedReferenceCard
                    key={reference.noteReferenceId}
                    reference={reference}
                    noteId={noteId}
                    canRemove={!!userId}
                    onRemoveAction={removeReferenceFromNoteAction}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
