function AttendanceHistory({ history = [] }) {

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString();
  };


  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

    switch(status) {

      case "Present":
        return {
          backgroundColor: "green",
          color: "white"
        };

      case "Late":
        return {
          backgroundColor: "orange",
          color: "white"
        };

      case "Half Day":
        return {
          backgroundColor: "gold",
          color: "black"
        };

      case "Early Checkout":
        return {
          backgroundColor: "purple",
          color: "white"
        };

      default:
        return {
          backgroundColor: "gray",
          color: "white"
        };
    }

  };



  return (
    <div className="attendance-card">

      <h2>Attendance History</h2>


      <div className="table-responsive table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No Attendance Records Found
                </td>
              </tr>
            ) : (
              history.map((attendance) => (
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



                  <td>
                    {formatTime(attendance.checkIn)}
                  </td>



                  <td>
                    {formatTime(attendance.checkOut)}
                  </td>



                  <td>
                    {formatWorkingHours(attendance.workingHours)}
                  </td>



                </tr>

              ))

            )}



          </tbody>

        </table>

      </div>

    </div>
  );
}


export default AttendanceHistory;