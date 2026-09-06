import os
import json
import re
import tempfile

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

import PyPDF2
from docx import Document
import spacy

# Google Gemini - NEW SDK
from google import genai
from google.genai import types


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Please add GEMINI_API_KEY to backend/.env"
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(api_key=GEMINI_API_KEY)

# Use the model available to your Gemini account
GEMINI_MODEL = "gemini-3.6-flash"


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)


# ============================================================
# SPACY
# ============================================================

try:
    nlp = spacy.load("en_core_web_sm")
    print("Loaded spaCy model: en_core_web_sm")
except Exception:
    print("spaCy model not found. Using blank English model.")
    nlp = spacy.blank("en")


# ============================================================
# TECHNICAL KEYWORDS
# ============================================================

TECH_KEYWORDS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "html",
    "css",
    "react",
    "reactjs",
    "node",
    "nodejs",
    "express",
    "flask",
    "django",
    "fastapi",
    "mongodb",
    "mysql",
    "postgresql",
    "sql",
    "firebase",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai",
    "nlp",
    "computer vision",
    "tensorflow",
    "pytorch",
    "keras",
    "scikit-learn",
    "numpy",
    "pandas",
    "matplotlib",
    "seaborn",
    "opencv",
    "xgboost",
    "power bi",
    "tableau",
    "rest api",
    "api",
    "bootstrap",
    "tailwind",
    "nextjs",
    "next.js",
]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clean_text(text):
    """Clean extracted resume text."""

    if not text:
        return ""

    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_pdf_text(filepath):
    """Extract text from PDF."""

    text = ""

    try:
        with open(filepath, "rb") as file:
            reader = PyPDF2.PdfReader(file)

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:
        print("PDF extraction error:", e)

    return clean_text(text)


def extract_docx_text(filepath):
    """Extract text from DOCX."""

    text = ""

    try:
        document = Document(filepath)

        for paragraph in document.paragraphs:
            if paragraph.text:
                text += paragraph.text + "\n"

    except Exception as e:
        print("DOCX extraction error:", e)

    return clean_text(text)


def extract_resume_text(filepath):
    """Extract resume text based on file extension."""

    extension = os.path.splitext(filepath)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(filepath)

    if extension == ".docx":
        return extract_docx_text(filepath)

    return ""


def extract_keywords(text):
    """Extract technical keywords from resume."""

    text_lower = text.lower()

    found_keywords = []

    for keyword in TECH_KEYWORDS:

        if keyword.lower() in text_lower:

            if keyword.lower() not in [
                k.lower() for k in found_keywords
            ]:

                found_keywords.append(keyword)

    return sorted(found_keywords)


def extract_experience(text):
    """Extract basic experience information."""

    experience = []

    lines = text.split("\n")

    for line in lines:

        lower_line = line.lower()

        if any(
            word in lower_line
            for word in [
                "experience",
                "internship",
                "intern",
                "developer",
                "engineer",
                "worked at",
                "work experience"
            ]
        ):

            cleaned = line.strip()

            if cleaned:
                experience.append(cleaned)

    return experience[:10]


def extract_projects(text):
    """Extract basic project information."""

    projects = []

    lines = text.split("\n")

    project_section = False

    for line in lines:

        stripped = line.strip()

        lower_line = stripped.lower()

        if "project" in lower_line:
            project_section = True
            continue

        if project_section:

            if stripped:

                if any(
                    section in lower_line
                    for section in [
                        "education",
                        "experience",
                        "skills",
                        "certification",
                        "achievement"
                    ]
                ):
                    project_section = False
                    continue

                projects.append(stripped)

    return projects[:15]


def extract_certifications(text):
    """Extract basic certification information."""

    certifications = []

    lines = text.split("\n")

    for line in lines:

        lower_line = line.lower()

        if any(
            word in lower_line
            for word in [
                "certification",
                "certified",
                "certificate"
            ]
        ):

            cleaned = line.strip()

            if cleaned:
                certifications.append(cleaned)

    return certifications[:10]


