import { NextRequest, NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/lib/tasks";
import type { Task } from "@/lib/types";

const ALLOWED_STATUS: Task["status"][] = ["todo", "in_progress", "done"];
const ALLOWED_PRIORITY: Task["priority"][] = ["low", "medium", "high"];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const patch: Partial<Task> = {};

  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description;
  if (typeof body.assignee === "string") patch.assignee = body.assignee;
  if (typeof body.dueDate === "string") patch.dueDate = body.dueDate;
  if (ALLOWED_STATUS.includes(body.status)) patch.status = body.status;
  if (ALLOWED_PRIORITY.includes(body.priority)) patch.priority = body.priority;

  const task = await updateTask(params.id, patch);
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ task });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const deleted = await deleteTask(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
