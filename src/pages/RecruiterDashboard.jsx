import React, { useState } from "react";
import RecruiterDashboardNavbar from "../components/RecruiterDashboardNavbar";
import {
  FaFileUpload,
  FaKey,
  FaQuestionCircle,
  FaChartLine,
} from "react-icons/fa";

import ResumeUpload from "../components/ResumeUpload";
import KeywordsList from "../components/KeywordsList";
import AIQuestions from "../components/AIQuestions";
import FeedbackCard from "../components/FeedbackCard";

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("resume");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared resume states
  const [keywords, setKeywords] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  // Feedback
  const [feedbackData, setFeedbackData] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  /* ---------------- GENERATE RECRUITER INSIGHTS ---------------- */
  const generateCandidateInsights = async () => {
    if (
      !keywords.length &&
      !experience.length &&
      !projects.length &&
      !certifications.length
    ) {
      alert("No resume data available!");
      return;
    }

    setLoadingFeedback(true);
    try {
      const res = await fetch("http://localhost:5001/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          experience,
          projects,
          certifications,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Failed to generate insights.");
        return;
      }

      // Normalize for FeedbackCard
      const merged = {
        ...data,
        suggestions: [
          ...(data.strengths || []),
          ...(data.improvements || []),
        ],
      };

      setFeedbackData(merged);
    } catch (err) {
      console.error(err);
      alert("Error generating candidate insights.");
    }

    setLoadingFeedback(false);
  };

  /* ---------------- TAB RENDER ---------------- */
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
            onNext={() => setActiveTab("feedback")}
          />
        );

      case "feedback":
        return (
          <div>
            <button
              onClick={generateCandidateInsights}
              className="px-4 py-2 mb-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              disabled={loadingFeedback}
            >
              {loadingFeedback
                ? "Generating Candidate Insights..."
                : "Generate Candidate Insights"}
            </button>

            <FeedbackCard results={feedbackData} questions={questions} />
          </div>
        );

      default:
        return null;
    }
  };

  /* ---------------- SIDEBAR MENU ---------------- */
  const menuItems = [
    {
      key: "resume",
      label: "Upload Candidate Resume",
      icon: <FaFileUpload />,
    },
    {
      key: "keywords",
      label: "Extracted Skills",
      icon: <FaKey />,
    },
    {
      key: "questions",
      label: "AI Interview Questions",
      icon: <FaQuestionCircle />,
    },
    {
      key: "feedback",
      label: "Candidate Analytics",
      icon: <FaChartLine />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RecruiterDashboardNavbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex pt-20">
        {/* Sidebar */}
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

        {/* Main */}
        <main className="flex-1 ml-0 md:ml-64 p-6 transition-all">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
