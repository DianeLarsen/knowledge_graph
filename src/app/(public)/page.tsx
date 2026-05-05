
import FeatureCard from "@/components/FeatureCard";
import { Network, Zap, CheckSquare } from "lucide-react";
import Link from "next/link";

export default async function Home() {

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-8 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Think clearly. Build faster. Stop losing ideas.
          </h1>

          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            A personal knowledge system that connects notes, tasks, references,
            and projects so your ideas don’t die in a random notebook or a
            forgotten tab.
          </p>

          <div className="flex gap-3">
            <Link
              href="/demo"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Explore Demo
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Connected thinking"
            text="Notes don’t live alone. Link ideas, share tags, and see how concepts actually relate instead of getting buried."
            icon={
              <Network className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            }
          />

          <FeatureCard
            title="Capture without friction"
            text="Dump ideas fast with zero structure, then turn them into notes, tasks, or references when you're ready."
            icon={<Zap className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
          />

          <FeatureCard
            title="Work from your knowledge"
            text="Tasks, calendar, and projects stay tied to your notes, so you’re not switching between thinking and doing."
            icon={
              <CheckSquare className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            }
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Example: From idea → structured system
          </h2>

          <div className="rounded-2xl border bg-white p-4 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 mb-2">Capture:</p>
            <div className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
              “Build a knowledge graph app with notes, tasks, and references…”
            </div>

            <p className="text-sm text-zinc-500 mt-4 mb-2">Becomes:</p>
            <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <li>• Note: Knowledge Graph Design</li>
              <li>• Task: Build linking system</li>
              <li>• Reference: Drizzle ORM docs</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );

}
