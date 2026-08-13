import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";

import route from "./routes/UserRoute.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import leaveBalanceRoutes from "./routes/leaveBalanceRoutes.js";
import payslipRoutes from "./routes/payslipRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";

const app = express();

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hrms-gamma-navy.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // Example: Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Remove trailing slash if present
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error(
        `CORS blocked request from origin: ${origin}`
      );

      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed`)
      );
    },

    credentials: true,
  })
);

/* =========================================================
   GLOBAL MIDDLEWARE
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================================================
   DATABASE CONNECTION
========================================================= */

connectDB();

/* =========================================================
   ROOT / HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRMS API Server is Running",
  });
});

/* =========================================================
   API ROUTES
========================================================= */

// Authentication / User
app.use("/api", route);

// Department Management
app.use("/api/departments", departmentRoutes);

// Role Management
app.use("/api/roles", roleRoutes);

// Employee Management
app.use("/api/employees", employeeRoutes);

// Attendance Management
app.use("/api/attendance", attendanceRoutes);

// Leave Management
app.use("/api/leave", leaveRoutes);

// Leave Balance
app.use("/api/leave-balance", leaveBalanceRoutes);

// Payslip Management
app.use("/api/payslips", payslipRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// Salary Management
app.use("/api/salaries", salaryRoutes);

// Payroll Management
app.use("/api/payrolls", payrollRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use(notFoundHandler);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HRMS Server running on port ${PORT}`);
});