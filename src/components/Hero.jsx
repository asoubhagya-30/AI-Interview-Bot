// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24 pt-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col lg:flex-row items-center gap-12 max-w-7xl w-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
            Crack Your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Dream Job
            </span>
            <br /> with <span className="italic">AI-Powered Interviews</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
            Get smarter interview prep, real-time feedback, and recruiter-ready
            tools — all powered by AI. Designed for{" "}
            <span className="font-semibold">Candidates</span> &{" "}
            <span className="font-semibold">Recruiters</span>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition">
              Get Started
            </button>
            <button className="px-6 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg transition">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Right Side Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center pb-12 md:pb-0" // 👈 added responsive bottom padding
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <span className="text-6xl md:text-8xl font-bold text-blue-600 dark:text-blue-400">
              🤖
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
