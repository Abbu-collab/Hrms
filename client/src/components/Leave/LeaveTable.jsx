import React from "react";
import LeaveStatusBadge from "./LeaveStatusBadge";

const LeaveTable = ({ leaves }) => {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th>Leave Type</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Reason</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {leaves?.map((leave) => (
          <tr key={leave.id || leave._id}>
            <td>{leave.leaveType}</td>
            <td>{leave.startDate}</td>
            <td>{leave.endDate}</td>
            <td>{leave.reason}</td>
            <td>
              <LeaveStatusBadge status={leave.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeaveTable;