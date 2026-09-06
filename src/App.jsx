// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Steps from "./components/Steps";
import Footer from "./components/Footer";
import CTA from "./components/CTA";
import CandidateAuth from "./pages/CandidateAuth";
import RecruiterAuth from "./pages/RecruiterAuth";
import CandidateDashboard from "./pages/CandidateDashboard"; // new page
import RecruiterDashboard from "./pages/RecruiterDashboard";
// import RecruiterDashboard later if needed

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Features />
              <Steps />
              <CTA />
              <Footer />
            </>
          }
        />
        <Route path="/candidate" element={<CandidateAuth />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} /> {/* New route */}
        <Route path="/recruiter" element={<RecruiterAuth />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        {/* Add recruiter dashboard route here later */}
      </Routes>
    </Router>
  );
}

export default App;
