import React from "react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-24 px-6 md:px-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold text-center mb-6"
      >
        Ready to Ace Your Interview?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center text-lg md:text-xl mb-10 max-w-2xl"
      >
        Sign up today and start practicing with our AI-powered mock interviews. Get instant feedback and improve faster than ever.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white text-blue-500 font-semibold px-10 py-4 rounded-3xl shadow-lg hover:scale-105 transition"
      >
        Get Started
      </motion.button>
    </section>
  );
};

export default CTA;
