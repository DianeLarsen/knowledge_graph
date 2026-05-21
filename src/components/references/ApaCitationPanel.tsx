"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { getApaCitation, getApaReference } from "@/lib/apa";


type ApaPanelReference = {
  id: string;
  type: string;
  title: string | null;
  author: string | null;
  url: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  citation?: string | null;
  notes?: string | null;
};

type ApaCitationPanelProps = {
  reference: ApaPanelReference;
};

export default function ApaCitationPanel({ reference }: ApaCitationPanelProps) {
  const [showApa, setShowApa] = useState(false);
  const [copiedApaReference, setCopiedApaReference] = useState(false);
  const [copiedApaCitation, setCopiedApaCitation] = useState(false);
const normalizedReference: {
  type?: string | null;
  title: string;
  author?: string | null;
  url?: string | null;
  publisher?: string | null;
  publishedDate?: string | Date | null;
} = {
  type: reference.type,
  title: reference.title?.trim() || "Untitled reference",
  author: reference.author,
  url: reference.url,
  publisher: reference.publisher,
  publishedDate: reference.publishedDate,
};

const apaReference = getApaReference(normalizedReference);
const apaCitation = getApaCitation(normalizedReference);
  async function copyText(text: string, setCopied: (value: boolean) => void) {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setShowApa((current) => !current)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
      >
        {showApa ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        APA Reference & Citation
      </button>

      {showApa && (
        <div className="mt-2 space-y-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3 text-sm">
          <CitationBlock
            label="APA Reference"
            text={apaReference}
            copied={copiedApaReference}
            onCopy={() => copyText(apaReference, setCopiedApaReference)}
            copyTitle={copiedApaReference ? "Copied" : "Copy APA reference"}
          />

          <CitationBlock
            label="In-text Citation"
            text={apaCitation}
            copied={copiedApaCitation}
            onCopy={() => copyText(apaCitation, setCopiedApaCitation)}
            copyTitle={copiedApaCitation ? "Copied" : "Copy in-text citation"}
          />
        </div>
      )}
    </section>
  );
}

type CitationBlockProps = {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  copyTitle: string;
};

function CitationBlock({
  label,
  text,
  copied,
  onCopy,
  copyTitle,
}: CitationBlockProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[rgb(var(--muted))]">
          {label}
        </p>

        <button
          type="button"
          onClick={onCopy}
          title={copyTitle}
          className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1.5 text-[rgb(var(--muted))] hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="mt-1 text-[rgb(var(--text))]">{text}</p>
    </div>
  );
}
