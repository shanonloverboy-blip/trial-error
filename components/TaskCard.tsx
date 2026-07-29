"use client";

import type { Task, TaskStatus } from "@/lib/types";

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
};

export default function TaskCard({
  task,
  columns,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  columns: { key: TaskStatus; label: string }[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium">{task.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLE[task.priority]}`}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
      {task.description && <p className="mb-2 text-xs text-slate-500">{task.description}</p>}
      <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {task.assignee && <span>PIC: {task.assignee}</span>}
        {task.dueDate && <span>Deadline: {task.dueDate}</span>}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
          className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
        >
          {columns.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs text-slate-400 hover:text-red-600"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
