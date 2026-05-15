import {
  getCapturesAction,
  createCaptureFormAction,
} from "@/app/actions/capture";
import { Zap } from "lucide-react";
import CaptureList from "@/components/capture/CaptureList";

export default async function CapturePage() {
  const captures = await getCapturesAction();

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-[rgb(var(--bg))] px-6 py-8 text-[rgb(var(--text))]">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-amber-500" />

          <h1 className="text-3xl font-bold text-[rgb(var(--text))]">
            Capture
          </h1>
        </div>

        <p className="mt-2 text-sm text-[rgb(var(--muted))]">
          Dump messy ideas here. We’ll make sense of them later, because
          apparently your brain insists on filing everything in one drawer.
        </p>
      </div>

      <form action={createCaptureFormAction} className="mb-10 space-y-4">
        <textarea
          name="rawText"
          rows={10}
          placeholder="Dump your thoughts, project ideas, reminders, references, half-formed plans, suspiciously urgent nonsense..."
          className="
            w-full rounded-2xl border border-[rgb(var(--border))]
            bg-[rgb(var(--card))] p-4 text-sm
            text-[rgb(var(--text))] shadow-sm outline-none
            placeholder:text-[rgb(var(--muted))]
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            dark:focus:border-blue-400 dark:focus:ring-blue-900
          "
        />

        <button
          type="submit"
          className="
            rounded-xl bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white shadow
            hover:bg-blue-700
          "
        >
          Save Capture
        </button>
      </form>

      <CaptureList captures={captures} />
    </main>
  );
}
