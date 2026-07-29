import { listTasks } from "@/lib/tasks";
import { isPersistent } from "@/lib/kv-client";
import Board from "@/components/Board";

export default async function HomePage() {
  const tasks = await listTasks();
  return <Board initialTasks={tasks} isPersistent={isPersistent} />;
}
