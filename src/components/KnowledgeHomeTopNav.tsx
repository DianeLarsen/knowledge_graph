"use client";

import {
  BookOpen,
  BookMarked,
  CheckSquare,
  CalendarDays,
  Zap,
  Play,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { useState } from "react";

const navItems = [
  { label: "Notes", description: "Think", icon: BookOpen, href: "/notes" },
  {
    label: "References",
    description: "Sources",
    icon: BookMarked,
    href: "/references",
  },
  { label: "Tasks", description: "Do", icon: CheckSquare, href: "/tasks" },
  {
    label: "Calendar",
    description: "Plan",
    icon: CalendarDays,
    href: "/calendar",
  },
  { label: "Capture", description: "Ideas", icon: Zap, href: "/captures" },
  {
    label: "Projects",
    description: "Focus",
    icon: Play,
    href: "/projects",
  },
  {
    label: "Workspace",
    description: "Explore",
    icon: LayoutGrid,
    href: "/workspace",
  },
];

export default function KnowledgeHomeTopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Show when="signed-in">
      <nav
        aria-label="Primary knowledge navigation"
        className="sticky top-16 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/85 backdrop-blur"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex items-center justify-between py-2 md:hidden">
            <Link
              href="/notes"
              className="text-sm font-semibold text-[rgb(var(--text))]"
              onClick={() => setIsOpen(false)}
            >
              View Notes
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="rounded-xl border border-[rgb(var(--border))] p-2 text-[rgb(var(--text))] hover:bg-[rgb(var(--card))]"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          <ul className="hidden w-full grid-cols-7 gap-2 py-2 md:grid">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`
    group flex min-h-[48px] w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition
    hover:min-h-[64px]
    ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] hover:text-[rgb(var(--text))]"
    }
  `}
                  >
                    <div className="flex items-center gap-2 transition-all group-hover:flex-col group-hover:gap-1">
                      <Icon className="h-4 w-4" />

                      <div className="flex flex-col items-center leading-tight">
                        <span>{item.label}</span>
                        <span className="max-h-0 overflow-hidden opacity-0 transition-all group-hover:max-h-4 group-hover:opacity-100">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {isOpen && (
            <ul className="grid gap-1 pb-3 md:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] hover:text-[rgb(var(--text))]"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>
    </Show>
  );
}
