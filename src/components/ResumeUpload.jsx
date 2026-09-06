import React, { useState } from "react";
import { X } from "lucide-react";
import { auth } from "../firebase";

const ResumeUpload = ({
  file,
  fileURL,
  setFile,
  setFileURL,
  setKeywords,
  setExperience,
  setProjects,
  setCertifications,
  onNext = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [storedKeywords, setStoredKeywords] = useState([]);
  const [error, setError] = useState("");

  /* ---------------- FILE SELECT ---------------- */
  const handleUpload = (e) => {
    const uploadedFile = e.target.files?.[0];

    if (!uploadedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert("Please upload only PDF or DOCX files.");
      e.target.value = "";
      return;
    }

    // Reset previous extracted data
    setKeywords([]);
    setExperience([]);
    setProjects([]);
    setCertifications([]);
    setStoredKeywords([]);
    setError("");

    // Save selected file
    setFile(uploadedFile);

    // Create preview URL
    const previewURL = URL.createObjectURL(uploadedFile);
    setFileURL(previewURL);
  };

  /* ---------------- REMOVE FILE ---------------- */
  const handleRemove = () => {
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
    }

    setFile(null);
    setFileURL(null);

    setKeywords([]);
    setExperience([]);
    setProjects([]);
    setCertifications([]);
    setStoredKeywords([]);
    setError("");
  };

  /* ---------------- SUBMIT / EXTRACT RESUME ---------------- */
  const handleSubmit = async () => {
    setError("");

    // Check selected file
    if (!file) {
      setError("No resume file is uploaded. Please select a PDF or DOCX file.");
      return;
    }

    // Check login
    if (!auth.currentUser) {
      setError("You must be logged in before uploading your resume.");
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         STEP 1: SEND RESUME TO FLASK
         ===================================================== */

      const formData = new FormData();

      // IMPORTANT:
      // Flask backend expects request.files["resume"]
      formData.append("resume", file);

      console.log("Sending resume to Flask:", file.name);

      const res = await fetch(
        "http://localhost:5001/upload-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log("Flask response:", data);

      if (!res.ok) {
        throw new Error(
          data?.error || "Resume extraction failed."
        );
      }

      /* =====================================================
         STEP 2: UPDATE FRONTEND STATE
         ===================================================== */

      const extractedKeywords = data.keywords || [];
      const extractedExperience = data.experience || [];
      const extractedProjects = data.projects || [];
      const extractedCertifications = data.certifications || [];

      setKeywords(extractedKeywords);
      setExperience(extractedExperience);
      setProjects(extractedProjects);
      setCertifications(extractedCertifications);

      console.log(
        "Extracted keywords:",
        extractedKeywords
      );

      console.log(
        "Extracted experience:",
        extractedExperience
      );

      console.log(
        "Extracted projects:",
        extractedProjects
      );

      console.log(
        "Extracted certifications:",
        extractedCertifications
      );

      /* =====================================================
         STEP 3: SAVE KEYWORDS TO MONGODB
         ===================================================== */

      const token = await auth.currentUser.getIdToken();

      const saveRes = await fetch(
        "http://localhost:5003/api/resume/save-keywords",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            keywords: extractedKeywords,
          }),
        }
      );

      const saveData = await saveRes.json();

      console.log(
        "MongoDB save response:",
        saveData
      );

      if (!saveRes.ok) {
        throw new Error(
          saveData?.error ||
            "Failed to save resume keywords."
        );
      }

      /* =====================================================
         STEP 4: DISPLAY STORED KEYWORDS
         ===================================================== */

      setStoredKeywords(
        saveData.keywords || extractedKeywords
      );

      setLoading(false);

      /* =====================================================
         STEP 5: MOVE TO NEXT PAGE
         ===================================================== */

      onNext();

    } catch (err) {
      console.error(
        "Resume upload/extraction error:",
        err
      );

      setError(
        err.message ||
          "Backend connection failed. Please make sure the Flask backend is running."
      );

      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md w-full max-w-3xl mx-auto">

      {/* TITLE */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Upload Your Resume
      </h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-300 text-red-700">
          <p className="font-semibold">
            Error
          </p>

          <p className="text-sm mt-1">
            {error}
          </p>
        </div>
      )}

      {/* FILE INPUT */}
      {!file && (
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleUpload}
          className="border p-2 rounded-md w-full dark:bg-gray-700 dark:border-gray-600"
        />
      )}

      {/* SELECTED FILE */}
      {file && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 relative">

          {/* REMOVE BUTTON */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
          >
            <X size={18} />
          </button>

          {/* FILE NAME */}
          <p className="font-medium text-gray-900 dark:text-white pr-8">
            {file.name}
          </p>

          {/* FILE SIZE */}
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {(file.size / 1024).toFixed(2)} KB
          </p>

        </div>
      )}

      {/* EXTRACT BUTTON */}
      {file && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {loading
            ? "Extracting Resume..."
            : "Extract Resume"}
        </button>
      )}

      {/* PDF PREVIEW */}
      {file &&
        !loading &&
        file.type === "application/pdf" &&
        fileURL && (
          <div className="mt-6">

            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
              Resume Preview
            </h3>

            <iframe
              src={fileURL}
              title="Resume Preview"
              className="w-full h-[500px] border rounded-lg"
            />

          </div>
        )}

      {/* STORED KEYWORDS */}
      {storedKeywords.length > 0 && (
        <div className="mt-6">

          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Stored Resume Keywords
          </h3>

          <div className="flex flex-wrap gap-2">

            {storedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {kw}
              </span>
            ))}

          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeUpload;