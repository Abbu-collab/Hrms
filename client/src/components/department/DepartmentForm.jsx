import { useEffect, useState } from "react";

const EMPTY_FORM = {
  departmentId: "",
  departmentName: "",
  description: "",
  location: "",
  status: "Active",
};

export default function DepartmentForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...initialData,
  });

  useEffect(() => {
    setForm({
      ...EMPTY_FORM,
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      departmentId: form.departmentId.trim(),
      departmentName: form.departmentName.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      status: form.status,
    });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit} autoComplete="off">

        <div className="form-group">
          <label htmlFor="departmentId">Department ID</label>

          <input
            id="departmentId"
            type="text"
            name="departmentId"
            placeholder="Enter Department ID"
            value={form.departmentId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="departmentName">Department Name</label>

          <input
            id="departmentName"
            type="text"
            name="departmentName"
            placeholder="Enter Department Name"
            value={form.departmentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Enter Department Description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>

          <input
            id="location"
            type="text"
            name="location"
            placeholder="Enter Department Location"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Department"}
          </button>
        </div>

      </form>
    </div>
  );
}