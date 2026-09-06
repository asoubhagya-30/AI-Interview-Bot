import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// 🔥 Firebase imports
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ✅ Auth Context
import { useAuth } from "../context/AuthContext";

/* ---------------- CAPTCHA HELPER ---------------- */
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
/* ------------------------------------------------ */

const AuthForm = ({ type = "login", role = "Candidate" }) => {
  const [isLogin, setIsLogin] = useState(type === "login");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ IMPORTANT

  /* ---------------- SUBMIT HANDLER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setCaptchaError("");

    // Email validation (signup only)
    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }
    }

    // CAPTCHA validation
    if (captchaInput !== captcha) {
      setCaptchaError("CAPTCHA is incorrect");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    // Password match check
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // 🌐 Backend sync
      const response = await fetch(
        "http://localhost:5003/api/auth/firebase-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role: role.toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to authenticate");
        return;
      }

      // ✅ STORE USER IN CONTEXT
      login({
        role: role.toLowerCase(),
        email: firebaseUser.email,
      });

      // ✅ Redirect
      if (role.toLowerCase() === "candidate") {
        navigate("/candidate/dashboard");
      } else {
        navigate("/recruiter/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert(err.message || "Authentication failed");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(
        "http://localhost:5003/api/auth/firebase-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role: role.toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Google login failed");
        return;
      }

      // ✅ STORE USER IN CONTEXT
      login({
        role: role.toLowerCase(),
        email: firebaseUser.email,
      });

      if (role.toLowerCase() === "candidate") {
        navigate("/candidate/dashboard");
      } else {
        navigate("/recruiter/dashboard");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.message);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-24">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? `Login as ${role}` : `Sign Up as ${role}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded border"
          />
          {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded border"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded border"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}

          {/* CAPTCHA */}
          <div>
            <div className="flex justify-between bg-gray-200 px-3 py-2 rounded font-mono">
              {captcha}
              <button
                type="button"
                onClick={() => setCaptcha(generateCaptcha())}
                className="text-blue-600 text-sm"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full px-4 py-2 rounded border mt-2"
              placeholder="Enter CAPTCHA"
            />
            {captchaError && (
              <p className="text-red-500 text-xs">{captchaError}</p>
            )}
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="my-4 text-center">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <FaGoogle /> Continue with Google
        </button>

        <p
          className="mt-4 text-center text-sm cursor-pointer text-blue-600"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Create an account" : "Already have an account?"}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
