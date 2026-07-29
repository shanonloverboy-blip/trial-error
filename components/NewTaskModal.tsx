"use client";

import { useState, type FormEvent } from "react";
import type { Task } from "@/lib/types";

export type CreateTaskInput = {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: Task["priority"];
};

export default function NewTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => void;
}) {
  const [form, setForm] = useState<CreateTaskInput>({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "medium",
  });

  function update<K extends keyof CreateTaskInput>(key: K, value: CreateTaskInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onCreate(form);
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Tugas Baru</h2>

        <label className="mb-1 block text-xs font-medium text-slate-600">Judul</label>
        <input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          autoFocus
          required
        />

        <label className="mb-1 block text-xs font-medium text-slate-600">Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">PIC</label>
            <input
              value={form.assignee}
              onChange={(event) => update("assignee", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Deadline</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-600">Prioritas</label>
        <select
          value={form.priority}
          onChange={(event) => update("priority", event.target.value as Task["priority"])}
          className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="low">Rendah</option>
          <option value="medium">Sedang</option>
          <option value="high">Tinggi</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
