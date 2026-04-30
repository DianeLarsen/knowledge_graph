// src/app/calendar/events/[eventId]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/db/queries/calendar";
import { getCurrentUserId } from "@/lib/currentUser";
import { updateEventAction } from "@/app/actions/calendar";

type EditEventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  const userId = await getCurrentUserId();

  const event = await getEventById(eventId, userId);

  if (!event) {
    notFound();
  }

  const backHref = `/calendar?year=${event.startDate.slice(0, 4)}&month=${
    Number(event.startDate.slice(5, 7)) - 1
  }&date=${event.startDate.slice(0, 10)}`;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link
          href={backHref}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to Calendar
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit Event
        </h1>
      </div>

      <form
        action={updateEventAction}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <input type="hidden" name="eventId" value={event.id} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            name="title"
            defaultValue={event.title}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={event.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start date
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={event.startDate.slice(0, 10)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End date
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={
                event.endDate?.slice(0, 10) ?? event.startDate.slice(0, 10)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            name="location"
            defaultValue={event.location ?? ""}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