def clean_gemini_json(text):
    """Clean Gemini response before JSON parsing."""

    if not text:
        return ""

    text = text.strip()

    # Remove markdown code fences
    if text.startswith("```"):

        text = re.sub(
            r"^```(?:json)?",
            "",
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r"```$",
            "",
            text
        )

    text = text.strip()

    # Find JSON array if Gemini added extra text
    start = text.find("[")

    end = text.rfind("]")

    if start != -1 and end != -1:

        text = text[start:end + 1]

    return text.strip()


def generate_gemini_content(prompt):
    """Generate content using Gemini."""

    print("Calling Gemini...")

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )

    return response.text


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "success",
        "message": "AI Interview Bot Flask Backend is running",
        "port": 5001
    })


@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "gemini": "configured",
        "model": GEMINI_MODEL
    })


# ============================================================
# UPLOAD RESUME
# ============================================================

@app.route("/upload-resume", methods=["POST"])
def upload_resume():

    try:

        if "resume" not in request.files:

            return jsonify({
                "error": "No resume file uploaded"
            }), 400

        resume = request.files["resume"]

        if not resume.filename:

            return jsonify({
                "error": "No filename provided"
            }), 400

        filename = secure_filename(resume.filename)

        print("Resume received:", resume.filename)

        extension = os.path.splitext(filename)[1].lower()

        if extension not in [".pdf", ".docx"]:

            return jsonify({
                "error": "Only PDF and DOCX files are supported"
            }), 400

        temp_path = None

        try:

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=extension
            ) as temp_file:

                resume.save(temp_file.name)

                temp_path = temp_file.name

            text = extract_resume_text(temp_path)

        finally:

            if temp_path and os.path.exists(temp_path):

                os.remove(temp_path)

        if not text:

            return jsonify({
                "error": "Could not extract text from resume"
            }), 400

        print("Extracted", len(text), "characters from resume")

        keywords = extract_keywords(text)

        experience = extract_experience(text)

        projects = extract_projects(text)

        certifications = extract_certifications(text)

        print("Keywords:", keywords)

        print("Experience:", len(experience))

        print("Projects:", len(projects))

        print("Certifications:", len(certifications))

        return jsonify({

            "success": True,

            "text": text,

            "keywords": keywords,

            "experience": experience,

            "projects": projects,

            "certifications": certifications

        })

    except Exception as e:

        print("Error in /upload-resume:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# GENERATE AI INTERVIEW QUESTIONS
# ============================================================

@app.route("/generate-questions", methods=["POST"])
def generate_questions():

    print()
    print("====================================")
    print("REQUEST RECEIVED: /generate-questions")
    print("====================================")

    try:

        data = request.get_json(silent=True) or {}

        keywords = data.get("keywords", [])

        experience = data.get("experience", [])

        projects = data.get("projects", [])

        certifications = data.get("certifications", [])

        print("Keywords received:", keywords)

        print("Experience received:", experience)

        print("Projects received:", projects)

        print("Certifications received:", certifications)

        if not keywords:

            return jsonify({
                "error": "No keywords provided"
            }), 400

        prompt = f"""
You are an AI Interview Assistant.

Generate exactly 10 technical interview questions with answers.

The questions should be personalized according to the candidate's resume information.

Candidate Skills:
{", ".join(keywords)}

Candidate Experience:
{json.dumps(experience)}

Candidate Projects:
{json.dumps(projects)}

Candidate Certifications:
{json.dumps(certifications)}

Requirements:

1. Generate exactly 10 questions.
2. Questions should be suitable for a technical interview.
3. Questions should focus mainly on the candidate's skills.
4. Include a mixture of beginner, intermediate and advanced questions.
5. Provide a concise but useful answer for every question.
6. Do not generate HR or behavioral questions.
7. Return ONLY a JSON array.
8. Every object must contain exactly these fields:

[
  {{
    "question": "Question here",
    "answer": "Answer here"
  }}
]
"""

        text = generate_gemini_content(prompt)

        print("Gemini response received")

        cleaned_text = clean_gemini_json(text)

        questions = json.loads(cleaned_text)

        if not isinstance(questions, list):

            raise ValueError(
                "Gemini returned invalid question format"
            )

        cleaned_questions = []

        for item in questions:

            if not isinstance(item, dict):
                continue

            question = item.get("question", "")

            answer = item.get("answer", "")

            if question:

                cleaned_questions.append({

                    "question": str(question).strip(),

                    "answer": str(answer).strip()

                })

        if not cleaned_questions:

            raise ValueError(
                "Gemini did not return any valid questions"
            )

        print(
            "Generated",
            len(cleaned_questions),
            "questions"
        )

        return jsonify({

            "success": True,

            "questions": cleaned_questions[:10]

        })

    except json.JSONDecodeError as e:

        print("JSON parsing error:", e)

        return jsonify({

            "error": "Gemini returned an invalid response. Please try again."

        }), 500

    except Exception as e:

        print("ERROR in /generate-questions:")

        print(str(e))

        return jsonify({

            "error": str(e)

        }), 500


# ============================================================
# ANALYZE RESUME
# ============================================================

@app.route("/analyze-resume", methods=["POST"])
def analyze_resume():

    try:

        data = request.get_json(silent=True) or {}

        keywords = data.get("keywords", [])

        experience = data.get("experience", [])

        projects = data.get("projects", [])

        certifications = data.get("certifications", [])

        if not keywords:

            return jsonify({

                "error": "No resume information provided"

            }), 400

        prompt = f"""
Analyze this candidate's resume information.

Skills:
{", ".join(keywords)}

Experience:
{json.dumps(experience)}

Projects:
{json.dumps(projects)}

Certifications:
{json.dumps(certifications)}

Provide a concise professional analysis.

Return ONLY valid JSON in this format:

{{
    "summary": "Short candidate summary",
    "strengths": [
        "Strength 1",
        "Strength 2",
        "Strength 3"
    ],
    "weaknesses": [
        "Area for improvement 1",
        "Area for improvement 2"
    ],
    "recommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
    ]
}}
"""

        try:

            response_text = generate_gemini_content(prompt)

            response_text = clean_gemini_json(response_text)

            # Analysis is an object, not an array
            analysis = json.loads(response_text)

            return jsonify({

                "success": True,

                "analysis": analysis

            })

        except Exception as gemini_error:

            print(
                "Gemini analysis error:",
                gemini_error
            )

            # Fallback analysis
            return jsonify({

                "success": True,

                "analysis": {

                    "summary":
                        "Candidate has a technical profile with experience across the listed skills.",

                    "strengths":
                        keywords[:5],

                    "weaknesses": [
                        "More project depth can strengthen the profile.",
                        "Advanced technical concepts can be practiced further."
                    ],

                    "recommendations": [
                        "Practice technical interview questions.",
                        "Strengthen understanding of core concepts.",
                        "Prepare detailed explanations for projects."
                    ]

                }

            })

    except Exception as e:

        print("Error in /analyze-resume:", e)

        return jsonify({

            "error": str(e)

        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("========================================")
    print("AI INTERVIEW BOT - FLASK BACKEND")
    print("========================================")
    print("Backend URL: http://localhost:5001")
    print("Health URL:  http://localhost:5001/health")
    print("Upload API:  http://localhost:5001/upload-resume")
    print("Questions:   http://localhost:5001/generate-questions")
    print("Analysis:    http://localhost:5001/analyze-resume")
    print("Gemini API: Configured")
    print("Gemini Model:", GEMINI_MODEL)
    print("========================================")
    print()

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )