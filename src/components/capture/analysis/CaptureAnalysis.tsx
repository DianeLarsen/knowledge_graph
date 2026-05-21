"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTaskFromCaptureAction,
  createNoteFromCaptureAction,
  createReferenceFromCaptureAction,
  createProjectFromCaptureAction,
} from "@/app/actions/capture";

import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";
import CaptureAnalysisSummary from "./CaptureAnalysisSummary";
import CaptureAnalysisTaskList from "./CaptureAnalysisTaskList";
import CaptureAnalysisNoteList from "./CaptureAnalysisNoteList";
import CaptureAnalysisReferenceList from "./CaptureAnalysisReferenceList";
import CaptureProjectBuilderModal from "./CaptureProjectBuilderModal";
import AnalysisSection from "./AnalysisSection";
import type { QuickNote } from "@/lib/types/quickTypes";
import {
  suggestExistingNotesForCaptureProjectAction,
  type ExistingProjectNoteSuggestion,
} from "@/app/actions/projectSuggestions";

export default function CaptureAnalysis({
  analysisJson,
  captureId,
  captureText,
  notes = [],
}: {
  analysisJson: string;
  captureId: string;
  captureText: string;
  notes?: QuickNote[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const analysis = JSON.parse(analysisJson) as CaptureAnalysisData;
  const router = useRouter();
  const [showProjectBuilder, setShowProjectBuilder] = useState(false);
  const [projectTitle, setProjectTitle] = useState(
    analysis.projectTitle || analysis.summary || "",
  );
  const [includeCapture, setIncludeCapture] = useState(true);

  const [selectedTaskIndexes, setSelectedTaskIndexes] = useState<number[]>(
    analysis.possibleTasks.map((_, index) => index),
  );

  const [selectedNoteIndexes, setSelectedNoteIndexes] = useState<number[]>(
    analysis.possibleNotes.map((_, index) => index),
  );

  const [selectedReferenceIndexes, setSelectedReferenceIndexes] = useState<
    number[]
  >(analysis.possibleReferences.map((_, index) => index));

  const [selectedExistingNoteIds, setSelectedExistingNoteIds] = useState<
    string[]
  >([]);
  const [existingNoteSuggestions, setExistingNoteSuggestions] = useState<
    ExistingProjectNoteSuggestion[]
  >([]);

  const [isSuggestingExistingNotes, setIsSuggestingExistingNotes] =
    useState(false);

  async function handleCreateProjectFromCapture() {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("projectTitle", projectTitle);
    formData.set("includeCapture", String(includeCapture));
    formData.set("selectedTaskIndexes", selectedTaskIndexes.join(","));
    formData.set("selectedNoteIndexes", selectedNoteIndexes.join(","));
    formData.set(
      "selectedReferenceIndexes",
      selectedReferenceIndexes.join(","),
    );
    formData.set("selectedExistingNoteIds", selectedExistingNoteIds.join(","));

    await createProjectFromCaptureAction(formData);

    setShowProjectBuilder(false);
    router.refresh();
  }

  async function handleSuggestExistingNotes() {
    if (isSuggestingExistingNotes) return;

    try {
      setIsSuggestingExistingNotes(true);

      const suggestions = await suggestExistingNotesForCaptureProjectAction({
        captureText,
        summary: analysis.summary,
        projectTitle,
        notes,
      });

      setExistingNoteSuggestions(suggestions);
    } catch (error) {
      console.error(error);
      setExistingNoteSuggestions([]);
    } finally {
      setIsSuggestingExistingNotes(false);
    }
  }

  async function handleCreateTaskFromCapture(
    index: number,
    task: CaptureAnalysisData["possibleTasks"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("taskIndex", String(index));
    formData.set("title", task.title);
    formData.set("description", task.description);
    formData.set("priority", task.priority);

    await createTaskFromCaptureAction(formData);
    router.refresh();
  }

  async function handleCreateNoteFromCapture(
    index: number,
    note: CaptureAnalysisData["possibleNotes"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("noteIndex", String(index));
    formData.set("title", note.title);
    formData.set("content", note.content);

    await createNoteFromCaptureAction(formData);
    router.refresh();
  }

  async function handleCreateReferenceFromCapture(
    index: number,
    reference: CaptureAnalysisData["possibleReferences"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("referenceIndex", String(index));
    formData.set("type", reference.type ?? "other");
    formData.set("title", reference.title ?? "");
    formData.set("author", reference.author ?? "");
    formData.set("url", reference.url ?? "");
    formData.set("notes", reference.notes ?? "");

    await createReferenceFromCaptureAction(formData);
    router.refresh();
  }

  return (
    <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
      <CaptureAnalysisSummary
        analysis={analysis}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        onOpenProjectBuilder={() => setShowProjectBuilder(true)}
      />

      {isOpen && (
        <div className="mt-4">
          <p className="mb-4 text-sm text-purple-900 dark:text-purple-100">
            {analysis.summary}
          </p>

          <CaptureAnalysisTaskList
            tasks={analysis.possibleTasks}
            onCreateTask={handleCreateTaskFromCapture}
          />

          <CaptureAnalysisNoteList
            notes={analysis.possibleNotes}
            onCreateNote={handleCreateNoteFromCapture}
          />

          <CaptureAnalysisReferenceList
            references={analysis.possibleReferences}
            onCreateReference={handleCreateReferenceFromCapture}
          />

          <AnalysisSection title="AI Prompts" items={analysis.aiPrompts} />
          <AnalysisSection title="Next Steps" items={analysis.nextSteps} />
          <AnalysisSection
            title="Open Questions"
            items={analysis.openQuestions}
          />
          <AnalysisSection title="Risks" items={analysis.risks} />
        </div>
      )}

      {showProjectBuilder && (
        <CaptureProjectBuilderModal
          analysis={analysis}
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          includeCapture={includeCapture}
          setIncludeCapture={setIncludeCapture}
          existingNoteSuggestions={existingNoteSuggestions}
          selectedExistingNoteIds={selectedExistingNoteIds}
          setSelectedExistingNoteIds={setSelectedExistingNoteIds}
          isSuggestingExistingNotes={isSuggestingExistingNotes}
          onSuggestExistingNotes={handleSuggestExistingNotes}
          selectedTaskIndexes={selectedTaskIndexes}
          setSelectedTaskIndexes={setSelectedTaskIndexes}
          selectedNoteIndexes={selectedNoteIndexes}
          setSelectedNoteIndexes={setSelectedNoteIndexes}
          selectedReferenceIndexes={selectedReferenceIndexes}
          setSelectedReferenceIndexes={setSelectedReferenceIndexes}
          onClose={() => setShowProjectBuilder(false)}
          onCreateProject={handleCreateProjectFromCapture}
        />
      )}
    </div>
  );
}
