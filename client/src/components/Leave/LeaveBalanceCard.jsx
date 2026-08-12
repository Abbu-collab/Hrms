import React from "react";

const LeaveBalanceCard = ({ total, used, remaining }) => {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Leave Balance</h3>

      <div>
        <p>Total Leaves: {total}</p>
        <p>Used Leaves: {used}</p>
        <p>Remaining Leaves: {remaining}</p>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;