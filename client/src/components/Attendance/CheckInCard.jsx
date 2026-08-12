import { useEffect, useState } from "react";
import { checkIn, checkOut } from "../../services/attendanceService";
import {
  FiLogIn, FiLogOut, FiClock, FiCheckCircle, FiAlertCircle,
  FiMapPin, FiCalendar,
} from "react-icons/fi";

function CheckInCard({ attendance, setTodayAttendance, loadAttendanceData }) {
  const [isCheckedIn, setIsCheckedIn]       = useState(false);
  const [isCheckedOut, setIsCheckedOut]     = useState(false);
  const [checkInTime, setCheckInTime]       = useState(null);
  const [checkOutTime, setCheckOutTime]     = useState(null);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [loading, setLoading]               = useState(false);
  const [message, setMessage]               = useState({ type: "", text: "" });

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

      {/* Action Buttons */}
      <div className="checkin-actions">
        <button
          id="checkin-btn"
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
          <span>{loading && !isCheckedIn ? "Checking In…" : "Check In"}</span>
        </button>

        <button
          id="checkout-btn"
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
          <span>{loading && isCheckedIn ? "Checking Out…" : "Check Out"}</span>
        </button>
      </div>

      {/* Status indicator */}
      <div className="checkin-status-row">
        <div className={`checkin-status-dot ${isCheckedIn ? "dot-active" : isCheckedOut ? "dot-done" : "dot-idle"}`} />
        <span className="checkin-status-text">
          {isCheckedOut
            ? "Day completed — Checked out"
            : isCheckedIn
            ? "Currently checked in"
            : "Not yet checked in"}
        </span>
      </div>
    </div>
  );
}

export default CheckInCard;