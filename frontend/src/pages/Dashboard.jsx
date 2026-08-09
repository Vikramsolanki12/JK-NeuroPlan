import { motion } from "framer-motion";
import { BarChart3, Trophy, CheckCircle, Calendar } from "lucide-react";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DailyTasks from "../components/DailyTasks";
import Timetable from "../components/Timetable";
import StudyCalendar from "../components/StudyCalender";


import { AuthContext } from "../context/AuthContext";
import {
  getTasks,
  getTimetable,
  toggleTaskStatus,
  toggleTimetableSession,
} from "../services/api";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("performance");

  const { user, profile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  if (!user) return null;

  const tabs = [
    { id: "todayTask", label: "Today's Task", icon: <BarChart3 size={18} /> },
    { id: "performance", label: "Performance", icon: <BarChart3 size={18} /> },
    { id: "timetable", label: "Timetable", icon: <Calendar size={18} /> },
    { id: "tasks", label: "Tasks", icon: <CheckCircle size={18} /> },
    { id: "ai", label: "AI Assistant", icon: <Brain size={18} /> },
  ];

  return (
    <div
      className="min-h-screen p-6 
      bg-gradient-to-br 
      from-gray-100 via-white to-gray-200 
      dark:from-black dark:via-gray-900 dark:to-gray-800 
      text-black dark:text-white"
    >
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        Welcome {profile?.name || user?.name || user?.email} 🚀
      </h1>

      {/* HORIZONTAL NAVIGATION */}
      <div className="flex gap-3 mb-6 border-b pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap
            ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "todayTask" && <TodayPlan />}
      {activeTab === "performance" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6">
            <StudyCalendar />

            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Focus Score" value="--" icon={<BarChart3 />} />
              <StatCard title="Study Time" value="--" icon={<Clock />} />
              <StatCard title="Tasks Done" value="--" icon={<CheckCircle />} />
              <StatCard title="Achievements" value="--" icon={<Trophy />} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Insights />
          </div>
        </div>
      )}

      {activeTab === "timetable" && <Timetable />}

      {activeTab === "tasks" && (
        <div className="grid md:grid-cols-2 gap-6">
          <DailyTasks />
          <DailyPlan />
        </div>
      )}

      {activeTab === "ai" && <AISection />}
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded-xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <h2 className="font-bold">{value}</h2>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </motion.div>
  );
}
/* Today's Plan */
function TodayPlan() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [timetable, setTimetable] = useState(null);

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const todayName = today.toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const taskData = await getTasks(user.uid);
      const timetableData = await getTimetable(user.uid);

      const todayTasks = taskData.filter((t) => t.date === todayKey);

      setTasks(todayTasks);
      setTimetable(timetableData);
    };

    loadData();
  }, [user]);

  /* TASK COMPLETE */
  const toggleTask = async (index) => {
    const updated = [...tasks];

    updated[index] = {
      ...updated[index],
      done: !updated[index].done,
    };

    setTasks(updated);

    await toggleTaskStatus(user.uid, updated[index].id, updated[index].done);

    window.dispatchEvent(new Event("tasksUpdated"));
  };

  /* TIMETABLE COMPLETE */
  const toggleSchedule = async (index) => {
    const updated = [...todaySchedules];

    updated[index] = {
      ...updated[index],
      done: !updated[index].done,
    };

    const newTimetable = {
      ...timetable,
      daily: updated,
    };

    setTimetable(newTimetable);

    await toggleTimetableSession(user.uid, newTimetable);
  };

  const weeklyToday = timetable?.weekly?.days?.[todayKey] || [];
  const monthlyToday = timetable?.monthly?.[todayKey] || [];
  const todaySchedules = timetable?.daily || [];

  /* TASK PROGRESS */
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;

  const completedSchedules = todaySchedules.filter((s) => s.done).length;
  const totalSchedules = todaySchedules.length;

  const totalItems = totalTasks + totalSchedules;
  const completedItems = completedTasks + completedSchedules;

  const progress =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl
