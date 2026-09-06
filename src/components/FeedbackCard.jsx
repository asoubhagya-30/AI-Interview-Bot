import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FeedbackCard = ({ results }) => {
  if (!results)
    return (
      <p className="text-gray-700 dark:text-gray-300 text-center mt-6">
        No feedback available yet.
      </p>
    );

  const {
    // Resume analysis (from /analyze-resume)
    resumeScore,
    analytics,
    strengths = [],
    improvements = [],
    suggestions = [],

    // Interview metrics (from InterviewAnalysisRealtime onFinish report)
    avgScore,
    avgPosture,
    avgVoice,
    totalQuestions,
    totalAsked,
    answered,
    perTurnFeedback = [],
    interviewSuggestions = [],
  } = results;

  const questionsCount = totalQuestions ?? totalAsked ?? 0;

  const hasInterviewData =
    (avgScore != null && !Number.isNaN(avgScore)) ||
    (avgPosture != null && !Number.isNaN(avgPosture)) ||
    (avgVoice != null && !Number.isNaN(avgVoice)) ||
    (answered ?? 0) > 0;

  // --- Bar Chart for Interview Performance ---
  const performanceData = {
    labels: ["Content Score", "Posture", "Voice Clarity"],
    datasets: [
      {
        label: "Performance (%)",
        data: [avgScore || 0, avgPosture || 0, avgVoice || 0],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  // --- Dynamic strengths & improvements from interview metrics ---
  const dynamicStrengths = [];
  const dynamicImprovements = [];

  if (hasInterviewData && avgScore != null) {
    if (avgScore >= 75) {
      dynamicStrengths.push(
        "You gave strong, well-structured answers with good technical depth."
      );
    } else if (avgScore >= 50) {
      dynamicStrengths.push(
        "Your answers show understanding, but can be improved with clearer structure and more examples."
      );
      dynamicImprovements.push(
        "Practice answering with the STAR method (Situation, Task, Action, Result)."
      );
    } else {
      dynamicImprovements.push(
        "Work on understanding core concepts and practice expressing them clearly in your own words."
      );
    }
  }

  if (hasInterviewData && avgPosture != null) {
    if (avgPosture >= 70) {
      dynamicStrengths.push(
        "Your posture and on-screen presence look confident and professional."
      );
    } else {
      dynamicImprovements.push(
        "Sit upright, keep your face centered, and avoid leaning too far away from the camera."
      );
    }
  }

  if (hasInterviewData && avgVoice != null) {
    if (avgVoice >= 70) {
      dynamicStrengths.push(
        "Your voice level and clarity are good, making you easy to understand."
      );
    } else {
      dynamicImprovements.push(
        "Speak a bit louder and slower, and focus on clear pronunciation."
      );
    }
  }

  // Resume suggestions + interview suggestions + heuristic improvements
  const combinedImprovements = [
    ...interviewSuggestions,
    ...improvements,
    ...dynamicImprovements,
  ];

  const combinedStrengths = [...strengths, ...dynamicStrengths];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        AI Interview Feedback
      </h2>

      {/* --- Resume Section --- */}
      {resumeScore != null && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Resume Score: {resumeScore} / 100
          </h3>

          {/* Strengths & improvements from resume analysis */}
          {suggestions.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          )}

          {analytics && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Keywords: {analytics.keywords} · Experience: {analytics.experience} · Projects:{" "}
              {analytics.projects} · Certifications: {analytics.certifications}
            </p>
          )}
        </div>
      )}

      {/* --- Interview Summary (only if we actually have interview data) --- */}
      {hasInterviewData ? (
        <>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Interview Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Total Questions:</strong> {questionsCount || "N/A"}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Answered:</strong> {answered ?? 0}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Average Content Score:</strong> {avgScore ?? "N/A"} / 100
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Average Posture:</strong> {avgPosture ?? "N/A"} / 100
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Voice Clarity:</strong> {avgVoice ?? "N/A"} / 100
            </p>
          </div>

          {/* --- Performance Chart --- */}
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Overall Interview Performance
            </h3>
            <Bar data={performanceData} options={chartOptions} />
          </div>
        </>
      ) : (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Interview Summary
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            No mock interview data yet. Complete an AI interview to see detailed
            content, posture, and voice analysis here.
          </p>
        </div>
      )}

      {/* --- Combined Strengths & Improvements --- */}
      {(combinedStrengths.length > 0 || combinedImprovements.length > 0 || perTurnFeedback.length > 0) && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Strengths & Improvements
          </h3>

          {combinedStrengths.length > 0 && (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Strengths
              </h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {combinedStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {combinedImprovements.length > 0 && (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-3">
                Suggested Improvements
              </h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {combinedImprovements.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </>
          )}

          {perTurnFeedback.length > 0 && (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-3">
                Question-wise Feedback
              </h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                {perTurnFeedback.map((f, i) => (
                  <li key={i}>
                    <strong>Q{(f.turn ?? i) + 1}:</strong> {f.text}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
