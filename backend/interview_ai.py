# backend/interview_ai.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, json, re, base64, tempfile

import google.generativeai as genai

# Optional libs: OpenCV + pyAudioAnalysis
try:
    import cv2
except ImportError:
    cv2 = None

try:
    from pyAudioAnalysis import audioBasicIO, ShortTermFeatures
except ImportError:
    audioBasicIO = None
    ShortTermFeatures = None

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY in backend/.env")

genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

SYSTEM_INSTRUCTION = """
You are a concise AI interviewer. For each turn you receive the previous question, 
the candidate's answer, and numerical posture/voice scores (0-100). Consider content,
clarity, and posture/voice when producing a short evaluation and deciding the next
question. Always RETURN EXACTLY one JSON object (no extra text) with keys:
- next_question: string (or empty string if finished)
- finished: boolean
- score: integer (0-100) -- overall score for this answer
- feedback: short string (1-2 sentences) -- actionable suggestion about this answer
- summary: optional short summary sentence about the candidate so far
Keep responses short and JSON-only.
"""

# -------------------------------------------------------------------
# OpenCV posture analysis
# -------------------------------------------------------------------
def analyze_posture_from_frame(frame_path: str) -> float:
    """
    Estimate posture / presence score using OpenCV face detection.
    Returns score [0, 100].
    """
    if not frame_path or cv2 is None:
        return 0.0

    try:
        img = cv2.imread(frame_path)
        if img is None:
            return 0.0

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            return 0.0

        h, w = gray.shape[:2]
        img_area = float(h * w)

        max_area = 0.0
        for (x, y, fw, fh) in faces:
            area = float(fw * fh)
            if area > max_area:
                max_area = area

        ratio = max_area / img_area if img_area > 0 else 0.0
        posture_score = max(0.0, min(100.0, ratio * 40000.0))
        return float(posture_score)
    except Exception as e:
        print("OpenCV posture error:", e)
        return 0.0

# -------------------------------------------------------------------
# pyAudioAnalysis voice analysis (wired; optional for future audio upload)
# -------------------------------------------------------------------
def analyze_voice_from_audio(audio_path: str) -> float:
    """
    Estimate voice / confidence score using pyAudioAnalysis.
    Expects a path to an audio file (.wav).
    Returns score [0, 100].
    """
    if not audio_path or audioBasicIO is None or ShortTermFeatures is None:
        return 0.0

    try:
        [Fs, x] = audioBasicIO.read_audio_file(audio_path)
        if x is None or len(x) == 0:
            return 0.0

        if len(x.shape) > 1:
            x = x.mean(axis=1)

        F, _ = ShortTermFeatures.feature_extraction(
            x, Fs, 0.05 * Fs, 0.025 * Fs
        )

        energy = F[1, :] if F.shape[0] > 1 else F[0, :]
        avg_energy = float(energy.mean())

        voice_score = max(0.0, min(100.0, avg_energy * 10.0))
        return float(voice_score)
    except Exception as e:
        print("pyAudioAnalysis voice error:", e)
        return 0.0

# -------------------------------------------------------------------
# /analyze-media: get posture (OpenCV) and optionally voice (pyAudioAnalysis)
# -------------------------------------------------------------------
@app.route("/analyze-media", methods=["POST"])
def analyze_media():
    """
    Accepts:
      - JSON with 'frame_b64' (base64 image string)
      - Optional multipart 'audio_file' (for future audio-based voice analysis)
    Returns:
      { posture: 0-100, voice: 0-100 }
    """
    posture_score = 0.0
    voice_score = 0.0

    data = None
    if request.is_json:
        try:
            data = request.get_json() or {}
        except Exception:
            data = None

    # ---- Frame (image) from base64 ----
    if data and "frame_b64" in data:
        frame_b64 = data.get("frame_b64")
        try:
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",")[1]
            img_bytes = base64.b64decode(frame_b64)

            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_img:
                tmp_img.write(img_bytes)
                tmp_img_path = tmp_img.name

            posture_score = analyze_posture_from_frame(tmp_img_path)
        except Exception as e:
            print("Error analyzing posture from frame:", e)

    # ---- Audio file (optional) ----
    if "audio_file" in request.files:
        try:
            audio_file = request.files["audio_file"]
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
                audio_file.save(tmp_audio.name)
                tmp_audio_path = tmp_audio.name

            voice_score = analyze_voice_from_audio(tmp_audio_path)
        except Exception as e:
            print("Error analyzing voice from audio:", e)

    return jsonify({
        "posture": float(posture_score),
        "voice": float(voice_score),
    })

