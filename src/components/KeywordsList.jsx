// src/components/KeywordsList.jsx
import React from "react";
import { Tag, Briefcase, Award, BookOpen } from "lucide-react";

const KeywordsList = ({
  keywords = [],
  experience = [],
  projects = [],
  certifications = [],
  onNext = () => {}, // ✅ default to avoid crash if not passed
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md w-full max-w-5xl mx-auto space-y-8">

      {/* Keywords */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Tag className="text-blue-500" size={22} /> Extracted Keywords
        </h2>

        {keywords.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No keywords extracted. Try uploading a different resume or ensure it contains technical skills.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {keywords.map((kw, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-xl font-medium shadow-sm hover:scale-105 transition-transform"
              >
                {kw}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Briefcase className="text-green-500" size={22} /> Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {exp.role} {exp.company && `@ ${exp.company}`}
                </h3>
                {exp.duration && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {exp.duration}
                  </p>
                )}
                {exp.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <BookOpen className="text-purple-500" size={22} /> Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {proj.name}
                </h3>
                {proj.techStack && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {proj.techStack}
                  </p>
                )}
                {proj.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Award className="text-yellow-500" size={22} /> Certifications
          </h2>
          <div className="flex flex-wrap gap-3">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-full font-medium shadow-sm"
              >
                {cert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
        >
          Next → Generate Questions
        </button>
      </div>
    </div>
  );
};

export default KeywordsList;
