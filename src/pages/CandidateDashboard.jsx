import React, { useState } from "react";
import CandidateDashboardNavbar from "../components/CandidateDashboardNavbar";
import { FaFileUpload, FaKey, FaQuestionCircle, FaVideo, FaChartLine } from "react-icons/fa";

import ResumeUpload from "../components/ResumeUpload";
import KeywordsList from "../components/KeywordsList";
import AIQuestions from "../components/AIQuestions";
import InterviewAnalysisRealtime from "../components/InterviewAnalysisRealtime";
import FeedbackCard from "../components/FeedbackCard";

const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState("resume");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persisted states
  const [keywords, setKeywords] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  // Feedback state (single merged source of truth)
  const [feedbackData, setFeedbackData] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // ✅ Generate professional resume feedback via backend
  const generateFeedback = async () => {
    if (!keywords.length && !experience.length && !projects.length && !certifications.length) {
      alert("No resume data available for feedback!");
      return;
    }

    setLoadingFeedback(true);
    try {
      const res = await fetch("http://localhost:5001/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, experience, projects, certifications }),
      });

      const data = await res.json();

      if (data.error) {
        console.error(data.error);
        alert("Failed to generate feedback. Using fallback.");

        const fallback = {
          resumeScore: Math.floor(
            (([keywords, experience, projects, certifications].filter(arr => arr.length).length) / 4) * 100
          ),
          suggestions: [
            ...(!keywords.length ? ["Add relevant technical keywords."] : []),
            ...(!experience.length ? ["Add professional experience details."] : []),
            ...(!projects.length ? ["Include projects with tech stack."] : []),
            ...(!certifications.length ? ["Add any certifications or courses."] : []),
          ],
          analytics: {
            keywords: keywords.length,
            experience: experience.length,
            projects: projects.length,
            certifications: certifications.length,
          },
        };

        // 🔗 Merge resume feedback with any existing interview metrics
        setFeedbackData(prev => ({
          ...(prev || {}),
          ...fallback,
        }));
      } else {
        // Combine strengths + improvements into suggestions for FeedbackCard
        const merged = {
          ...data,
          suggestions: [...(data.strengths || []), ...(data.improvements || [])],
        };

        // 🔗 Merge with existing interview results (if already present)
        setFeedbackData(prev => ({
          ...(prev || {}),
          ...merged,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate feedback. Please try again.");
    }
    setLoadingFeedback(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "resume":
        return (
          <ResumeUpload
            file={file}
            fileURL={fileURL}
            setFile={setFile}
            setFileURL={setFileURL}
            setKeywords={setKeywords}
            setExperience={setExperience}
            setProjects={setProjects}
            setCertifications={setCertifications}
            onNext={() => setActiveTab("keywords")}
          />
        );
      case "keywords":
        return (
          <KeywordsList
            keywords={keywords}
            experience={experience}
            projects={projects}
            certifications={certifications}
            onNext={() => setActiveTab("questions")}
          />
        );
      case "questions":
        return (
          <AIQuestions
            keywords={keywords}
            setQuestions={setQuestions}
            onNext={() => setActiveTab("interview")}
          />
        );
      case "interview":
        return (
          <InterviewAnalysisRealtime
            context={{ keywords, experience, projects, certifications }}
            onFinish={(report) => {
              // 🔗 Merge interview report with existing resume feedback (if any)
              setFeedbackData(prev => ({
                ...(prev || {}),
                ...report,
              }));
              setActiveTab("feedback"); // auto-switch to feedback after interview
            }}
          />
        );
      case "feedback":
        return (
          <div>
            <button
              onClick={generateFeedback}
              className="px-4 py-2 mb-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              disabled={loadingFeedback}
            >
              {loadingFeedback ? "Generating Feedback..." : "Generate Professional Resume Feedback"}
            </button>

            {/* FeedbackCard now always gets the merged data (resume + interview) */}
            <FeedbackCard results={feedbackData} />
          </div>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { key: "resume", label: "Resume Upload", icon: <FaFileUpload /> },
    { key: "keywords", label: "Keywords / Skills", icon: <FaKey /> },
    { key: "questions", label: "AI Questions", icon: <FaQuestionCircle /> },
    { key: "interview", label: "Interview", icon: <FaVideo /> },
    { key: "feedback", label: "Feedback & Results", icon: <FaChartLine /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CandidateDashboardNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-20">
        <aside
          className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 z-40`}
        >
          <nav className="flex flex-col p-6 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeTab === item.key
                    ? "bg-blue-500 text-white"
                    : "text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 ml-0 md:ml-64 p-6 transition-all">{renderTab()}</main>
      </div>
    </div>
  );
};

export default CandidateDashboard;