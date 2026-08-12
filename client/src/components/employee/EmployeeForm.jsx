import { useState, useEffect } from "react";
import "../employee/emp.shared.css";
import "../employee/EmployeeForm.css";

const EMPTY = {
  user_id: "",
  department_id: "",
  designation: "",
  manager_id: "",
  date_of_joining: "",
  employment_status: "Active",
};

export default function EmployeeForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  departments = [],
  users = [],   
  title = "Employee Details",
  isEditMode = false,
  linkedUserName = "",
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const initialDataStr = JSON.stringify(initialData);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({ ...EMPTY, ...initialData });
    }
  }, [initialDataStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUserSearchChange = (e) => {
    const text = e.target.value;
    setUserSearch(text);
    if (errors.user_id) setErrors((prev) => ({ ...prev, user_id: "" }));

    const match = users.find(
      (u) =>
        u.name?.toLowerCase() === text.toLowerCase() ||
        u.email?.toLowerCase() === text.toLowerCase() ||
        `${u.name} (${u.email})`.toLowerCase() === text.toLowerCase()
    );
    setForm((prev) => ({ ...prev, user_id: match ? (match._id || match.id) : text }));
  };

  const validate = () => {
    const errs = {};
    if (!isEditMode && !form.user_id?.trim()) {
      errs.user_id = "User account (email or ID) is required";
    }
    if (!form.department_id) errs.department_id = "Department is required";
    if (!form.designation.trim()) errs.designation = "Designation is required";
    if (!form.date_of_joining) errs.date_of_joining = "Date of joining is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...(isEditMode ? {} : { user_id: form.user_id }),
      department_id: form.department_id,
      designation: form.designation.trim(),
      manager_id: form.manager_id || null,
      date_of_joining: form.date_of_joining,
      employment_status: form.employment_status,
    };
    onSubmit(payload);
  };

  const datalistId = "users-datalist";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="emp-form-card">
        <h2>{title}</h2>
        <div className="emp-form-grid">

          {isEditMode ? (
            <div className="emp-form-group full-width">
              <label className="emp-form-label">Linked User Account</label>
              <div
                className="emp-form-input"
                style={{
                  background: "var(--emp-surface, #f4f4f8)",
                  color: "var(--emp-text-muted, #6b7280)",
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  minHeight: 42,
                }}
              >
                {linkedUserName || "—"}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--emp-text-muted, #6b7280)", marginTop: 4 }}>
                User account cannot be changed after creation.
              </span>
            </div>
          ) : (
            <div className="emp-form-group full-width">
              <label className="emp-form-label">
                Select User <span>*</span>
              </label>

              <datalist id={datalistId}>
                {users.map((u) => (
                  <option key={u._id || u.id} value={`${u.name} (${u.email})`} />
                ))}
              </datalist>

              <input
                type="text"
                list={datalistId}
                className={`emp-form-input${errors.user_id ? " error" : ""}`}
                placeholder="Type to search by name or email…"
                value={userSearch}
                onChange={handleUserSearchChange}
                autoComplete="off"
              />

              {form.user_id && !errors.user_id && (
                <span style={{ fontSize: "0.78rem", color: users.some(u => (u._id || u.id) === form.user_id) ? "#16a34a" : "#2563eb", marginTop: 4 }}>
                  {users.some(u => (u._id || u.id) === form.user_id) 
                    ? "✓ Existing user matched and will be linked" 
                    : "+ New user account will be created automatically"}
                </span>
              )}
              {errors.user_id && (
                <span className="emp-field-error">{errors.user_id}</span>
              )}
            </div>
          )}

          <div className="emp-form-group">
            <label className="emp-form-label">
              Designation <span>*</span>
            </label>
            <input
              type="text"
              name="designation"
              className={`emp-form-input${errors.designation ? " error" : ""}`}
              placeholder="e.g. Senior Developer"
              value={form.designation}
              onChange={handleChange}
            />
            {errors.designation && (
              <span className="emp-field-error">{errors.designation}</span>
            )}
          </div>

          <div className="emp-form-group">
            <label className="emp-form-label">
              Department <span>*</span>
            </label>
            <select
              name="department_id"
              className={`emp-form-select${errors.department_id ? " error" : ""}`}
              value={form.department_id}
              onChange={handleChange}
            >
              <option value="">— Select Department —</option>
              {departments.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.departmentName || d.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <span className="emp-field-error">{errors.department_id}</span>
            )}
          </div>

          <div className="emp-form-group">
            <label className="emp-form-label">
              Date of Joining <span>*</span>
            </label>
            <input
              type="date"
              name="date_of_joining"
              className={`emp-form-input${errors.date_of_joining ? " error" : ""}`}
              value={form.date_of_joining ? String(form.date_of_joining).slice(0, 10) : ""}
              onChange={handleChange}
            />
            {errors.date_of_joining && (
              <span className="emp-field-error">{errors.date_of_joining}</span>
            )}
          </div>

          <div className="emp-form-group">
            <label className="emp-form-label">Employment Status</label>
            <select
              name="employment_status"
              className="emp-form-select"
              value={form.employment_status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="emp-form-actions">
        <button
          type="button"
          className="emp-btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="emp-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="emp-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Saving...
            </>
          ) : (
            "Save Employee"
          )}
        </button>
      </div>
    </form>
  );
}
