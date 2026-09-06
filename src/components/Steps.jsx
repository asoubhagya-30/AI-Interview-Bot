import React from "react";
import { FaUserPlus, FaFileUpload, FaComments, FaClipboardCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const steps = [
  {
    icon: <FaUserPlus className="text-blue-500 w-5 h-5" />,
    title: "Sign Up / Log In",
    description: "Quickly create your account and access AI-powered mock interviews.",
  },
  {
    icon: <FaFileUpload className="text-purple-500 w-5 h-5" />,
    title: "Upload Resume",
    description: "AI evaluates your resume and generates personalized interview questions.",
  },
  {
    icon: <FaComments className="text-pink-500 w-5 h-5" />,
    title: "AI Interview",
    description: "Engage in live AI interviews with real-time voice and posture feedback.",
  },
  {
    icon: <FaClipboardCheck className="text-green-500 w-5 h-5" />,
    title: "Receive Report",
    description: "Get detailed insights and actionable suggestions to improve your skills.",
  },
];

const Steps = () => {
  return (
    <section id="steps" className="py-20 px-6 md:px-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl animate-pulse"></div>

      <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-16">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex flex-col items-center p-6 morphic-card backdrop-blur-md rounded-xl hover:scale-105 transition-transform cursor-default"
          >
            {/* Icon */}
            <div className="w-10 h-10 flex items-center justify-center mb-4 bg-white/20 dark:bg-gray-700/30 rounded-full">
              {step.icon}
            </div>

            {/* Text */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Steps;
