import React, { useState } from "react";

const LeaveForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="leaveType"
        placeholder="Leave Type"
        value={formData.leaveType}
        onChange={handleChange}
      />

      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
      />

      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
      />

      <textarea
        name="reason"
        placeholder="Reason"
        value={formData.reason}
        onChange={handleChange}
      />

      <button type="submit">
        Apply Leave
      </button>
    </form>
  );
};

export default LeaveForm;