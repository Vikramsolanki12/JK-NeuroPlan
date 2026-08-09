import { motion } from "framer-motion";

export default function Card({ title, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="
      p-5 m-3 rounded-2xl 
      bg-white dark:bg-white/10 
      backdrop-blur-lg shadow-lg 
      border border-gray-200 dark:border-gray-700
      transition-all duration-300"
    >
      <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
        {title}
      </h3>

      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </motion.div>
  );
}