bg-white/60 dark:bg-white/5
backdrop-blur-xl
border border-gray-200 dark:border-gray-700
shadow-xl"
    >
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">📌 Today's Plan</h2>

        <span className="text-sm text-gray-500">{todayName}</span>
      </div>

      {/* PROGRESS */}

      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Daily Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
          <motion.div
            className="h-2 bg-blue-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* TASKS */}

        <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl backdrop-blur">
          <h3 className="font-semibold mb-3">✅ Tasks</h3>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks today</p>
          ) : (
            tasks.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex justify-between items-center border-b py-2 text-sm"
              >
                <span className={t.done ? "line-through opacity-60" : ""}>
                  {t.text}
                </span>

                <button
                  onClick={() => toggleTask(i)}
                  className={`px-2 py-1 text-xs rounded ${
                    t.done
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {t.done ? "Done" : "Complete"}
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* DAILY TIMETABLE */}

        <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl backdrop-blur">
          <h3 className="font-semibold mb-3">🕒 Daily Schedule</h3>

          {todaySchedules.length === 0 ? (
            <p className="text-sm text-gray-500">No schedule</p>
          ) : (
            todaySchedules.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex justify-between items-center border-b py-2 text-sm"
              >
                <div>
                  <p className={s.done ? "line-through opacity-60" : ""}>
                    {s.subject}
                  </p>

                  <p className="text-xs text-gray-500">
                    {s.from} - {s.to}
                  </p>
                </div>

                <button
                  onClick={() => toggleSchedule(i)}
                  className={`px-2 py-1 text-xs rounded ${
                    s.done
                      ? "bg-green-500 text-white"
                      : "bg-indigo-500 text-white"
                  }`}
                >
                  {s.done ? "Done" : "Complete"}
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* WEEKLY + MONTHLY */}

        <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl backdrop-blur">
          <h3 className="font-semibold mb-3">📅 Weekly / Monthly</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Weekly ({todayName})</p>

              {weeklyToday.length === 0 ? (
                <p className="text-sm text-gray-500">No subjects</p>
              ) : (
                weeklyToday.map((s, i) => (
                  <div key={i} className="text-sm py-1">
                    • {s.subject}
                  </div>
                ))
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Monthly</p>

              {monthlyToday.length === 0 ? (
                <p className="text-sm text-gray-500">No subjects</p>
              ) : (
                monthlyToday.map((s, i) => (
                  <div key={i} className="text-sm py-1">
                    • {s.subject || s}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- DAILY PLAN ---------------- */
function DailyPlan() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [view, setView] = useState("daily");

  const todayKey = new Date().toISOString().split("T")[0];

  const fetchPlan = async () => {
    if (!user) return;

    try {
      const taskData = await getTasks(user.uid);
      const timetableData = await getTimetable(user.uid);

      const todayTasks = taskData.filter((t) => t.date === todayKey);

      setTasks(todayTasks);
      setTimetable(timetableData);
    } catch (err) {
      console.error("Error loading timetable:", err);
    }
  };

  useEffect(() => {
    fetchPlan();

    window.addEventListener("tasksUpdated", fetchPlan);

    return () => {
      window.removeEventListener("tasksUpdated", fetchPlan);
    };
  }, [user]);

  return (
    <Card>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">📅 Study Planner</h3>

        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setView("daily")}
            className={`px-2 py-1 rounded ${view === "daily" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-2 py-1 rounded ${view === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`px-2 py-1 rounded ${view === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* DAILY */}
      {view === "daily" && (
        <div>
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks for today.</p>
          )}

          {tasks.map((task) => (
            <div key={task.id} className="flex justify-between p-2 border-b">
              <span className={task.done ? "line-through opacity-60" : ""}>
                {task.text}
              </span>
              <span>{task.done ? "✅" : "⏳"}</span>
            </div>
          ))}
        </div>
      )}

      {/* WEEKLY */}
      {view === "weekly" && (
        <div className="space-y-3">
          {!timetable?.weekly?.days && (
            <p className="text-sm text-gray-500">No weekly timetable added.</p>
          )}

          {timetable?.weekly?.days &&
            Object.entries(timetable.weekly.days).map(([day, subjects]) => (
              <div
                key={day}
                className="p-3 rounded bg-gray-100 dark:bg-gray-800"
              >
                <h4 className="font-semibold mb-1">{day}</h4>

                {subjects.length === 0 ? (
                  <p className="text-xs text-gray-500">No subjects</p>
                ) : (
                  <ul className="text-sm list-disc ml-4">
                    {subjects.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}

      {/* MONTHLY */}
      {view === "monthly" && (
        <div className="space-y-3">
          {!timetable?.monthly && (
            <p className="text-sm text-gray-500">No monthly timetable added.</p>
          )}

          {timetable?.monthly &&
            timetable.monthly.map((week, index) => (
              <div
                key={index}
                className="p-3 rounded bg-gray-100 dark:bg-gray-800"
              >
                <h4 className="font-semibold mb-1">Week {index + 1}</h4>

                {week.length === 0 ? (
                  <p className="text-xs text-gray-500">No subjects</p>
                ) : (
                  <ul className="text-sm list-disc ml-4">
                    {week.map((subject, i) => (
                      <li key={i}>{subject}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------- INSIGHTS ---------------- */

function Insights() {
  return (
    <Card>
      <h3 className="font-semibold mb-2">Insights</h3>
      <p>Track your weak subjects to improve faster</p>
      <p>Study consistency is key 🔥</p>
    </Card>
  );
}

/* ---------------- AI ---------------- */
function AISection() {
  const { user } = useContext(AuthContext);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const tasksData = await getTasks(user.uid);
      const timetable = await getTimetable(user.uid);

      // Convert tasks to backend format
      const tasks = tasksData.map((t) => ({
        text: t.text || t.title || "",
        subject: (t.subject || t.text || "general").toLowerCase(),
        done: t.done ?? t.completed ?? false,
        date: t.date || null,
      }));

      // Safe timetable structure
      const safeTimetable = {
        daily: Array.isArray(timetable?.daily) ? timetable.daily : [],
        weekly: timetable?.weekly || {},
        monthly: Array.isArray(timetable?.monthly) ? timetable.monthly : [],
      };

      const res = await fetch("http://localhost:8000/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          timetable: safeTimetable,
        }),
      });

      const data = await res.json();

      console.log("AI RESPONSE:", data);

      setAnalysis(data);
    } catch (err) {
      console.error("AI error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <Brain className="text-blue-500" />
        <h3 className="text-xl font-semibold">AI Study Insights</h3>
      </div>

      {/* BUTTON */}
      <button
        onClick={runAI}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-6 hover:bg-blue-700 transition"
      >
        {loading ? "Analyzing Study Data..." : "Generate AI Report"}
      </button>

      {analysis && (
        <div className="space-y-6">

          {/* FOCUS SCORE */}
          <div className="p-4 rounded-xl bg-blue-500/10">
            <p className="text-sm text-gray-500">Focus Score</p>
            <p className="text-3xl font-bold text-blue-600">
              {analysis.focus_score ?? 0}%
            </p>
          </div>

          {/* BEST STUDY HOUR */}
          {analysis.best_study_hour !== null &&
            analysis.best_study_hour !== undefined && (
              <div className="p-4 rounded-xl bg-indigo-500/10 flex items-center gap-2">
                <Clock className="text-indigo-500" />
                <p className="text-sm">
                  Best study hour detected:{" "}
                  <span className="font-semibold">
                    {analysis.best_study_hour}:00
                  </span>
                </p>
              </div>
            )}

          {/* STRENGTHS / WEAKNESSES */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* STRENGTHS */}
            <div className="p-4 rounded-xl bg-green-500/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-500" size={18} />
                <h4 className="font-semibold">Strengths</h4>
              </div>

              {(analysis.strengths || []).length === 0 ? (
                <p className="text-sm text-gray-500">No strong topics yet</p>
              ) : (
                <ul className="list-disc ml-4 text-sm">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* WEAKNESSES */}
            <div className="p-4 rounded-xl bg-red-500/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={18} />
                <h4 className="font-semibold">Weak Areas</h4>
              </div>

              {(analysis.weaknesses || []).length === 0 ? (
                <p className="text-sm text-gray-500">No weak topics detected</p>
              ) : (
                <ul className="list-disc ml-4 text-sm">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* STUDY PLAN */}
          <div className="p-4 rounded-xl bg-purple-500/10">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-purple-500" size={18} />
              <h4 className="font-semibold">AI Study Plan</h4>
            </div>

            {(analysis.study_plan || []).length === 0 ? (
              <p className="text-sm text-gray-500">No study plan generated</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {analysis.study_plan.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            )}
          </div>

          {/* REVISION PLAN */}
          {(analysis.revision_plan || []).length > 0 && (
            <div className="p-4 rounded-xl bg-orange-500/10">
              <h4 className="font-semibold mb-2">Revision Planner</h4>

              <ul className="space-y-1 text-sm">
                {analysis.revision_plan.map((r, i) => (
                  <li key={i}>
                    {r.day}: {r.task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* INSIGHTS */}
          <div className="p-4 rounded-xl bg-yellow-500/10">
            <h4 className="font-semibold mb-2">AI Insights</h4>

            {(analysis.insights || []).length === 0 ? (
              <p className="text-sm text-gray-500">No insights yet</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {analysis.insights.map((ins, i) => (
                  <li key={i}>• {ins}</li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

/* ---------------- CARD ---------------- */

function Card({ children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-5 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg"
    >
      {children}
    </motion.div>
  );
}
