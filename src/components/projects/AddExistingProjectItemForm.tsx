"use client";

import { useMemo, useState, useTransition } from "react";
import { addEntityToProjectAction } from "@/app/actions/projects";
import type { EntityType } from "@/db/schema";

type EntityTypeOption =
  | "all"
  | "note"
  | "task"
  | "event"
  | "capture"
  | "reference";

type ExistingProjectItemOption = {
  id: string;
  title: string;
  entityType: EntityType;
};

type AddExistingProjectItemFormProps = {
  projectId: string;
  existingItems: ExistingProjectItemOption[];
};

function getDefaultProjectRole(
  entityType: ExistingProjectItemOption["entityType"],
) {
  if (entityType === "reference") return "reference";
  if (entityType === "capture") return "source";
  return "working";
}

export default function AddExistingProjectItemForm({
  projectId,
  existingItems,
}: AddExistingProjectItemFormProps) {
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] =
    useState<EntityTypeOption>("all");
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedRole, setSelectedRole] = useState("working");
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return existingItems.filter((item) => {
      const matchesType =
        entityTypeFilter === "all" || item.entityType === entityTypeFilter;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.entityType.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [existingItems, search, entityTypeFilter]);

  const selectedItem = useMemo(() => {
    return existingItems.find(
      (item) => `${item.entityType}:${item.id}` === selectedKey,
    );
  }, [existingItems, selectedKey]);

  if (existingItems.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No reusable items available yet.
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await addEntityToProjectAction(formData);
          setSelectedKey("");
          setSelectedRole("working");
        });
      }}
      className="space-y-3"
    >
      <input type="hidden" name="projectId" value={projectId} />

      {selectedItem && (
        <>
          <input
            type="hidden"
            name="entityType"
            value={selectedItem.entityType}
          />
          <input type="hidden" name="entityId" value={selectedItem.id} />
        </>
      )}

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search reusable items..."
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      <select
        value={entityTypeFilter}
        onChange={(event) => {
          setEntityTypeFilter(event.target.value as EntityTypeOption);
          setSelectedKey("");
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="all">All types</option>
        <option value="note">Notes</option>
        <option value="task">Tasks</option>
        <option value="reference">References</option>
        <option value="event">Events</option>
        <option value="capture">Captures</option>
      </select>

      <select
        required
        value={selectedKey}
        onChange={(event) => {
          const nextKey = event.target.value;
          const nextItem = existingItems.find(
            (item) => `${item.entityType}:${item.id}` === nextKey,
          );

          setSelectedKey(nextKey);

          if (nextItem) {
            setSelectedRole(getDefaultProjectRole(nextItem.entityType));
          }
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="" disabled>
          Choose existing item...
        </option>

        {filteredItems.map((item) => (
          <option
            key={`${item.entityType}:${item.id}`}
            value={`${item.entityType}:${item.id}`}
          >
            {item.title} ({item.entityType})
          </option>
        ))}
      </select>

      <select
        name="projectRole"
        value={selectedRole}
        onChange={(event) => setSelectedRole(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="source">Source</option>
        <option value="working">Working</option>
        <option value="completed">Completed</option>
        <option value="reference">Reference</option>
      </select>

      <button
        type="submit"
        disabled={isPending || !selectedItem}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add to Project"}
      </button>
    </form>
  );
}
