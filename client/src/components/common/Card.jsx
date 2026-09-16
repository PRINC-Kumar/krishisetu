import { motion } from "framer-motion";
export default function Card({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-2xl border border-grove/10 bg-white/90 p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
