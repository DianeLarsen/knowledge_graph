// src/components/calendar/EventFormFields.tsx

type EventFormFieldsProps = {
  defaultTitle?: string;
  defaultDescription?: string | null;
  defaultStartDate: string;
  defaultEndDate?: string | null;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
  defaultNoteId?: string | null;
  defaultTaskId?: string | null;
  notes: NoteOption[];
  tasks: TaskOption[];
};
type NoteOption = {
  id: string;
  title: string;
};

type TaskOption = {
  id: string;
  title: string;
};
export default function EventFormFields({
  defaultTitle = "",
  defaultDescription = "",
  defaultStartDate,
  defaultEndDate,
  defaultStartTime = "",
  defaultEndTime = "",
  defaultNoteId = "",
  defaultTaskId = "",
  notes,
  tasks,
}: EventFormFieldsProps) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          name="title"
          defaultValue={defaultTitle}
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
          defaultValue={defaultDescription ?? ""}
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
            defaultValue={defaultStartDate}
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
            defaultValue={defaultEndDate ?? defaultStartDate}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start time
          </label>
          <input
            type="time"
            name="startTime"
            defaultValue={defaultStartTime ?? ""}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            End time
          </label>
          <input
            type="time"
            name="endTime"
            defaultValue={defaultEndTime ?? ""}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Linked note
          </label>
          <select
            name="noteId"
            defaultValue={defaultNoteId ?? ""}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="">No linked note</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Linked task
          </label>
          <select
            name="taskId"
            defaultValue={defaultTaskId ?? ""}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="">No linked task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
