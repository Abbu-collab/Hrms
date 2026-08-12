import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import RoleTable from "../../../components/role/RoleTable";

import {
  getRoles,
  deleteRole,
} from "../../../services/roleService";

import "../department-role.css";

export default function RoleList() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRoles = async () => {
    try {
      setLoading(true);

      const res = await getRoles();

      setRoles(res.data || res);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEdit = (role) => {
    navigate(`/employee/roles/edit/${role._id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?"
    );

    if (!confirmDelete) return;

    try {
      await deleteRole(id);

      setMessage("Role deleted successfully.");

      loadRoles();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <button
            className="btn-secondary"
            style={{ marginBottom: "15px" }}
            onClick={() => navigate("/employee")}
          >
            ← Back to Directory
          </button>

          <h2>Roles</h2>
          <p>Manage all company roles.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/employee/roles/add")}
        >
          + Add Role
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <RoleTable
        roles={roles}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>
  );
}