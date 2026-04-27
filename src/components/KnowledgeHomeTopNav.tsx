"use client";

import React from "react";
import { BookOpen, CheckSquare, CalendarDays, Zap, Laptop } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Notes", description: "Think", icon: BookOpen, href: "/notes" },
  { label: "Tasks", description: "Do", icon: CheckSquare, href: "/tasks" },
  {
    label: "Calendar",
    description: "Plan",
    icon: CalendarDays,
    href: "/calendar",
  },
  { label: "Capture", description: "Dump ideas", icon: Zap, href: "/capture" },
  {
    label: "Current Work",
    description: "Build",
    icon: Laptop,
    href: "/projects/current",
  },
  {
    label: "Workspace",
    description: "Build",
    icon: Laptop,
    href: "/workspace",
  },
];

export default function KnowledgeHomeTopNav() {
  const pathname = usePathname();

  return (
    <section className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 shadow-sm">
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--text))]">
            Knowledge Home
          </h1>
          <p className="text-sm hidden sm:flex text-[rgb(var(--muted))]">
            Capture, organize, plan, and get back to work without wandering into
            the digital junk drawer.
          </p>
        </div>

        <ThemeToggle />
      </div>

      <nav aria-label="Primary knowledge navigation">
        <ul className="grid grid-cols-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    group flex h-auto flex-col justify-between rounded-2xl border p-2 sm:p-3 lg:p-4 transition
                    hover:-translate-y-0.5 hover:shadow-md

                    ${
                      isActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`
                        rounded-xl p-2 shadow-sm
                        ${
                          isActive
                            ? "bg-blue-100 dark:bg-blue-800"
                            : "bg-[rgb(var(--bg))]"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          h-4 w-4 sm:h-5 sm:w-5
                          ${
                            isActive
                              ? "text-blue-600 dark:text-blue-300"
                              : "text-[rgb(var(--text))]"
                          }
                        `}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[rgb(var(--text))]">
                      {item.label}
                    </h2>
                    <p className="text-sm text-[rgb(var(--muted))]">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
