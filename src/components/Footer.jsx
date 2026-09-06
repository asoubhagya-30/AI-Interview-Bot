import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 px-6 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand & Description */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-500 mb-4">AI Interview Bot</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-sm">
            Transforming your interview experience with AI-powered feedback, mock interviews, resume analysis, and actionable insights.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <FaPhone className="text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">+91 12345 67890</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <FaEnvelope className="text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">support@aiinterviewbot.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex-1 flex flex-col sm:flex-row gap-8 justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">Features</a>
            <a href="#steps" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">How It Works</a>
            <a href="#cta" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">Get Started</a>
          </div>

          {/* Resources / Support */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">Blog</a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">FAQ</a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition">Contact</a>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Follow Us</h3>
            <div className="flex gap-4 mt-1">
              <a href="#" className="hover:text-blue-500 transition"><FaFacebookF /></a>
              <a href="#" className="hover:text-blue-500 transition"><FaTwitter /></a>
              <a href="#" className="hover:text-blue-500 transition"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex-1 mt-8 md:mt-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Subscribe to Newsletter</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            Get updates on new features, tips, and AI interview insights.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-r-xl hover:bg-blue-600 transition">Subscribe</button>
          </div>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-center mt-12 text-sm">
        © 2025 AI Interview Bot. All rights reserved. | Designed with 💙
      </p>
    </footer>
  );
};

export default Footer;
