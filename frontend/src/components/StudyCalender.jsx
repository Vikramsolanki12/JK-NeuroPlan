import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { getStudyStats } from "../services/api";

export default function StudyCalendar() {

  const { user } = useContext(AuthContext);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayKey = today.toISOString().split("T")[0];

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = useCallback(async () => {

    if (!user) return;

    try {

      setLoading(true);

      const stats = await getStudyStats(user.uid);

      if (stats) {
        setData(stats);
      } else {
        setData({});
      }

    } catch (err) {
      console.error("Study stats fetch error:", err);
      setData({});
    }

    setLoading(false);

  }, [user]);

  useEffect(() => {

    if (!user) return;

    fetchStats();

    /* Listen for updates from other components */
    window.addEventListener("statsUpdated", fetchStats);

    return () => {
      window.removeEventListener("statsUpdated", fetchStats);
    };

  }, [user, fetchStats]);

  /* ---------------- GENERATE LAST 30 DAYS ---------------- */

  const days = useMemo(() => {

    const arr = [];

    for (let i = 29; i >= 0; i--) {

      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().split("T")[0];

      arr.push({
        key,
        date: d.getDate(),
        day: d.toLocaleDateString("en-US", { weekday: "short" })
      });

    }

    return arr;

  }, [today]);

  /* ---------------- HEATMAP COLOR ---------------- */

  const getColor = (value) => {

    if (!value) return "bg-gray-200 dark:bg-gray-800";
    if (value < 2) return "bg-green-200";
    if (value < 5) return "bg-green-400";
    if (value < 8) return "bg-green-600";
    return "bg-green-800";

  };

  /* ---------------- SUMMARY ---------------- */

  const totalTasks = Object.values(data).reduce(
    (sum, val) => sum + val,
    0
  );

  const todayTasks = data[todayKey] || 0;

  const last7Days = days.slice(-7);

  const weeklyTotal = last7Days.reduce(
    (sum, d) => sum + (data[d.key] || 0),
    0
  );

  if (!user) return null;

  return (

    <div className="p-5 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-lg shadow-lg">

      <h2 className="text-lg font-semibold mb-4">
        📅 Study Activity
      </h2>

      {loading ? (

        <p className="text-sm text-gray-500">
          Loading activity...
        </p>

      ) : (

        <>

          {/* SUMMARY */}

          <div className="grid grid-cols-3 gap-3 mb-4 text-center text-xs">

            <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold text-lg">
                {todayTasks}
              </p>
              <p>Today</p>
            </div>

            <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold text-lg">
                {weeklyTotal}
              </p>
              <p>Last 7 Days</p>
            </div>

            <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold text-lg">
                {totalTasks}
              </p>
              <p>Total</p>
            </div>

          </div>

          {/* HEATMAP */}

          <div className="grid grid-cols-7 gap-2">

            {days.map((dayObj, i) => {

              const isToday = dayObj.key === todayKey;
              const count = data[dayObj.key] || 0;

              return (

                <motion.div
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  className={`rounded-lg p-2 text-center text-xs cursor-pointer transition
                  ${getColor(count)}
                  ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  title={`${dayObj.key} → ${count} completed`}
                >

                  <div className="font-medium">
                    {dayObj.day}
                  </div>

                  <div className="text-sm">
                    {dayObj.date}
                  </div>

                  {count > 0 && (
                    <div className="text-[10px] mt-1 font-semibold">
                      {count}
                    </div>
                  )}

                </motion.div>

              );

            })}

          </div>

          {/* LEGEND */}

          <div className="flex items-center gap-2 mt-4 text-xs">

            <span>Less</span>

            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <div className="w-4 h-4 bg-green-800 rounded"></div>

            <span>More</span>

          </div>

        </>

      )}

    </div>

  );

}
