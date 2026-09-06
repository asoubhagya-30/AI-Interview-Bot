// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedEmail = localStorage.getItem("email");

    if (savedRole && savedEmail) {
      setRole(savedRole);
      setEmail(savedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  // ✅ Login
  const login = ({ role, email }) => {
    setRole(role);
    setEmail(email);
    setIsAuthenticated(true);

    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
  };

  // ✅ Logout
  const logout = () => {
    setRole(null);
    setEmail(null);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  // 👤 Display name from email
  const displayName = email ? email.split("@")[0] : "";

  return (
    <AuthContext.Provider
      value={{
        role,
        email,
        displayName,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
