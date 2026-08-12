import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER REFERENCE
    // Links Employee with Team 1 User Account
    // ==========================================
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
      unique: true,
    },

    // ==========================================
    // EMPLOYEE CODE
    // Example: EMP001, EMP002
    // ==========================================
    employee_code: {
      type: String,
      unique: true,
      trim: true,
    },

    // ==========================================
    // DEPARTMENT REFERENCE
    // Links Employee with Department
    // ==========================================
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    // ==========================================
    // EMPLOYEE DESIGNATION
    // Example: Software Developer
    // ==========================================
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // MANAGER REFERENCE
    // Links Employee with another Employee
    // ==========================================
    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    // ==========================================
    // DATE OF JOINING
    // ==========================================
    date_of_joining: {
      type: Date,
      required: true,
    },

    // ==========================================
    // EMPLOYMENT STATUS
    // ==========================================
    employment_status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    collection: "employee_details",
  }
);

// ==========================================
// EMPLOYEE MODEL
// ==========================================
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;