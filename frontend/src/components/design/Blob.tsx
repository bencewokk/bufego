import { motion } from "framer-motion";

export const FloatingBlob = () => {
  return (
    <motion.div
      className="absolute top-0 left-0 w-80 h-40 bg-[#fff8e1] blur-2xl opacity-50 rounded-[50%]"
      animate={{ x: [0, 20, 40, 20, 0], y: [0, 15, 0, -15, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};