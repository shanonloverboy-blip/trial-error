"use client";

import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";
import TaskCard from "./TaskCard";
import NewTaskModal, { type CreateTaskInput } from "./NewTaskModal";
import LogoutButton from "./LogoutButton";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Belum Dikerjakan" },
  { key: "in_progress", label: "Sedang Dikerjakan" },
  { key: "done", label: "Selesai" },
];

export default function Board({
  initialTasks,
  isPersistent,
}: {
  initialTasks: Task[];
  isPersistent: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  async function handleCreate(input: CreateTaskInput) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
      setModalOpen(false);
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {!isPersistent && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Mode prototipe: data belum tersimpan permanen. Tambahkan integrasi Vercel KV di dashboard
          project agar data tidak hilang saat redeploy.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Papan Tugas Kantor</h1>
          <p className="text-sm text-slate-500">
            Ganti obrolan WhatsApp yang berantakan dengan papan tugas bersama ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Tugas Baru
          </button>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{column.label}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {grouped[column.key].length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped[column.key].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columns={COLUMNS}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
              {grouped[column.key].length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">Tidak ada tugas</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <NewTaskModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      )}
    </main>
  );
}
