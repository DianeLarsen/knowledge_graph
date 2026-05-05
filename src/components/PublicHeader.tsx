"use client";

import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-[rgb(var(--text))] group-hover:opacity-80 sm:text-lg">
              Knowledge Base
            </h1>
            <p className="hidden text-xs text-[rgb(var(--muted))] sm:block">
              Capture. Connect. Build.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] hover:text-[rgb(var(--text))] sm:inline-flex"
          >
            Demo
          </Link>

          <ThemeToggle />

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--card))]">
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link
                href="/notes"
                className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:inline-flex"
              >
                View Notes
              </Link>
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
