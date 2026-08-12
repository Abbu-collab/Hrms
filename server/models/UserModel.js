import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      minlength: 8,
      match: [
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one number, and one special character",
      ],
    },

    role: {
      type: String,
      default: "Employee",
    },

    phone: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "General",
    },

    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employees", UserSchema);