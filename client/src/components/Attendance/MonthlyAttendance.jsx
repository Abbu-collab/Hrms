import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function MonthlyAttendance({ monthlyAttendance = [] }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString();
  };

  const formatWorkingHours = (hours) => {
    if (hours === undefined || hours === null) {
      return "--";
    }

    const totalMinutes = Math.round(hours * 60);

    const hrs = Math.floor(totalMinutes / 60);

    const mins = totalMinutes % 60;

    return `${hrs} hrs ${mins} mins`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return {
          backgroundColor: "green",
          color: "white",
        };

      case "Late":
        return {
          backgroundColor: "orange",
          color: "white",
        };

      case "Half Day":
        return {
          backgroundColor: "gold",
          color: "black",
        };

      case "Early Checkout":
        return {
          backgroundColor: "purple",
          color: "white",
        };

      default:
        return {
          backgroundColor: "gray",
          color: "white",
        };
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210);
    doc.text("Human Resource Management System", 105, 15, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Monthly Attendance Report", 105, 25, {
      align: "center",
    });

    doc.line(10, 30, 200, 30);

    doc.setFontSize(12);

    doc.text(`Employee Name : ${user?.name || "N/A"}`, 14, 40);

    doc.text(`Email : ${user?.email || "N/A"}`, 14, 48);

    doc.text(`Role : ${user?.role || "Employee"}`, 14, 56);

    doc.text(`Generated On : ${new Date().toLocaleString()}`, 14, 64);

    const present = monthlyAttendance.filter(
      (a) => a.status === "Present",
    ).length;

    const late = monthlyAttendance.filter((a) => a.status === "Late").length;

    const halfDay = monthlyAttendance.filter(
      (a) => a.status === "Half Day",
    ).length;

    const earlyCheckout = monthlyAttendance.filter(
      (a) => a.status === "Early Checkout",
    ).length;

    doc.setFontSize(14);
    doc.text("Attendance Summary", 14, 78);

    doc.setFontSize(12);

    doc.text(`Total Attendance Records : ${monthlyAttendance.length}`, 20, 88);

    doc.text(`Present : ${present}`, 20, 96);

    doc.text(`Late : ${late}`, 20, 104);

    doc.text(`Half Day : ${halfDay}`, 20, 112);

    doc.text(`Early Checkout : ${earlyCheckout}`, 20, 120);

    // Table
    const rows = monthlyAttendance.map((attendance) => {
      const totalMinutes = Math.round(attendance.workingHours * 60);

      const hrs = Math.floor(totalMinutes / 60);

      const mins = totalMinutes % 60;

      return [
        new Date(attendance.date).toLocaleDateString(),
        attendance.status,
        `${hrs} hrs ${mins} mins`,
      ];
    });

    autoTable(doc, {
      head: [["Date", "Status", "Working Hours"]],

      body: rows,

      startY: 130,
    });

    doc.save("Monthly_Attendance_Report.pdf");
  };

  // Total attendance days
  const totalAttendanceDays = monthlyAttendance.filter((attendance) =>
    ["Present", "Late", "Half Day", "Early Checkout"].includes(
      attendance.status,
    ),
  ).length;

  return (
    <div className="attendance-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2>Monthly Attendance</h2>

        <button
          onClick={downloadPDF}
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download PDF
        </button>
      </div>

      <div
        style={{
          margin: "15px 0",
          padding: "12px",
          background: "#f5f5f5",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Total Attendance Days: {totalAttendanceDays}
      </div>

      <div className="table-responsive table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Working Hours</th>
            </tr>
          </thead>

          <tbody>
            {monthlyAttendance.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  No Monthly Attendance Records
                </td>
              </tr>
            ) : (
              monthlyAttendance.map((attendance) => (
                <tr key={attendance._id}>
                  <td>{formatDate(attendance.date)}</td>

                  <td>
                    <span
                      style={{
                        ...getStatusStyle(attendance.status),
                        padding: "5px 10px",
                        borderRadius: "15px",
                        fontWeight: "bold",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attendance.status}
                    </span>
                  </td>

                  <td>{formatWorkingHours(attendance.workingHours)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyAttendance;
