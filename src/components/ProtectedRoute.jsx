import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/";

const ProtectedRoute = ({ children, role }) => {
  const user = auth.currentUser;
  const storedRole = localStorage.getItem("userRole");

  if (!user) return <Navigate to={`/${role}/login`} />;
  if (storedRole !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
