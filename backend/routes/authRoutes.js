import express from "express";
import admin from "../firebase/admin.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Firebase login / signup
 */
router.post("/firebase-login", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    const {
      uid: firebaseUid,
      email,
      firebase,
    } = decodedToken;

    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // ✅ Find or create user safely
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        firebaseUid,
        email,
        role,
        provider: firebase?.sign_in_provider || "password",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: "User authenticated successfully",
      user,
    });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
