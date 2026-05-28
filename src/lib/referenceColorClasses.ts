export const referenceColorClassMap = {
  slate: [
    "bg-slate-100",
    "text-slate-800",
    "ring-1",
    "ring-slate-300",
    "dark:bg-slate-800",
    "dark:text-slate-100",
    "dark:ring-slate-600",
  ],
  blue: [
    "bg-blue-100",
    "text-blue-800",
    "ring-1",
    "ring-blue-300",
    "dark:bg-blue-900/40",
    "dark:text-blue-100",
    "dark:ring-blue-600",
  ],
  violet: [
    "bg-violet-100",
    "text-violet-800",
    "ring-1",
    "ring-violet-300",
    "dark:bg-violet-900/40",
    "dark:text-violet-100",
    "dark:ring-violet-600",
  ],
  emerald: [
    "bg-emerald-100",
    "text-emerald-800",
    "ring-1",
    "ring-emerald-300",
    "dark:bg-emerald-900/40",
    "dark:text-emerald-100",
    "dark:ring-emerald-600",
  ],
  amber: [
    "bg-amber-100",
    "text-amber-800",
    "ring-1",
    "ring-amber-300",
    "dark:bg-amber-900/40",
    "dark:text-amber-100",
    "dark:ring-amber-600",
  ],
  rose: [
    "bg-rose-100",
    "text-rose-800",
    "ring-1",
    "ring-rose-300",
    "dark:bg-rose-900/40",
    "dark:text-rose-100",
    "dark:ring-rose-600",
  ],
} as const;

export type ReferenceColor = keyof typeof referenceColorClassMap;

export function getReferenceColorByIndex(index: number): ReferenceColor {
  const colors = Object.keys(referenceColorClassMap) as ReferenceColor[];
  return colors[index % colors.length];
}
