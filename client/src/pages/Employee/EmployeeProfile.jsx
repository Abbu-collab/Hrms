import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} from "../../services/profileService.js";
import { getAllDepartments } from "../../services/profileService.js";
import "../../components/employee/emp.shared.css";
import "../../components/employee/EmployeeDetailsCard.css";
import { FiArrowLeft, FiEdit2, FiUser } from "react-icons/fi";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatPill({ label, value }) {
  return (
    <div
      style={{
        background: "#f3e8ff",
        borderRadius: 12,
        padding: "12px 20px",
        textAlign: "center",
        flex: 1,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#4c1d95" }}>{value}</div>
    </div>
  );
}

export default function EmployeeProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ designation: "", date_of_joining: "" });

  useEffect(() => {
    setLoading(true);
    getMyEmployeeProfile()
      .then((data) => {
        const emp = data?.employee;
        setProfile(emp);
        setForm({
          designation: emp?.designation || "",
          date_of_joining: emp?.date_of_joining
            ? new Date(emp.date_of_joining).toISOString().slice(0, 10)
            : "",
        });
      })
      .catch((err) => setError(err.message || "Unable to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateMyEmployeeProfile({
        designation: form.designation,
        date_of_joining: form.date_of_joining,
      });
      setProfile(data?.employee);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        designation: profile.designation || "",
        date_of_joining: profile.date_of_joining
          ? new Date(profile.date_of_joining).toISOString().slice(0, 10)
          : "",
      });
    }
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="emp-page">
        <div className="emp-loading">
          <span className="emp-spinner" />
          Loading your profile...
        </div>
      </div>
    );
  }

  const name = user?.name || profile?.user_id?.name || "—";
  const email = user?.email || profile?.user_id?.email || "—";
  const roleLabel = user?.role || profile?.user_id?.role || "Employee";
  const dept = profile?.department_id?.departmentName || "—";
  const code = profile?.employee_code || "—";
  const joinDate = formatDate(profile?.date_of_joining);
  const status = profile?.employment_status || "—";
  const designation = profile?.designation || "—";
  const manager = profile?.manager_id;

  const tenureYears = profile?.date_of_joining
    ? Math.floor(
        (Date.now() - new Date(profile.date_of_joining)) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : 0;

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div className="emp-page-header-text">
          <h1>My Employee Profile</h1>
          <p>View and manage your employment details.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="emp-btn-secondary"
            onClick={() => navigate("/employee")}
            id="emp-profile-back-btn"
          >
            <FiArrowLeft size={16} /> Directory
          </button>
          {!editing && profile && (
            <button
              className="emp-btn-primary"
              onClick={() => setEditing(true)}
              id="emp-profile-edit-btn"
            >
              <FiEdit2 size={15} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && <div className="emp-alert error">{error}</div>}
      {success && <div className="emp-alert success">{success}</div>}

      {!profile && !loading && (
        <div className="emp-table-container">
          <div className="emp-empty-state">
            <div className="emp-empty-icon"><FiUser size={48} /></div>
            <p>No employee profile linked to your account yet.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              Please contact your HR or Admin to create your employee record.
            </p>
          </div>
        </div>
      )}

      {profile && (
        <div className="emp-profile-page">
          <div className="emp-detail-hero">
            <div className="emp-detail-avatar">{name.charAt(0).toUpperCase()}</div>
            <div className="emp-detail-hero-info">
              <h2>{name}</h2>
              <p>{designation} &nbsp;·&nbsp; {dept}</p>
              <p style={{ marginTop: 4, opacity: 0.75, fontSize: 13 }}>{email}</p>
            </div>
            <div className="emp-detail-hero-badge">
              <span
                className={`emp-badge ${
                  status === "Active"
                    ? "active"
                    : status === "Inactive"
                    ? "inactive"
                    : "on-leave"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <StatPill label="Employee Code" value={code} />
            <StatPill label="Department" value={dept} />
            <StatPill label="Tenure" value={`${tenureYears} yr${tenureYears !== 1 ? "s" : ""}`} />
            <StatPill label="Role" value={roleLabel} />
          </div>

          <div className="emp-details-grid">
            <div className="emp-details-section">
              <h3>Employment Details</h3>

              <div className="emp-detail-item">
                <label>Employee Code</label>
                <strong>{code}</strong>
              </div>

              <div className="emp-detail-item">
                <label>Designation</label>
                {editing ? (
                  <input
                    name="designation"
                    type="text"
                    className="emp-form-input"
                    style={{ maxWidth: "55%", padding: "6px 10px", fontSize: 14 }}
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Your designation"
                  />
                ) : (
                  <strong>{designation}</strong>
                )}
              </div>

              <div className="emp-detail-item">
                <label>Date of Joining</label>
                {editing ? (
                  <input
                    name="date_of_joining"
                    type="date"
                    className="emp-form-input"
                    style={{ maxWidth: "55%", padding: "6px 10px", fontSize: 14 }}
                    value={form.date_of_joining}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{joinDate}</strong>
                )}
              </div>

              <div className="emp-detail-item">
                <label>Status</label>
                <strong>
                  <span
                    className={`emp-badge ${
                      status === "Active"
                        ? "active"
                        : status === "Inactive"
                        ? "inactive"
                        : "on-leave"
                    }`}
                  >
                    {status}
                  </span>
                </strong>
              </div>

              {editing && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    paddingTop: 16,
                  }}
                >
                  <button
                    className="emp-btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                    id="emp-profile-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    className="emp-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    id="emp-profile-save-btn"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="emp-details-section">
              <h3>Personal Info</h3>
              <div className="emp-detail-item">
                <label>Full Name</label>
                <strong>{name}</strong>
              </div>
              <div className="emp-detail-item">
                <label>Email</label>
                <strong>{email}</strong>
              </div>
              <div className="emp-detail-item">
                <label>System Role</label>
                <strong>{roleLabel}</strong>
              </div>
            </div>

            <div className="emp-details-section">
              <h3>Department</h3>
              <div className="emp-detail-item">
                <label>Name</label>
                <strong>{dept}</strong>
              </div>
              <div className="emp-detail-item">
                <label>Location</label>
                <strong>{profile?.department_id?.location || "—"}</strong>
              </div>
            </div>

            <div className="emp-details-section">
              <h3>Reporting Manager</h3>
              {manager ? (
                <>
                  <div className="emp-detail-item">
                    <label>Manager Code</label>
                    <strong>{manager.employee_code || "—"}</strong>
                  </div>
                  <div className="emp-detail-item">
                    <label>Designation</label>
                    <strong>{manager.designation || "—"}</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: "#94a3b8", fontSize: 14, paddingTop: 8 }}>
                  No manager assigned
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
