import { FaEdit, FaTrash } from "react-icons/fa";

export default function RoleTable({
  roles = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="table-card">
        <div className="loading">Loading roles...</div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          No roles found.
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="table">
        <thead>
          <tr>
            <th>Role ID</th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Status</th>
            <th width="120">Actions</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((role) => (
            <tr key={role._id}>
              <td>{role.roleId}</td>

              <td>{role.roleName}</td>

              <td>{role.description || "-"}</td>

              <td>
                {Array.isArray(role.permissions)
                  ? role.permissions.join(", ")
                  : role.permissions || "-"}
              </td>

              <td>
                <span
                  className={`badge ${
                    role.status === "Active"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {role.status}
                </span>
              </td>

              <td>
                <button
                  className="btn-edit"
                  onClick={() => onEdit(role)}
                  title="Edit"
                >
                  <FaEdit />
                </button>

                <button
                  className="btn-delete"
                  onClick={() => onDelete(role._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}