import {
  createCaptureAction,
  getCapturesAction,
  analyzeCaptureAction,
  markCaptureProcessedAction,
} from "@/app/actions/capture";
import { Zap } from "lucide-react";
import CaptureAnalysis from "@/components/capture/CaptureAnalysis";
import CaptureList from "@/components/capture/CaptureList";

export default async function CapturePage() {
  const captures = await getCapturesAction();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Capture
          </h1>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Dump messy ideas here. We’ll make sense of them later, because
          apparently your brain insists on filing everything in one drawer.
        </p>
      </div>

      <form action={createCaptureAction} className="mb-10 space-y-4">
        <textarea
          name="rawText"
          rows={10}
          placeholder="Dump your thoughts, project ideas, reminders, references, half-formed plans, suspiciously urgent nonsense..."
          className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Save Capture
        </button>
      </form>

      <CaptureList captures={captures} />
    </main>
  );
}
