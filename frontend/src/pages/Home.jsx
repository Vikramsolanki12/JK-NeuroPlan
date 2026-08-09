import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, Trophy, BarChart3, Clock } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen 
      bg-gradient-to-br 
      from-gray-100 via-white to-gray-200 
      dark:from-black dark:via-gray-900 dark:to-gray-800 
      text-black dark:text-white px-6 py-10 transition-all duration-300"
    >
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-4">
          AI Study Scheduler 🚀
        </h1>

        <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
          Personalized study plans powered by AI.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl 
            hover:scale-105 hover:bg-blue-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 
            text-black dark:text-white rounded-xl 
            hover:scale-105 transition"
          >
            Dashboard
          </button>
        </div>
      </motion.div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={<Brain />}
          title="AI Scheduling"
          desc="Smart timetable"
        />

        <FeatureCard
          icon={<BarChart3 />}
          title="Performance Tracking"
          desc="Track progress"
        />

        <FeatureCard
          icon={<Trophy />}
          title="Gamification"
          desc="Earn rewards"
        />

        <FeatureCard
          icon={<Clock />}
          title="Focus Mode"
          desc="Pomodoro timer"
        />
      </div>

      {/* FOOTER */}
      <div className="text-center mt-20 text-gray-600 dark:text-gray-400">
        Built by Vikram Solanki 🚀
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-xl 
      bg-white dark:bg-white/10 
      backdrop-blur-lg shadow-lg transition"
    >
      <div className="mb-3">{icon}</div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {desc}
      </p>
    </motion.div>
  );
}
