import mongoose from "mongoose";

const biometricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
      unique: true,
      index: true,
    },

    faceEmbedding: {
      type: [Number],
      required: true,
      select: false, // Hidden by default for privacy
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    lastVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Biometric = mongoose.model("Biometric", biometricSchema);

export default Biometric;
