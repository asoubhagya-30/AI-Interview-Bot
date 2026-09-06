import express from "express";
import admin from "../firebase/admin.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Save / replace resume keywords
 */
router.post("/save-keywords", async (req, res) => {
  try {
    // 1️⃣ Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const firebaseUid = decodedToken.uid;
    const { keywords } = req.body;

    if (!Array.isArray(keywords)) {
      return res.status(400).json({ error: "Keywords must be an array" });
    }

    // 2️⃣ Update resume keywords (REPLACE old)
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        resume: {
          keywords,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Resume keywords saved successfully",
      resume: user.resume,
    });
  } catch (err) {
    console.error("Save keywords error:", err);
    res.status(500).json({ error: "Failed to save keywords" });
  }
});

export default router;
