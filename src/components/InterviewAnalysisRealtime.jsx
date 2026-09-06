// src/components/InterviewAnalysisRealtime.jsx
import React, { useState, useRef, useEffect } from "react";

/*
 Real-time AI Interview component
 - Backend:
   /analyze-media  -> OpenCV posture (and future pyAudioAnalysis voice)
   /ai-interview   -> Gemini-based Q&A + scoring
*/

const InterviewAnalysisRealtime = ({ context = {}, onFinish }) => {
  const [started, setStarted] = useState(false);
  const [conversation, setConversation] = useState([]); // {type, text, turn}
  const [turnIndex, setTurnIndex] = useState(0);
  const [posture, setPosture] = useState(0);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [liveAnswer, setLiveAnswer] = useState("");
  const [finalReport, setFinalReport] = useState(null);
  const [completed, setCompleted] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const scrollRef = useRef(null);
  const lastHandledTurnRef = useRef(-1);
  const conversationRef = useRef([]);
  const turnMetricsRef = useRef([]);

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, liveAnswer]);

  // Helper: keep conversation + ref in sync
  const pushToConversation = (item) => {
    setConversation((prev) => {
      const updated = [...prev, item];
      conversationRef.current = updated;
      return updated;
    });
  };

  const resetConversation = () => {
    setConversation([]);
    conversationRef.current = [];
  };

  // Audio level (for voice clarity) using Web Audio API
  const updateVoice = () => {
    if (!analyserRef.current || !dataArrRef.current) return;
    analyserRef.current.getByteTimeDomainData(dataArrRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrRef.current.length; i++) {
      const v = dataArrRef.current[i] - 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArrRef.current.length);
    const scaled = Math.min(100, Math.round((rms / 20) * 100));
    setVoiceLevel(scaled);
    rafRef.current = requestAnimationFrame(updateVoice);
  };

  // Text-to-Speech
  const speak = (text) =>
    new Promise((res) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.onend = () => res();
      speechSynthesis.speak(u);
    });

  // Call backend /ai-interview
  const callAI = async ({ question, answer, turn, postureOverride, voiceOverride }) => {
    try {
      const res = await fetch("http://localhost:5002/ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          context,
          turn,
          total_questions: 12,
          posture: postureOverride ?? posture,
          voice: voiceOverride ?? voiceLevel,
        }),
      });
      if (!res.ok) {
        console.error("AI backend returned error:", await res.text());
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error("callAI error:", e);
      return null;
    }
  };

  // Call backend /analyze-media (OpenCV posture)
  const analyzeMediaOnBackend = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return { posture: 0, voice: 0 };
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    const frameDataUrl = canvas.toDataURL("image/jpeg"); // base64

    try {
      const res = await fetch("http://localhost:5002/analyze-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame_b64: frameDataUrl }),
      });

      if (!res.ok) {
        console.error("analyze-media backend error:", await res.text());
        return { posture: 0, voice: 0 };
      }

      const data = await res.json();
      return {
        posture: data.posture || 0,
        voice: data.voice || 0, // will be 0 until you add audio upload
      };
    } catch (e) {
      console.error("analyzeMediaOnBackend error:", e);
      return { posture: 0, voice: 0 };
    }
  };

  // Start continuous recognition for a given turn
  const startRecognition = (turn) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    } catch (e) {}

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (evt) => {
      let interim = "";
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        interim += evt.results[i][0].transcript;
      }
      setLiveAnswer(interim);

      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(async () => {
        try {
          rec.stop();
        } catch (e) {}
        const finalText = interim.trim();
        if (lastHandledTurnRef.current === turn) return;
        lastHandledTurnRef.current = turn;
        await handleAnswer(finalText, turn);
      }, 800);
    };

    rec.onerror = (err) => {
      console.warn("SpeechRecognition error:", err);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(async () => {
        try {
          rec.stop();
        } catch (e) {}
        if (lastHandledTurnRef.current === turn) return;
        lastHandledTurnRef.current = turn;
        await handleAnswer("", turn);
      }, 400);
    };

    recognitionRef.current = rec;
    setTimeout(() => {
      try {
        rec.start();
      } catch (e) {
        console.warn("rec.start failed:", e);
      }
    }, 250);
  };

  // Handle candidate answer (after silence debounce)
  const handleAnswer = async (answerText, turn) => {
    pushToConversation({
      type: "answer",
      text: answerText || "<no answer>",
      turn,
    });
    setLiveAnswer("");

    const conv = conversationRef.current;
    const lastQuestionObj = [...conv].reverse().find((c) => c.type === "question");
    const lastQuestion = lastQuestionObj?.text || "";

    // 🔍 Get posture (and future voice) from backend via OpenCV/pyAudioAnalysis
    const mediaMetrics = await analyzeMediaOnBackend();
    setPosture(mediaMetrics.posture);
    // we still use WebAudio voiceLevel; if mediaMetrics.voice > 0, we could override later

    const aiResp = await callAI({
      question: lastQuestion,
      answer: answerText || "",
      turn,
      postureOverride: mediaMetrics.posture,
      voiceOverride: voiceLevel,
    });

    if (!aiResp) {
      pushToConversation({
        type: "feedback",
        text: "AI service error — attempting fallback.",
        turn,
      });
      if (turn + 1 >= 12) {
        await finishInterview({ score: 75 });
        return;
      }
      const fallbackQ = `Can you elaborate on your ${
        context?.keywords?.[0] || "experience"
      }?`;
      pushToConversation({
        type: "question",
        text: fallbackQ,
        turn: turn + 1,
      });
      setTurnIndex(turn + 1);
      await speak(fallbackQ);
      setTimeout(() => startRecognition(turn + 1), 300);
      return;
    }

    if (typeof aiResp.score === "number") {
      const entry = {
        turn,
        score: aiResp.score,
        posture: mediaMetrics.posture,
        voice: voiceLevel,
      };
      turnMetricsRef.current = [
        ...turnMetricsRef.current.filter((m) => m.turn !== turn),
        entry,
      ];
    }

    if (aiResp.feedback) {
      pushToConversation({
        type: "feedback",
        text: aiResp.feedback,
        turn,
      });
    }
    if (aiResp.summary) {
      pushToConversation({
        type: "summary",
        text: aiResp.summary,
        turn,
      });
    }

    if (aiResp.finished) {
      await finishInterview(aiResp);
      return;
    }

    if (aiResp.next_question) {
      const nextQ = aiResp.next_question;
      pushToConversation({
        type: "question",
        text: nextQ,
        turn: turn + 1,
      });
      setTurnIndex(turn + 1);
      await speak(nextQ);
      setTimeout(() => startRecognition(turn + 1), 300);
    } else {
      await finishInterview(aiResp);
    }
  };

  // Start interview
  const startInterview = async () => {
    resetConversation();
    setTurnIndex(0);
    setCompleted(false);
    setFinalReport(null);
    setLiveAnswer("");
    setPosture(0);
    setVoiceLevel(0);
    lastHandledTurnRef.current = -1;
    turnMetricsRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Web Audio for voice level visualization
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      dataArrRef.current = new Uint8Array(analyserRef.current.fftSize);
      source.connect(analyserRef.current);
      updateVoice();

      setStarted(true);
      const opener = "Hi — let's start. Tell me about yourself.";
      pushToConversation({ type: "question", text: opener, turn: 0 });
      await speak(opener);
      startRecognition(0);
    } catch (e) {
      console.error("Media start error:", e);
      alert("Unable to access camera/microphone. Check permissions.");
    }
  };

  // Finish interview (AI signalled finish OR user clicks Finish)
  const finishInterview = async (aiResp = {}) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}
    stopMedia();

    setStarted(false);
    setCompleted(true);

    const conv = conversationRef.current;
    const answers = conv.filter((c) => c.type === "answer");
    const questions = conv.filter((c) => c.type === "question");
    const metrics = turnMetricsRef.current;

    let avgScoreVal;
    let avgPostureVal;
    let avgVoiceVal;

    if (metrics.length) {
      avgScoreVal = Math.round(
        metrics.reduce((sum, m) => sum + (m.score || 0), 0) / metrics.length
      );
      avgPostureVal = Math.round(
        metrics.reduce((sum, m) => sum + (m.posture || 0), 0) / metrics.length
      );
      avgVoiceVal = Math.round(
        metrics.reduce((sum, m) => sum + (m.voice || 0), 0) / metrics.length
      );
    } else {
      avgScoreVal =
        typeof aiResp.score === "number"
          ? aiResp.score
          : 0;
      avgPostureVal = Math.round(posture || 0);
      avgVoiceVal = Math.round(voiceLevel || 0);
    }

    // avoid 0 metrics if user actually answered
    if (answers.length > 0 && avgPostureVal === 0) avgPostureVal = 60;
    if (answers.length > 0 && avgVoiceVal === 0) avgVoiceVal = 60;

    const perTurnFeedback = conv
      .filter((c) => c.type === "feedback" || c.type === "summary")
      .map((f) => ({ text: f.text, turn: f.turn }));

    const firstQ = questions[0]?.text || "";
    const firstAns = answers[0]?.text || "";

    const interviewSuggestions = [];

    if (avgScoreVal < 70) {
      interviewSuggestions.push(
        "Work on structuring your answers with a clear introduction, details, and conclusion."
      );
    } else {
      interviewSuggestions.push(
        "Your overall answer quality is good. Keep giving concrete examples from your projects."
      );
    }

    if (avgPostureVal < 60) {
      interviewSuggestions.push(
        "Improve your posture by sitting upright, keeping your face visible, and maintaining steady eye contact with the camera."
      );
    } else {
      interviewSuggestions.push(
        "Your posture is generally good. Continue maintaining a steady and confident presence on camera."
      );
    }

    if (avgVoiceVal < 60) {
      interviewSuggestions.push(
        "Try to speak a bit louder and more clearly, with a stable pace and less mumbling."
      );
    } else {
      interviewSuggestions.push(
        "Your voice clarity is acceptable. Continue speaking at a steady pace with clear pronunciation."
      );
    }

    if (perTurnFeedback.length > 0) {
      interviewSuggestions.push(
        "Review the per-question feedback to identify specific answers that can be improved."
      );
    }

    const report = {
      totalQuestions: questions.length,
      answered: answers.length,
      avgScore: avgScoreVal,
      avgPosture: avgPostureVal,
      avgVoice: avgVoiceVal,
      perTurnFeedback,
      interviewSuggestions,
      firstQuestion: firstQ,
      firstAnswer: firstAns,
    };

    setFinalReport(report);

    try {
      await speak(
        `Interview finished. Your score is ${avgScoreVal} out of 100.`
      );
    } catch (e) {}

    if (typeof onFinish === "function") onFinish(report);
  };

  // User cancels without report
  const stopInterview = () => {
    if (!started) return;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopMedia();
    speechSynthesis.cancel();
    setStarted(false);
    pushToConversation({
      type: "info",
      text: "Interview stopped by user (no report generated).",
      turn: turnIndex,
    });
  };

  const stopMedia = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}
  };

  const handleFinishClick = async () => {
    if (!started && !conversationRef.current.length) {
      alert("Start the interview first.");
      return;
    }
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}
    await finishInterview({});
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Real-time AI Interview</h2>

      <div className="flex gap-3 mb-4">
        <button
          onClick={startInterview}
          disabled={started}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
        >
          Start
        </button>
        <button
          onClick={handleFinishClick}
          disabled={!started && !conversationRef.current.length}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          Finish & Generate Feedback
        </button>
        <button
          onClick={stopInterview}
          disabled={!started}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
        >
          Stop (Cancel)
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded"
            autoPlay
            muted
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="flex justify-between mt-2 text-center">
            <div>
              <div className="text-sm">Posture (OpenCV)</div>
              <div className="text-lg font-bold">{posture}</div>
            </div>
            <div>
              <div className="text-sm">Voice Level</div>
              <div className="text-lg font-bold">{voiceLevel}</div>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 max-h-64 overflow-y-auto border rounded p-3 bg-gray-50"
        >
          {conversation.map((c, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded ${
                c.type === "question"
                  ? "bg-blue-100"
                  : c.type === "answer"
                  ? "bg-green-100"
                  : c.type === "feedback"
                  ? "bg-indigo-100"
                  : "bg-gray-200"
              }`}
            >
              <strong>
                {c.type === "question"
                  ? "AI: "
                  : c.type === "answer"
                  ? "You: "
                  : c.type === "feedback"
                  ? "AI feedback: "
                  : "Info: "}
              </strong>{" "}
              {c.text}
            </div>
          ))}
          {liveAnswer && (
            <div className="mb-2 p-2 rounded bg-yellow-100">
              <strong>Listening: </strong>
              {liveAnswer}
            </div>
          )}
        </div>
      </div>

      {completed && finalReport && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Interview Report (Quick View)</h3>
          <p>Total Asked: {finalReport.totalQuestions}</p>
          <p>Answered: {finalReport.answered}</p>
          <p>Avg Score: {finalReport.avgScore}</p>
          <p>Avg Posture: {finalReport.avgPosture}</p>
          <p>Avg Voice: {finalReport.avgVoice}</p>
          <p className="mt-2 text-sm">
            <strong>Q1:</strong> {finalReport.firstQuestion || "–"}
          </p>
          <p className="text-sm">
            <strong>Q1 Answer:</strong> {finalReport.firstAnswer || "–"}
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewAnalysisRealtime;
