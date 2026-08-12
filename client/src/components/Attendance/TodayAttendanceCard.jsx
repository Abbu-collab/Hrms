import { FiClock, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

function TodayAttendanceCard({ attendance }) {
  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatWorkingHours = (hours) => {
    if (hours === undefined || hours === null) return "—";
    const totalMinutes = Math.round(hours * 60);
    const hrs  = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Present":       return "att-badge att-badge-present";
      case "Late":          return "att-badge att-badge-late";
      case "Half Day":       return "att-badge att-badge-halfday";
      case "Early Checkout": return "att-badge att-badge-early";
      default:               return "att-badge att-badge-default";
    }
  };

  return (
    <div className="today-att-card">
      <h2 className="today-att-title">Today's Attendance</h2>

      <div className="today-att-grid">
        <div className="today-att-item">
          <span className="today-att-label">Status</span>
          <div>
            <span className={getStatusBadgeClass(attendance?.status)}>
              {attendance?.status || "Not Checked In"}
            </span>
          </div>
        </div>

        <div className="today-att-item">
          <span className="today-att-label">Check In</span>
          <span className="today-att-value">
            {formatDateTime(attendance?.checkIn)}
          </span>
        </div>

        <div className="today-att-item">
          <span className="today-att-label">Check Out</span>
          <span className="today-att-value">
            {formatDateTime(attendance?.checkOut)}
          </span>
        </div>

        <div className="today-att-item">
          <span className="today-att-label">Working Hours</span>
          <span className="today-att-value">
            {formatWorkingHours(attendance?.workingHours)}
          </span>
        </div>
      </div>

      {attendance?.remarks && (
        <div className="today-att-item" style={{ marginTop: 4 }}>
          <span className="today-att-label">Remarks</span>
          <span className="today-att-value" style={{ fontWeight: 500, fontSize: "0.85rem" }}>
            {attendance.remarks}
          </span>
        </div>
      )}
    </div>
  );
}

export default TodayAttendanceCard;