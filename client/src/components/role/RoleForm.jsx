import { useEffect, useState } from "react";

const EMPTY_FORM = {
  roleId: "",
  roleName: "",
  description: "",
  permissions: "",
  status: "Active",
};

export default function RoleForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(() => ({
    roleId: initialData.roleId || "",
    roleName: initialData.roleName || "",
    description: initialData.description || "",
    permissions: Array.isArray(initialData.permissions)
      ? initialData.permissions.join(", ")
      : initialData.permissions || "",
    status: initialData.status || "Active",
  }));

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      roleId: form.roleId.trim(),
      roleName: form.roleName.trim(),
      description: form.description.trim(),
      permissions: form.permissions
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: form.status,
    });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="form-group">
          <label>Role ID</label>
          <input
            type="text"
            name="roleId"
            value={form.roleId}
            onChange={handleChange}
            placeholder="Enter Role ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Role Name</label>
          <input
            type="text"
            name="roleName"
            value={form.roleName}
            onChange={handleChange}
            placeholder="Enter Role Name"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter Description"
          />
        </div>

        <div className="form-group">
          <label>Permissions</label>
          <input
            type="text"
            name="permissions"
            value={form.permissions}
            onChange={handleChange}
            placeholder="Create Employee, Edit Employee"
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </form>
    </div>
  );
}
