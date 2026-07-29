import { randomUUID } from "crypto";
import { store } from "./kv-client";
import type { Task, TaskInput } from "./types";

const TASKS_KEY = "office-tasks:list";

export async function listTasks(): Promise<Task[]> {
  const tasks = await store.get<Task[]>(TASKS_KEY);
  return tasks ?? [];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const tasks = await listTasks();
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? "",
    assignee: input.assignee ?? "",
    dueDate: input.dueDate ?? "",
    priority: input.priority ?? "medium",
    status: "todo",
    createdAt: now,
    updatedAt: now,
  };
  await store.set(TASKS_KEY, [task, ...tasks]);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task | null> {
  const tasks = await listTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  const updated: Task = {
    ...tasks[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updated;
  await store.set(TASKS_KEY, tasks);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await listTasks();
  const next = tasks.filter((task) => task.id !== id);
  if (next.length === tasks.length) return false;
  await store.set(TASKS_KEY, next);
  return true;
}
