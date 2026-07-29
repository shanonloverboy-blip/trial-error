import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/tasks";
import type { TaskPriority } from "@/lib/types";

const ALLOWED_PRIORITY: TaskPriority[] = ["low", "medium", "high"];

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (typeof body?.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Judul tugas wajib diisi." }, { status: 400 });
  }

  const priority = ALLOWED_PRIORITY.includes(body.priority) ? body.priority : "medium";

  const task = await createTask({
    title: body.title.trim(),
    description: typeof body.description === "string" ? body.description : "",
    assignee: typeof body.assignee === "string" ? body.assignee : "",
    dueDate: typeof body.dueDate === "string" ? body.dueDate : "",
    priority,
  });

  return NextResponse.json({ task }, { status: 201 });
}
