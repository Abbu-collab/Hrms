import { useState } from "react";
import { applyLeave } from "../../services/leaveService";
import { useToast } from "../../context/ToastContext";
import { FiCalendar, FiFileText, FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ApplyLeave({ refreshLeaves }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      const msg = "Please fill in all required fields.";
      setMessage({ type: "error", text: msg });
      showToast("error", msg);
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      const msg = "End date cannot be before start date.";
      setMessage({ type: "error", text: msg });
      showToast("error", msg);
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      await applyLeave(formData);

      const msg = "Leave application submitted successfully.";
      setMessage({ type: "success", text: msg });
      showToast("success", msg);
      setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });

      if (refreshLeaves) refreshLeaves();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Failed to apply for leave.";
      setMessage({
        type: "error",
        text: errMsg,
      });
      showToast("error", errMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="apply-leave-container">
      <div className="leave-sub-header">
        <h2 className="leave-sub-title">
          <FiCalendar size={18} /> Apply for Leave
        </h2>
        <p className="leave-sub-subtitle">Submit a new leave request for approval.</p>
      </div>



      <form className="leave-apply-form" onSubmit={handleSubmit}>
        <div className="leave-form-grid">
          <div className="form-group">
            <label className="form-label">Leave Type <span style={{ color: "var(--danger)" }}>*</span></label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">Select Leave Type</option>
              <option value="Sick">🤒 Sick Leave</option>
              <option value="Casual">☕ Casual Leave</option>
              <option value="Annual">🏖️ Annual Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <FiFileText size={13} /> Reason <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea
            name="reason"
            placeholder="Describe the reason for your leave request..."
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            required
            style={{ resize: "vertical", minHeight: 80 }}
          />
        </div>

        <div className="leave-form-footer">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="settings-spinner-sm" /> Submitting...
              </>
            ) : (
              <>
                <FiSend size={15} /> Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}