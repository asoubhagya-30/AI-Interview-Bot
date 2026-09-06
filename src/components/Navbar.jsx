import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const links = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#steps" },
    { name: "Get Started", href: "#cta" },
  ];

  return (
    <nav className="fixed w-full z-50 backdrop-blur-lg bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-gray-700 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/"><h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
          AI Interview Bot
        </h1></a>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-6 text-gray-900 dark:text-white font-medium items-center">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className="hover:text-blue-500 dark:hover:text-purple-400 transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/candidate"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Candidate
            </a>
          </li>
         
    
        </ul>

        {/* Right Side (Dark Mode + Hamburger) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full bg-white/40 dark:bg-gray-700/40 hover:bg-white/50 dark:hover:bg-gray-600 transition"
          >
            {dark ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-900" />
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-full bg-white/40 dark:bg-gray-700/40 hover:bg-white/50 dark:hover:bg-gray-600 transition"
          >
            {menuOpen ? (
              <FaTimes className="text-gray-900 dark:text-white" />
            ) : (
              <FaBars className="text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col gap-4 text-center py-6 text-gray-900 dark:text-white bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg"
          >
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className="block py-2 hover:text-blue-500 dark:hover:text-purple-400 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/candidate"
                className="block px-6 py-3 mx-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                Candidate
              </a>
            </li>
            <li>
              <a
                href="/recruiter"
                className="block px-6 py-3 mx-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                Recruiter
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
