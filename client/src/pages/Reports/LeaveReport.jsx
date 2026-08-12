import React, { useEffect, useState } from "react";
import { getAllLeaves } from "../services/leaveService";

const LeaveReport = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await getAllLeaves();
      setLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalLeaves = leaves.length;

  const approvedLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "pending"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "rejected"
  ).length;

  return (
    <div>
      <h1>Leave Report</h1>

      <div>
        <h3>Total Leaves</h3>
        <p>{totalLeaves}</p>
      </div>

      <div>
        <h3>Approved Leaves</h3>
        <p>{approvedLeaves}</p>
      </div>

      <div>
        <h3>Pending Leaves</h3>
        <p>{pendingLeaves}</p>
      </div>

      <div>
        <h3>Rejected Leaves</h3>
        <p>{rejectedLeaves}</p>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id || leave._id}>
                <td>{leave.employeeName || "Employee"}</td>
                <td>{leave.leaveType}</td>
                <td>{leave.startDate}</td>
                <td>{leave.endDate}</td>
                <td>{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveReport;