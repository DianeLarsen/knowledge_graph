"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  suggestProjectStarterAction,
  createProjectStarterItemsAction,
} from "@/app/actions/projectStarter";

type StarterTask = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
};

type StarterNote = {
  title: string;
  content: string;
};

type StarterSuggestions = {
  tasks: StarterTask[];
  notes: StarterNote[];
};

type ProjectStarterPanelProps = {
  projectId: string;
  projectTitle: string;
  projectDescription?: string | null;
};

export default function ProjectStarterPanel({
  projectId,
  projectTitle,
  projectDescription,
}: ProjectStarterPanelProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<StarterSuggestions | null>(
    null,
  );
  const [selectedTaskIndexes, setSelectedTaskIndexes] = useState<number[]>([]);
  const [selectedNoteIndexes, setSelectedNoteIndexes] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  function toggleIndex(
    index: number,
    values: number[],
    setter: (next: number[]) => void,
  ) {
    setter(
      values.includes(index)
        ? values.filter((value) => value !== index)
        : [...values, index],
    );
  }

  async function handleSuggest() {
    try {
      setIsSuggesting(true);
      setMessage("");

      const result = await suggestProjectStarterAction({
        projectTitle,
        projectDescription: projectDescription ?? "",
      });

      setSuggestions(result);
      setSelectedTaskIndexes(result.tasks.map((_, index) => index));
      setSelectedNoteIndexes(result.notes.map((_, index) => index));
    } catch (error) {
      console.error(error);
      setMessage("Could not generate starter ideas.");
    } finally {
      setIsSuggesting(false);
    }
  }

  async function handleCreateSelected() {
    if (!suggestions) return;

    try {
      setIsCreating(true);
      setMessage("");

      await createProjectStarterItemsAction({
        projectId,
        tasks: suggestions.tasks.filter((_, index) =>
          selectedTaskIndexes.includes(index),
        ),
        notes: suggestions.notes.filter((_, index) =>
          selectedNoteIndexes.includes(index),
        ),
      });

      setMessage("Starter items created.");
    } catch (error) {
      console.error(error);
      setMessage("Could not create starter items.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
          Project starter
        </p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
          Generate a practical starting plan from this project title and
          description.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSuggest}
        disabled={isSuggesting}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-gray-950 dark:text-amber-200 dark:hover:bg-amber-900/40"
      >
        <Sparkles size={14} />
        {isSuggesting ? "Planning..." : "Suggest starter items"}
      </button>

      {suggestions && (
        <div className="space-y-4">
          {suggestions.tasks.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Suggested tasks
              </h3>

              <div className="space-y-2">
                {suggestions.tasks.map((task, index) => (
                  <label
                    key={`${task.title}-${index}`}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTaskIndexes.includes(index)}
                      onChange={() =>
                        toggleIndex(
                          index,
                          selectedTaskIndexes,
                          setSelectedTaskIndexes,
                        )
                      }
                    />

                    <span>
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {task.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {suggestions.notes.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Suggested planning notes
              </h3>

              <div className="space-y-2">
                {suggestions.notes.map((note, index) => (
                  <label
                    key={`${note.title}-${index}`}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNoteIndexes.includes(index)}
                      onChange={() =>
                        toggleIndex(
                          index,
                          selectedNoteIndexes,
                          setSelectedNoteIndexes,
                        )
                      }
                    />

                    <span>
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">
                        {note.title}
                      </span>
                      <span className="line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">
                        {note.content}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={handleCreateSelected}
            disabled={isCreating}
            className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Create selected starter items"}
          </button>
        </div>
      )}

      {message && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
