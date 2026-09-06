import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-CD0s_hG0CY1_vdJ3v1SzK9LF6_Ed2dc",
  authDomain: "ai-interview-bot-d090f.firebaseapp.com",
  projectId: "ai-interview-bot-d090f",
  storageBucket: "ai-interview-bot-d090f.firebasestorage.app",
  messagingSenderId: "626259038600",
  appId: "1:626259038600:web:6a1fc790e048818a886a3d",
  measurementId: "G-5PWCVXKYTV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;