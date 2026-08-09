import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  addTask,
  getTasks,
  updateTask,
  updateStudyStats,
} from "../services/api";

export default function DailyTasks() {
  const { user } = useContext(AuthContext);

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayKey = new Date().toISOString().split("T")[0];

  // 🔄 Fetch Today's Tasks
  const fetchTodayTasks = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getTasks(user.uid);
    const todayTasks = data.filter((t) => t.date === todayKey);
    setTasks(todayTasks);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayTasks();
  }, [user]);

  // ➕ Add Task
  const addNewTask = async () => {
    if (!task.trim() || !user) return;

    await addTask(user.uid, task);
    setTask("");
    await fetchTodayTasks();

    // 🔥 notify other components
    window.dispatchEvent(new Event("tasksUpdated"));
  };

  // ✅ Toggle Task
  const toggleTaskHandler = async (taskId, currentState) => {
    if (!user) return;

    await updateTask(user.uid, taskId, {
      done: !currentState,
    });

    if (!currentState) {
      await updateStudyStats(user.uid, todayKey);
      window.dispatchEvent(new Event("statsUpdated"));
    }

    await fetchTodayTasks();
    window.dispatchEvent(new Event("tasksUpdated"));
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3">📋 Daily Tasks</h2>

      <div className="flex gap-2 mb-3">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add task..."
          className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={addNewTask}
          className="px-3 bg-blue-600 text-white rounded-lg hover:scale-105 transition"
        >
          Add
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      )}

      {!loading && tasks.length === 0 && (
        <p className="text-sm text-gray-500">
          No tasks for today. Stay productive 🚀
        </p>
      )}

      {tasks.map((t) => (
        <div
          key={t.id}
          className="flex justify-between items-center p-2 border-b"
        >
          <span className={t.done ? "line-through opacity-60" : ""}>
            {t.text}
          </span>

          <button
            onClick={() => toggleTaskHandler(t.id, t.done)}
            className="hover:scale-110 transition"
          >
            {t.done ? "✅" : "⏳"}
          </button>
        </div>
      ))}
    </div>
  );
}
