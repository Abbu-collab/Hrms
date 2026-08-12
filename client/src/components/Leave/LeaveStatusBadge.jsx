import React from "react";

const LeaveStatusBadge = ({ status }) => {
  const statusStyles = {
    approved: {
      backgroundColor: "#d4edda",
      color: "#155724",
    },
    rejected: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
    },
    pending: {
      backgroundColor: "#fff3cd",
      color: "#856404",
    },
  };

  const currentStyle =
    statusStyles[status?.toLowerCase()] || statusStyles.pending;

  return (
    <span
      style={{
        ...currentStyle,
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      {status}
    </span>
  );
};

export default LeaveStatusBadge;