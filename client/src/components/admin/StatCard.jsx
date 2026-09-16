import { motion } from "framer-motion";

import Card from "../common/Card.jsx";

export default function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-soil">{label}</p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 font-heading text-4xl text-leaf"
      >
        {value ?? 0}
      </motion.p>
    </Card>
  );
}
