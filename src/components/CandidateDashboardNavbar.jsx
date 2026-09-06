import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CandidateDashboardNavbar = ({ toggleSidebar }) => {
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { displayName, logout } = useAuth();

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        <button
          onClick={toggleSidebar}
          className="md:hidden p-2"
        >
          <FaBars />
        </button>

        <h1 className="text-xl font-bold text-blue-500">
          Candidate Dashboard
        </h1>

        <div className="flex items-center gap-4">
          {/* Theme */}
          <button onClick={() => setDark(!dark)}>
            {dark ? <FaSun /> : <FaMoon />}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              <FaUserCircle size={22} />
              <span className="hidden md:inline font-medium">
                {displayName || "User"}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow">
               
        
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CandidateDashboardNavbar;
