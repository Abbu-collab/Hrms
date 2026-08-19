import { useEffect, useState, useCallback } from "react";
import { checkIn, checkOut } from "../../services/attendanceService";
import { getBiometricStatus } from "../../services/biometricService";
import BiometricModal from "../Biometric/BiometricModal";
import BiometricEnrollmentModal from "../Biometric/BiometricEnrollmentModal";
import {
  FiLogIn, FiLogOut, FiClock, FiCheckCircle, FiAlertCircle,
  FiCalendar, FiSmile, FiUserCheck, FiShield,
} from "react-icons/fi";

function CheckInCard({ attendance, setTodayAttendance, loadAttendanceData }) {
  const [isCheckedIn, setIsCheckedIn]       = useState(false);
  const [isCheckedOut, setIsCheckedOut]     = useState(false);
  const [checkInTime, setCheckInTime]       = useState(null);
  const [checkOutTime, setCheckOutTime]     = useState(null);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [loading, setLoading]               = useState(false);
  const [message, setMessage]               = useState({ type: "", text: "" });

  // Biometric state
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricAction, setBiometricAction] = useState("check-in");
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

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await checkIn({ remarks: "Checked in on time" });
      setTodayAttendance(response.data);
      await loadAttendanceData();
      setMessage({ type: "success", text: "Check In successful! Have a productive day." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Check In failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await checkOut();
      setTodayAttendance(response.data);
      await loadAttendanceData();
      setMessage({ type: "success", text: "Check Out successful! See you tomorrow." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Check Out failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFaceModal = (action) => {
    if (!isFaceRegistered) {
      setMessage({
        type: "error",
        text: "Your face is not registered yet. Please register your face first.",
      });
      setEnrollmentModalOpen(true);
      return;
    }
    setBiometricAction(action);
    setBiometricModalOpen(true);
  };

  const handleBiometricSuccess = async (updatedAttendance) => {
    if (updatedAttendance) {
      setTodayAttendance(updatedAttendance);
    }
    await loadAttendanceData();
    setMessage({
      type: "success",
      text: `Face ${biometricAction === "check-in" ? "Check In" : "Check Out"} successful!`,
    });
  };

  const handleEnrolled = async () => {
    await loadBiometricStatus();
    setMessage({
      type: "success",
      text: "Face registered successfully! You can now use Face Attendance.",
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
          <h2 className="checkin-title">Attendance</h2>
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

      {/* Face Biometric Primary Buttons */}
      <div className="checkin-actions" style={{ marginBottom: "10px" }}>
        <button
          id="face-checkin-btn"
          type="button"
          className={`checkin-btn checkin-btn-in ${isCheckedIn || isCheckedOut ? "checkin-btn-disabled" : ""}`}
          style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#fff", border: "none" }}
          onClick={() => handleOpenFaceModal("check-in")}
          disabled={loading || isCheckedIn || isCheckedOut}
          title="Live Face Attendance Check In"
        >
          <FiSmile size={18} />
          <span>Face Check In</span>
        </button>

        <button
          id="face-checkout-btn"
          type="button"
          className={`checkin-btn checkin-btn-out ${!isCheckedIn ? "checkin-btn-disabled" : ""}`}
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)", color: "#fff", border: "none" }}
          onClick={() => handleOpenFaceModal("check-out")}
          disabled={loading || !isCheckedIn}
          title="Live Face Attendance Check Out"
        >
          <FiSmile size={18} />
          <span>Face Check Out</span>
        </button>
      </div>

      {/* Standard Action Buttons */}
      <div className="checkin-actions">
        <button
          id="checkin-btn"
          type="button"
          className={`checkin-btn checkin-btn-in ${isCheckedIn || isCheckedOut ? "checkin-btn-disabled" : ""}`}
          onClick={handleCheckIn}
          disabled={loading || isCheckedIn || isCheckedOut}
          title={isCheckedIn ? "Already checked in" : isCheckedOut ? "Already checked out today" : "Check In"}
        >
          {loading && !isCheckedIn ? (
            <span className="checkin-spinner" />
          ) : (
            <FiLogIn size={18} />
          )}
          <span>{loading && !isCheckedIn ? "Checking In…" : "Manual Check In"}</span>
        </button>

        <button
          id="checkout-btn"
          type="button"
          className={`checkin-btn checkin-btn-out ${!isCheckedIn ? "checkin-btn-disabled" : ""}`}
          onClick={handleCheckOut}
          disabled={loading || !isCheckedIn}
          title={!isCheckedIn ? "Check in first" : "Check Out"}
        >
          {loading && isCheckedIn ? (
            <span className="checkin-spinner" />
          ) : (
            <FiLogOut size={18} />
          )}
          <span>{loading && isCheckedIn ? "Checking Out…" : "Manual Check Out"}</span>
        </button>
      </div>

      {/* Status & Enrollment Bar */}
      <div className="checkin-status-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        <button
          type="button"
          onClick={() => setEnrollmentModalOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: isFaceRegistered ? "#0284c7" : "#e11d48",
            fontSize: "0.8rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FiUserCheck size={14} />
          {isFaceRegistered ? "Face Registered ✓" : "Register Face"}
        </button>
      </div>

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={biometricModalOpen}
        onClose={() => setBiometricModalOpen(false)}
        actionType={biometricAction}
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