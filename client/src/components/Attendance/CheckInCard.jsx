import { useEffect, useState, useCallback } from "react";
import { getBiometricStatus } from "../../services/biometricService";
import BiometricModal from "../Biometric/BiometricModal";
import BiometricEnrollmentModal from "../Biometric/BiometricEnrollmentModal";
import {
  FiClock, FiCheckCircle, FiAlertCircle,
  FiCalendar, FiSmile, FiUserCheck, FiShield,
} from "react-icons/fi";

function CheckInCard({ attendance, setTodayAttendance, loadAttendanceData }) {
  const [isCheckedIn, setIsCheckedIn]       = useState(false);
  const [isCheckedOut, setIsCheckedOut]     = useState(false);
  const [checkInTime, setCheckInTime]       = useState(null);
  const [checkOutTime, setCheckOutTime]     = useState(null);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [message, setMessage]               = useState({ type: "", text: "" });

  // Biometric state
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);

  const loadBiometricStatus = useCallback(async () => {
    try {
      const res = await getBiometricStatus();
      setIsFaceRegistered(!!res.data?.isRegistered);
    } catch (e) {
      console.warn("Could not fetch biometric status:", e);
    }
  }, []);

  useEffect(() => {
    loadBiometricStatus();
  }, [loadBiometricStatus]);

  // Sync state from backend attendance record
  useEffect(() => {
    if (!attendance) {
      setIsCheckedIn(false);
      setIsCheckedOut(false);
      setCheckInTime(null);
      setCheckOutTime(null);
      setWorkingSeconds(0);
      return;
    }

    if (attendance.checkIn && !attendance.checkOut) {
      setIsCheckedIn(true);
      setIsCheckedOut(false);
      setCheckInTime(new Date(attendance.checkIn));

      const start = new Date(attendance.checkIn);
      const updateTimer = () => {
        setWorkingSeconds(Math.floor((Date.now() - start.getTime()) / 1000));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }

    if (attendance.checkOut) {
      setIsCheckedIn(false);
      setIsCheckedOut(true);
      setCheckInTime(new Date(attendance.checkIn));
      setCheckOutTime(new Date(attendance.checkOut));
      setWorkingSeconds(
        Math.floor((new Date(attendance.checkOut) - new Date(attendance.checkIn)) / 1000)
      );
    }
  }, [attendance]);

  const handleOpenFaceAttendance = () => {
    if (!isFaceRegistered) {
      setMessage({
        type: "error",
        text: "Face registration is required for biometric attendance. Please register your face first.",
      });
      setEnrollmentModalOpen(true);
      return;
    }
    setBiometricModalOpen(true);
  };

  const handleBiometricSuccess = async (result) => {
    if (result?.data) {
      setTodayAttendance(result.data);
    }
    await loadAttendanceData();
    setMessage({
      type: "success",
      text: result?.message || "Biometric Attendance recorded successfully!",
    });
  };

  const handleEnrolled = async () => {
    await loadBiometricStatus();
    setMessage({
      type: "success",
      text: "Face registered successfully! You can now mark your attendance using Face Biometrics.",
    });
  };

  const hours   = Math.floor(workingSeconds / 3600);
  const minutes = Math.floor((workingSeconds % 3600) / 60);
  const seconds = workingSeconds % 60;

  const formatTime = (date) =>
    date
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="checkin-card">
      {/* Card header */}
      <div className="checkin-header">
        <div className="checkin-header-info">
          <h2 className="checkin-title">Face Biometric Attendance</h2>
          <span className="checkin-date">
            <FiCalendar size={13} /> {todayStr}
          </span>
        </div>
        <div className="checkin-shift-badge">
          <FiClock size={13} /> 09:30 AM – 06:00 PM
        </div>
      </div>

      {/* Working timer */}
      <div className="checkin-timer-row">
        <div className="checkin-timer">
          <span className="checkin-timer-label">Working Time</span>
          <span className="checkin-timer-value">
            {String(hours).padStart(2, "0")}:
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="checkin-times">
          <div className="checkin-time-item">
            <span className="checkin-time-label">Check In</span>
            <span className="checkin-time-value">{formatTime(checkInTime)}</span>
          </div>
          <div className="checkin-time-divider" />
          <div className="checkin-time-item">
            <span className="checkin-time-label">Check Out</span>
            <span className="checkin-time-value">{formatTime(checkOutTime)}</span>
          </div>
        </div>
      </div>

      {/* Inline message */}
      {message.text && (
        <div className={`checkin-message checkin-message-${message.type}`}>
          {message.type === "success"
            ? <FiCheckCircle size={14} />
            : <FiAlertCircle size={14} />}
          {message.text}
        </div>
      )}

      {/* Face Biometric Attendance Action */}
      {!isFaceRegistered ? (
        <div className="biometric-not-registered-box" style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ margin: "0 0 10px 0", color: "#be123c", fontWeight: "600", fontSize: "0.9rem" }}>
            Face Registration Required
          </p>
          <p style={{ margin: "0 0 14px 0", color: "#9f1239", fontSize: "0.82rem" }}>
            Biometric attendance is enabled. Please register your face to mark attendance.
          </p>
          <button
            type="button"
            className="emp-btn-primary"
            onClick={() => setEnrollmentModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FiUserCheck size={16} /> Register Face Now
          </button>
        </div>
      ) : (
        <div className="checkin-actions">
          <button
            id="face-attendance-btn"
            type="button"
            className={`checkin-btn checkin-btn-in ${isCheckedOut ? "checkin-btn-disabled" : ""}`}
            style={{
              width: "100%",
              background: isCheckedOut
                ? "#94a3b8"
                : isCheckedIn
                ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
                : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#fff",
              border: "none",
              padding: "14px",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "12px",
            }}
            onClick={handleOpenFaceAttendance}
            disabled={isCheckedOut}
            title={isCheckedOut ? "Today's attendance completed" : "Start Live Face Attendance"}
          >
            <FiSmile size={20} />
            <span>
              {isCheckedOut
                ? "Today's Attendance Completed ✓"
                : isCheckedIn
                ? "Face Check Out"
                : "Face Check In"}
            </span>
          </button>
        </div>
      )}

      {/* Status & Enrollment Bar */}
      <div className="checkin-status-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className={`checkin-status-dot ${isCheckedIn ? "dot-active" : isCheckedOut ? "dot-done" : "dot-idle"}`} />
          <span className="checkin-status-text">
            {isCheckedOut
              ? "Day completed — Checked out"
              : isCheckedIn
              ? "Currently checked in"
              : "Not yet checked in"}
          </span>
        </div>

        {isFaceRegistered && (
          <button
            type="button"
            onClick={() => setEnrollmentModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#0284c7",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FiUserCheck size={14} /> Re-register Face
          </button>
        )}
      </div>

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={biometricModalOpen}
        onClose={() => setBiometricModalOpen(false)}
        onSuccess={handleBiometricSuccess}
      />

      {/* Biometric Enrollment Modal */}
      <BiometricEnrollmentModal
        isOpen={enrollmentModalOpen}
        onClose={() => setEnrollmentModalOpen(false)}
        onEnrolled={handleEnrolled}
      />
    </div>
  );
}

export default CheckInCard;