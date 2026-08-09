import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { getTimetable, saveTimetable } from "../services/api";

/* WEEKLY DAYS */
const getNext7Days = () => {
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "long" }),
      key: d.toISOString().split("T")[0],
    });
  }

  return days;
};

/* MONTH WEEK RANGES */
const getMonthWeeks = () => {
  const weeks = [];
  let start = new Date();

  for (let i = 0; i < 4; i++) {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const startLabel = start.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

    const endLabel = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

    weeks.push({
      key: `week${i + 1}`,
      label: `Week ${i + 1} (${startLabel} - ${endLabel})`,
    });

    start = end;
  }

  return weeks;
};

export default function Timetable() {
  const { user } = useContext(AuthContext);

  const weekDays = getNext7Days();
  const monthWeeks = getMonthWeeks();

  const [mode, setMode] = useState("daily");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    subject: "",
    from: "",
    to: "",
    dayKey: "",
    week: "week1",
  });

  const [edit, setEdit] = useState(null);

  const [data, setData] = useState({
    daily: [],
    weekly: { days: {} },
    monthly: {
      week1: [],
      week2: [],
      week3: [],
      week4: [],
    },
  });

  const isInitialLoad = useRef(true);

  /* LOAD */
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const res = await getTimetable(user.uid);

      if (res) {
        setData({
          daily: res.daily || [],
          weekly: res.weekly || { days: {} },
          monthly: res.monthly || {
            week1: [],
            week2: [],
            week3: [],
            week4: [],
          },
        });
      }

      setLoading(false);
      isInitialLoad.current = false;
    };

    fetchData();
  }, [user]);

  /* SAVE */
  useEffect(() => {
    if (!user) return;
    if (isInitialLoad.current) return;

    saveTimetable(user.uid, data);
  }, [data, user]);

  /* ADD / UPDATE */
  const addItem = () => {
    if (!form.subject) return;

    if (edit) {
      deleteItem(edit.mode, edit.index, edit.day, edit.week);
      setEdit(null);
    }

    if (mode === "daily") {
      setData((prev) => ({
        ...prev,
        daily: [
          ...prev.daily,
          { subject: form.subject, from: form.from, to: form.to, done: false },
        ],
      }));
    }

    if (mode === "weekly") {
      const key = form.dayKey;

      setData((prev) => ({
        ...prev,
        weekly: {
          ...prev.weekly,
          days: {
            ...prev.weekly.days,
            [key]: [
              ...(prev.weekly.days[key] || []),
              { subject: form.subject, done: false },
            ],
          },
        },
      }));
    }

    if (mode === "monthly") {
      const week = form.week;

      setData((prev) => ({
        ...prev,
        monthly: {
          ...prev.monthly,
          [week]: [
            ...(prev.monthly[week] || []),
            { subject: form.subject, done: false },
          ],
        },
      }));
    }

    setForm({
      subject: "",
      from: "",
      to: "",
      dayKey: "",
      week: "week1",
    });
  };

  /* DELETE */
  const deleteItem = (modeKey, index, day = null, week = null) => {
    setData((prev) => {
      if (modeKey === "daily") {
        return {
          ...prev,
          daily: prev.daily.filter((_, i) => i !== index),
        };
      }

      if (modeKey === "weekly") {
        const updated = prev.weekly.days[day].filter((_, i) => i !== index);

        return {
          ...prev,
          weekly: {
            ...prev.weekly,
            days: {
              ...prev.weekly.days,
              [day]: updated,
            },
          },
        };
      }

      if (modeKey === "monthly") {
        const updated = prev.monthly[week].filter((_, i) => i !== index);

        return {
          ...prev,
          monthly: {
            ...prev.monthly,
            [week]: updated,
          },
        };
      }

      return prev;
    });
  };

  /* COMPLETE DAILY */
  const toggleDailyComplete = (index) => {
    setData((prev) => {
      const updated = [...prev.daily];
      updated[index].done = !updated[index].done;

      return { ...prev, daily: updated };
    });
  };

  /* COMPLETE WEEKLY */
  const toggleWeeklyComplete = (day, index) => {
    setData((prev) => {
      const updated = [...prev.weekly.days[day]];
      updated[index].done = !updated[index].done;

      return {
        ...prev,
        weekly: {
          ...prev.weekly,
          days: { ...prev.weekly.days, [day]: updated },
        },
      };
    });
  };

  /* COMPLETE MONTHLY */
  const toggleMonthlyComplete = (week, index) => {
    setData((prev) => {
      const updated = [...prev.monthly[week]];
      updated[index].done = !updated[index].done;

      return {
        ...prev,
        monthly: { ...prev.monthly, [week]: updated },
      };
    });
  };

  /* EDIT */
  const editItem = (subject, index, modeKey, day = null, week = null) => {
    let from = "";
    let to = "";

    if (modeKey === "daily") {
      from = data.daily[index].from;
      to = data.daily[index].to;
    }

    setForm({
      subject,
      from,
      to,
      dayKey: day || "",
      week: week || "week1",
    });

    setEdit({
      mode: modeKey,
      index,
      day,
      week,
    });
  };

  return (
    <motion.div className="p-5 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg">

      <h2 className="text-lg font-semibold mb-4">📅 Study Timetable</h2>

      {/* MODE SWITCH */}
      <div className="flex gap-2 mb-4">
        {["daily", "weekly", "monthly"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded capitalize ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="grid md:grid-cols-4 gap-2 mb-4">

        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="p-2 rounded bg-gray-200 dark:bg-gray-800"
        />

        {mode === "weekly" && (
          <select
            value={form.dayKey}
            onChange={(e) => setForm({ ...form, dayKey: e.target.value })}
            className="p-2 rounded bg-gray-200 dark:bg-gray-800"
          >
            <option value="">Select day</option>

            {weekDays.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        )}

        {mode === "monthly" && (
          <select
            value={form.week}
            onChange={(e) => setForm({ ...form, week: e.target.value })}
            className="p-2 rounded bg-gray-200 dark:bg-gray-800"
          >
            {monthWeeks.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>
        )}

        {mode === "daily" && (
          <>
            <input
              type="time"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="p-2 rounded bg-gray-200 dark:bg-gray-800"
            />

            <input
              type="time"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="p-2 rounded bg-gray-200 dark:bg-gray-800"
            />
          </>
        )}

        <button
          onClick={addItem}
          className="bg-blue-600 text-white rounded px-3"
        >
          {edit ? "Update" : "Add"}
        </button>
      </div>

      {/* DAILY VIEW */}
      {mode === "daily" && (
        <div className="space-y-3">
          {(data.daily || []).length === 0 ? (
            <p className="text-sm text-gray-500">No schedule added</p>
          ) : (
            data.daily.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded"
              >
                <div>
                  <p className={item.done ? "line-through opacity-60" : ""}>
                    {item.subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.from} - {item.to}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleDailyComplete(i)}>
                    {item.done ? "✅" : "⏳"}
                  </button>

                  <button
                    onClick={() => editItem(item.subject, i, "daily")}
                  >
                    ✏️
                  </button>

                  <button onClick={() => deleteItem("daily", i)}>
                    ❌
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {mode === "weekly" && (
        <div className="space-y-3">
          {weekDays.map((day) => (
            <div key={day.key} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">

              <h4 className="font-semibold">{day.label}</h4>

              {(data.weekly.days?.[day.key] || []).length === 0 ? (
                <p className="text-sm text-gray-500">No subjects</p>
              ) : (
                data.weekly.days[day.key].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">

                    <span className={item.done ? "line-through opacity-60" : ""}>
                      {item.subject}
                    </span>

                    <div className="flex gap-2">
                      <button onClick={() => toggleWeeklyComplete(day.key, i)}>
                        {item.done ? "✅" : "⏳"}
                      </button>

                      <button
                        onClick={() =>
                          editItem(item.subject, i, "weekly", day.key)
                        }
                      >
                        ✏️
                      </button>

                      <button onClick={() => deleteItem("weekly", i, day.key)}>
                        ❌
                      </button>
                    </div>

                  </div>
                ))
              )}

            </div>
          ))}
        </div>
      )}

      {/* MONTHLY VIEW */}
      {mode === "monthly" && (
        <div className="space-y-3">
          {monthWeeks.map(({ key, label }) => (
            <div key={key} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">

              <h4 className="font-semibold">{label}</h4>

              {(data.monthly?.[key] || []).length === 0 ? (
                <p className="text-sm text-gray-500">No subjects</p>
              ) : (
                data.monthly[key].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">

                    <span className={item.done ? "line-through opacity-60" : ""}>
                      {item.subject}
                    </span>

                    <div className="flex gap-2">

                      <button
                        onClick={() => toggleMonthlyComplete(key, i)}
                      >
                        {item.done ? "✅" : "⏳"}
                      </button>

                      <button
                        onClick={() =>
                          editItem(item.subject, i, "monthly", null, key)
                        }
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteItem("monthly", i, null, key)}
                      >
                        ❌
                      </button>

                    </div>

                  </div>
                ))
              )}

            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}