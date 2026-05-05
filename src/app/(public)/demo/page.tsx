import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  Network,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";
import DemoCaptureBox from "@/components/demo/DemoCaptureBox";


export default function DemoPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 font-sans dark:bg-zinc-950">

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Demo Mode
            </p>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              See how ideas become connected work.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
              This demo uses sample data only. Explore the flow, then create an
              account to save your own notes, captures, tasks, references, and
              projects.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/sign-up"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Account
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Back Home
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <DemoCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Sample Note"
            subtitle="Knowledge Graph Design"
          >
            <p>
              A knowledge graph connects ideas through notes, tags, references,
              and related work. Instead of storing isolated thoughts, the system
              shows how concepts support each other.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Tag>database</Tag>
              <Tag>architecture</Tag>
              <Tag>notes</Tag>
            </div>
          </DemoCard>

          <DemoCard
            icon={<Zap className="h-5 w-5" />}
            title="Sample Capture"
            subtitle="Raw thought dump"
          >
            <div className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Build a project system where notes, tasks, references, and current
              work all connect. Add sharing later.
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Demo only: typing here would not save yet. Tragic, but honest.
            </div>
          </DemoCard>

          <DemoCard
            icon={<CheckSquare className="h-5 w-5" />}
            title="Sample Tasks"
            subtitle="Work tied to the note"
          >
            <ul className="space-y-2 text-sm">
              <Task done>Seed sample notes</Task>
              <Task>Build linking system</Task>
              <Task>Add project sharing</Task>
            </ul>
          </DemoCard>
        </section>
        <DemoCaptureBox />
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center gap-3">
            <Network className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              How the pieces connect
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <FlowItem label="Capture" text="Start messy" />
            <FlowItem label="Note" text="Turn into meaning" />
            <FlowItem label="Task" text="Make it actionable" />
            <FlowItem label="Project" text="Group the work" />
          </div>
        </section>

        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/60 dark:bg-blue-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Ready to save your own work?
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Create an account to store real notes, captures, tasks, and
                projects. Revolutionary concept: your data actually persists.
              </p>
            </div>

            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save My Work
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function DemoCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 inline-flex rounded-xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </p>

      <div className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
      #{children}
    </span>
  );
}

function Task({
  children,
  done = false,
}: {
  children: React.ReactNode;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded border ${
          done
            ? "border-green-500 bg-green-500"
            : "border-zinc-400 dark:border-zinc-600"
        }`}
      >
        {done ? <span className="text-[10px] text-white">✓</span> : null}
      </span>

      <span className={done ? "text-zinc-500 line-through" : ""}>
        {children}
      </span>
    </li>
  );
}

function FlowItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
    </div>
  );
}
