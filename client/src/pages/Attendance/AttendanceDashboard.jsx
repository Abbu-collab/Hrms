import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/permission";

import CheckInCard from "../../components/Attendance/CheckInCard";
import TodayAttendanceCard from "../../components/Attendance/TodayAttendanceCard";
import AttendanceHistory from "../../components/Attendance/AttendanceHistory";
import MonthlyAttendance from "../../components/Attendance/MonthlyAttendance";
import AttendanceCalendar from "../../components/Attendance/AttendanceCalendar";
import AdminAttendanceMonitor from "../../components/Attendance/AdminAttendanceMonitor";

import {
  getTodayAttendance,
  getAttendanceHistory,
  getMonthlyAttendance,
  getAttendanceCalendar,
  getAllAttendanceAdmin,
} from "../../services/attendanceService";
import { getLeaveHistory as getOwnLeaves } from "../../services/leaveService";

import "./AttendanceDashboard.css";

function AttendanceDashboard() {
  const { user } = useAuth();
  const normRole   = normalizeRole(user?.role);
  const isAdmin    = normRole === "admin";
  const isHR       = normRole === "hr_manager";
  const isEmployee = normRole === "employee";

  // HR Manager gets both personal check-in view AND org monitoring
  const isAdminOrHR = isAdmin || isHR;

  const [currentTime, setCurrentTime] = useState(new Date());

  // Personal attendance state (Employee + HR)
  const [todayAttendance,   setTodayAttendance]   = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [calendarAttendance, setCalendarAttendance] = useState([]);
  const [approvedLeaves, setApprovedLeaves]       = useState([]);

  // Admin monitoring state
  const [adminRecords,      setAdminRecords]      = useState([]);
  const [adminLoading,      setAdminLoading]      = useState(false);
  const [adminError,        setAdminError]        = useState(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── PERSONAL attendance loader (Employee + HR) ───────────────────────────
  const loadAttendanceData = useCallback(async () => {
    try {
      const today = new Date();
      const year  = today.getFullYear();
      const month = today.getMonth() + 1;

      const [todayData, historyData, monthlyData, calendarData, ownLeaveRes] =
        await Promise.all([
          getTodayAttendance(),
          getAttendanceHistory(),
          getMonthlyAttendance(year, month),
          getAttendanceCalendar(year, month),
          getOwnLeaves().catch(() => ({ leaves: [] })),
        ]);

      setTodayAttendance(todayData?.data || null);
      setAttendanceHistory(historyData?.data || []);
      setMonthlyAttendance(monthlyData?.data || []);
      setCalendarAttendance(
        calendarData?.calendar || calendarData?.data || []
      );
      setApprovedLeaves(
        (ownLeaveRes?.leaves || []).filter((l) => l.status === "Approved")
      );
    } catch (error) {
      console.error("Failed to load personal attendance:", error);
    }
  }, []);

  // ── ADMIN monitoring loader ───────────────────────────────────────────────
  const loadAdminAttendance = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await getAllAttendanceAdmin();
      const rawRecords = res?.data || [];
      // Admin monitors HR Managers + Employees (exclude Admin's own records)
      const filtered = rawRecords.filter(
        (r) => normalizeRole(r.employee?.role) !== "admin"
      );
      setAdminRecords(filtered);
    } catch (error) {
      console.error("Failed to load admin attendance:", error);
      setAdminError(
        error?.response?.data?.message || "Failed to load attendance records."
      );
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      // Admin strictly monitors org-wide attendance (no personal check-in/out calls)
      loadAdminAttendance();
    } else if (isHR) {
      // HR Manager: personal check-in/history + org monitoring
      loadAttendanceData();
      loadAdminAttendance();
    } else {
      // Employee: personal attendance only
      loadAttendanceData();
    }
  }, [isAdmin, isHR, loadAdminAttendance, loadAttendanceData]);

  // ── HERO HEADER ─────────────────────────────────────────────────────────
  const heroTitle = isEmployee ? "Attendance Dashboard" : "Attendance Management";
  const heroSubtitle = isAdmin
    ? "Monitor organization-wide attendance and employee working hours."
    : isEmployee
    ? "Track check-in times, work duration, monthly logs, and attendance history."
    : "Track your personal attendance and monitor organisation-wide attendance records.";

  return (
    <div className="attendance-page">
      {/* Hero Header & Live Clock */}
      <div className="attendance-hero-card">
        <div className="attendance-hero-info">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>

        <div className="attendance-clock-widget">
          <div className="clock-item">
            <span className="clock-label">Current Date</span>
            <span className="clock-value">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="clock-divider" />

          <div className="clock-item">
            <span className="clock-label">Live Time</span>
            <span className="clock-value">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── ADMIN VIEW: ONLY ORGANIZATION-WIDE MONITORING ─────────────────── */}
      {isAdmin && (
        <AdminAttendanceMonitor
          records={adminRecords}
          loading={adminLoading}
          error={adminError}
          onRefresh={loadAdminAttendance}
        />
      )}

      {/* ── HR MANAGER & EMPLOYEE VIEW: PERSONAL ATTENDANCE GRID ─────────── */}
      {!isAdmin && (
        <div className="attendance-grid-layout">
          <div className="col-span-6">
            <div className="attendance-section-box">
              <CheckInCard
                attendance={todayAttendance}
                setTodayAttendance={setTodayAttendance}
                loadAttendanceData={loadAttendanceData}
              />
            </div>
          </div>

          <div className="col-span-6">
            <div className="attendance-section-box">
              <TodayAttendanceCard attendance={todayAttendance} />
            </div>
          </div>

          <div className="col-span-12">
            <div className="attendance-section-box">
              <AttendanceCalendar
                calendarAttendance={calendarAttendance}
                approvedLeaves={approvedLeaves}
              />
            </div>
          </div>

          <div className="col-span-12">
            <div className="attendance-section-box">
              <AttendanceHistory history={attendanceHistory} />
            </div>
          </div>

          <div className="col-span-12">
            <div className="attendance-section-box">
              <MonthlyAttendance monthlyAttendance={monthlyAttendance} />
            </div>
          </div>
        </div>
      )}

      {/* ── HR MANAGER ORG MONITORING SECTION ───────────────────────────────── */}
      {isHR && (
        <AdminAttendanceMonitor
          records={adminRecords}
          loading={adminLoading}
          error={adminError}
          onRefresh={loadAdminAttendance}
        />
      )}
    </div>
  );
}

export default AttendanceDashboard;