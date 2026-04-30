// src/components/calendar/EventFormPopup.tsx

import { createEventAction } from "@/app/actions/calendar";
import EventFormFields from "@/components/calendar/EventFormFields";

type EventFormPopupProps = {
  selectedDate: string;
  onClose: () => void;
};

export default function EventFormPopup({
  selectedDate,
  onClose,
}: EventFormPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              New Event
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Starting on {selectedDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <form
          action={createEventAction}
          onSubmit={onClose}
          className="space-y-3"
        >
          <EventFormFields defaultStartDate={selectedDate} />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              Add Event
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
