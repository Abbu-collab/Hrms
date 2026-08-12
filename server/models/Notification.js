import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },

    type: {
      type: String,
      enum: ["leave_applied", "leave_approved", "leave_rejected", "leave_cancelled", "general"],
      default: "general",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    relatedLeave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
