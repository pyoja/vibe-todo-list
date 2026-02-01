import { Sidebar } from "@/components/dashboard/sidebar";
import { TodoList } from "@/components/dashboard/todo-list";

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden">
      <Sidebar />
      <TodoList />
    </div>
  );
}
