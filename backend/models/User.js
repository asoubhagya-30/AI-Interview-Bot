import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔑 Firebase UID (single identity)
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      required: true,
    },

    provider: {
      type: String, // password | google
    },

    // ✅ Resume-related data (kept as requested)
    resume: {
      keywords: {
        type: [String],
        default: [],
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