# -------------------------------------------------------------------
# Main AI Interview Endpoint
# -------------------------------------------------------------------
@app.route("/ai-interview", methods=["POST"])
def ai_interview():
    payload = request.get_json() or {}
    prev_question = payload.get("question", "")
    answer = payload.get("answer", "")
    context = payload.get("context", {})
    turn = int(payload.get("turn", 0))
    max_turns = int(payload.get("total_questions", 7))
    posture = payload.get("posture", None)
    voice = payload.get("voice", None)

    posture = None if posture is None else float(posture)
    voice = None if voice is None else float(voice)

    # Build compact context for LLM
    short_context = {
        "keywords": context.get("keywords", [])[:10],
        "experience_count": len(context.get("experience", []) or []),
        "projects_count": len(context.get("projects", []) or []),
    }

    prompt = f"""
System: {SYSTEM_INSTRUCTION}

Context: {json.dumps(short_context, ensure_ascii=False, separators=(',',':'))}

Previous question: {prev_question}
Candidate answer: {answer}
PostureScore: {posture}
VoiceScore: {voice}
Turn: {turn}
MaxTurns: {max_turns}

Return JSON now.
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = (response.text or "").strip()

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            obj_text = match.group(0)
            data = json.loads(obj_text)
        else:
            data = {}

        next_q = data.get("next_question", "") or ""
        finished = bool(data.get("finished", False))
        try:
            llm_score = int(data.get("score", 0))
        except Exception:
            llm_score = 0
        feedback_text = data.get("feedback", "") or ""
        summary = data.get("summary", "") or ""

        # If model returns nothing useful, do simple scoring fallback
        if not next_q and not feedback_text and llm_score == 0:
            word_count = len(answer.split())
            content_score = min(100, max(10, word_count * 3))

            posture_score = posture if posture is not None else 60.0
            voice_score = voice if voice is not None else 60.0

            combined = (
                content_score * 0.6 +
                posture_score * 0.2 +
                voice_score * 0.2
            )
            llm_score = int(round(combined))

            feedback_text = (
                "Answer recorded. Try to structure your response clearly and maintain steady posture and voice."
            )
            next_q = (
                ""
                if turn + 1 >= max_turns
                else f"Follow-up: elaborate on {short_context['keywords'][:1] or 'your most recent project'}."
            )
            finished = (turn + 1) >= max_turns
            summary = "Preliminary automated summary combining content, posture, and voice."

        final_score = max(0, min(100, llm_score))

        if turn + 1 >= max_turns:
            finished = True
            if not next_q:
                next_q = ""

        return jsonify(
            {
                "next_question": next_q,
                "finished": finished,
                "score": final_score,
                "feedback": feedback_text,
                "summary": summary,
            }
        )

    except Exception as e:
        print("AI interview error:", e)
        try:
            print("Response raw:", response.text)
        except Exception:
            pass

        fallback_finished = (turn + 1) >= max_turns
        fallback_next = (
            "" if fallback_finished else f"Can you expand on: {prev_question or 'your last point'}?"
        )
        fallback_score = 70
        return (
            jsonify(
                {
                    "next_question": fallback_next,
                    "finished": fallback_finished,
                    "score": fallback_score,
                    "feedback": "Temporary fallback feedback (AI error).",
                    "summary": "",
                }
            ),
            200,
        )


if __name__ == "__main__":
    app.run(debug=True, port=5002)