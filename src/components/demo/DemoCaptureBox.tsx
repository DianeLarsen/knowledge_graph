"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function DemoCaptureBox() {
  const [text, setText] = useState(
    "I want to build a project system where notes, tasks, references, and current work all connect.",
  );
  const [showResult, setShowResult] = useState(false);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Try a sample capture
        </h2>
      </div>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Type a messy idea below. This demo shows an example of how a capture
        could be turned into notes, tasks, and references. Nothing is saved.
      </p>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setShowResult(false);
        }}
        rows={5}
        className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
      />

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setShowResult(true)}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Show Example Output
        </button>

        <Link
          href="/sign-up"
          className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Get Started Now
        </Link>
      </div>

      {showResult && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Example output based on the kind of structure this app creates:
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <PreviewBox title="Suggested Note" text="Project System Design" />
            <PreviewBox
              title="Suggested Task"
              text="Define project ownership and sharing rules"
            />
            <PreviewBox
              title="Suggested Reference"
              text="Store related links or source material"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function PreviewBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {text}
      </p>
    </div>
  );
}
