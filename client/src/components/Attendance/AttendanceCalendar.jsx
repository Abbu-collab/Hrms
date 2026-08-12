import { useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function AttendanceCalendar({ calendarAttendance = [], approvedLeaves = [] }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear]   = useState(currentDate.getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = [];
  for (let i = currentDate.getFullYear() - 3; i <= currentDate.getFullYear() + 3; i++) {
    years.push(i);
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay  = new Date(selectedYear, selectedMonth, 1).getDay();

  // Map attendance records
  const records = {};
  calendarAttendance.forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
      records[date.getDate()] = item.status;
    }
  });

  // Overlay approved leaves onto the calendar for the selected month/year
  approvedLeaves.forEach((leave) => {
    if (leave.status !== "Approved") return;
    if (!leave.startDate || !leave.endDate) return;

    const start = new Date(leave.startDate);
    const end   = new Date(leave.endDate);

    const cur  = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (isNaN(cur.getTime()) || isNaN(last.getTime()) || cur > last) return;

    while (cur <= last) {
      if (cur.getFullYear() === selectedYear && cur.getMonth() === selectedMonth) {
        const dayNum = cur.getDate();
        // If not already marked present/late, overlay Leave
        if (!records[dayNum]) {
          records[dayNum] = "Leave";
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= totalDays; i++) cells.push(i);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", label: "Present" };
      case "Half Day":
        return { bg: "#fef3c7", color: "#b45309", border: "#fde68a", label: "Half Day" };
      case "Late":
        return { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", label: "Late" };
      case "Early Checkout":
        return { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff", label: "Early Out" };
      case "Leave":
        return { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", label: "Leave" };
      default:
        return null;
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div className="att-calendar-card">
      <div className="att-cal-header">
        <div className="att-cal-title-box">
          <h2 className="att-cal-title">
            <FiCalendar size={18} /> Attendance & Leave Calendar
          </h2>
          <p className="att-cal-subtitle">Monthly overview of check-ins and approved leaves.</p>
        </div>

        <div className="att-cal-controls">
          <button type="button" className="att-cal-nav-btn" onClick={handlePrevMonth} title="Previous Month">
            <FiChevronLeft size={16} />
          </button>

          <select
            className="att-cal-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            className="att-cal-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button type="button" className="att-cal-nav-btn" onClick={handleNextMonth} title="Next Month">
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="att-cal-grid">
        {days.map((day) => (
          <div key={day} className="att-cal-day-header">
            {day}
          </div>
        ))}

        {/* Date cells */}
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="att-cal-cell empty" />;
          }

          const status = records[day];
          const badge = getStatusBadge(status);
          const isToday =
            day === currentDate.getDate() &&
            selectedMonth === currentDate.getMonth() &&
            selectedYear === currentDate.getFullYear();

          return (
            <div
              key={`day-${day}`}
              className={`att-cal-cell ${isToday ? "today" : ""} ${status ? "has-status" : ""}`}
            >
              <span className="att-cal-day-num">{day}</span>
              {badge && (
                <span
                  className="att-cal-status-pill"
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    borderColor: badge.border,
                  }}
                >
                  {badge.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="att-cal-legend">
        <span className="legend-item"><span className="legend-dot present" /> Present</span>
        <span className="legend-item"><span className="legend-dot late" /> Late</span>
        <span className="legend-item"><span className="legend-dot halfday" /> Half Day</span>
        <span className="legend-item"><span className="legend-dot early" /> Early Checkout</span>
        <span className="legend-item"><span className="legend-dot leave" /> Leave</span>
      </div>
    </div>
  );
}

export default AttendanceCalendar;