import React from "react";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import { motion } from "framer-motion";

const userTypes = [
  {
    icon: <FaUserGraduate className="w-6 h-6 text-blue-500" />,
    title: "For Candidates",
    description: "Practice AI-driven mock interviews, get real-time feedback on answers, voice, and posture. Improve your skills and confidence faster.",
  },
  {
    icon: <FaUserTie className="w-6 h-6 text-purple-500" />,
    title: "For Recruiters",
    description: "Upload candidate resumes, generate AI-based interview questions, and analyze skills efficiently. Simplify your recruitment process.",
  },
];

const UserTypes = () => {
  return (
    <section className="py-20 px-6 md:px-20 bg-gray-100 dark:bg-gray-800 relative">
      <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-16">
        Who Can Use AI Interview Bot
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {userTypes.map((user, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="p-8 morphic-card backdrop-blur-md rounded-xl hover:scale-105 transition cursor-default flex flex-col items-center text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 dark:bg-gray-700/30 mb-4">
              {user.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{user.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{user.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default UserTypes;
