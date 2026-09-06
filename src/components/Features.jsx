import React from "react";
import { FaRobot, FaFileAlt, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
  {
    icon: <FaRobot className="text-blue-500 w-6 h-6" />,
    title: "AI Mock Interviews",
    description: "Adaptive, real-life interview simulations to boost your confidence.",
  },
  {
    icon: <FaFileAlt className="text-purple-500 w-6 h-6" />,
    title: "Resume Analysis",
    description: "Extract keywords, evaluate skills, and highlight improvement areas.",
  },
  {
    icon: <FaUserCheck className="text-pink-500 w-6 h-6" />,
    title: "Body & Voice Feedback",
    description: "Receive insights on posture, gestures, and voice tone during interviews.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 md:px-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      
      {/* Floating background shapes */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl animate-pulse"></div>

      <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-16">
        Key Features
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex items-start gap-4 md:gap-6 hover:translate-y-[-4px] transition-transform cursor-default"
          >
            {/* Small icon with subtle circle */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 dark:bg-gray-700/30 backdrop-blur-md">
              {feature.icon}
            </div>

            {/* Text */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
