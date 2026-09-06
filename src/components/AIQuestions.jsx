import React, { useState } from "react";

const AIQuestions = ({
  keywords = [],
  experience = [],
  projects = [],
  certifications = [],
  setQuestions,
  onNext,
}) => {
  const [loading, setLoading] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!keywords || keywords.length === 0) {
      setError("No technical skills were extracted from the resume.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending data to Flask:");
      console.log({
        keywords,
        experience,
        projects,
        certifications,
      });

      const response = await fetch(
        "http://localhost:5001/generate-questions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            keywords,
            experience,
            projects,
            certifications,
          }),
        }
      );

      const data = await response.json();

      console.log("Flask response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate AI questions"
        );
      }

      if (
        !data.questions ||
        !Array.isArray(data.questions)
      ) {
        throw new Error(
          "Invalid question data received from backend."
        );
      }

      setQuestions(data.questions);
      setQuestionsList(data.questions);

    } catch (error) {
      console.error(
        "AI QUESTIONS ERROR:",
        error
      );

      setError(
        error.message ||
        "Failed to generate AI questions."
      );

      setQuestions([]);
      setQuestionsList([]);

    } finally {
      setLoading(false);
    }
  };

  const clearQuestions = () => {
    setQuestions([]);
    setQuestionsList([]);
    setError("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        AI Generated Questions
      </h2>

      {keywords.length > 0 && (
        <div className="mb-4">

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Skills detected from your resume:
          </p>

          <div className="flex flex-wrap gap-2">

            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}

          </div>

        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-4">

        <button
          onClick={generateQuestions}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : "Generate / Refresh"}
        </button>

        <button
          onClick={clearQuestions}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          Clear
        </button>

      </div>

      {loading && (
        <div className="p-4 mb-4 bg-blue-50 text-blue-700 rounded-xl">
          AI is generating interview questions based on your resume...
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {questionsList.length > 0 && (

        <div className="mt-4 space-y-4">

          {questionsList.map((q, index) => (

            <div
              key={index}
              className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >

              <p className="font-semibold text-gray-900 dark:text-white">
                Q{index + 1}: {q.question}
              </p>

              {q.answer && (
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Answer:</strong>{" "}
                  {q.answer}
                </p>
              )}

            </div>

          ))}

        </div>

      )}

      {questionsList.length > 0 && (

        <button
          onClick={onNext}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Next → Interview Analysis
        </button>

      )}

    </div>
  );
};

export default AIQuestions;