import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RoleForm from "../../../components/role/RoleForm";
import { addRole } from "../../../services/roleService";
import { useToast } from "../../../context/ToastContext";

import "../department-role.css";

export default function AddRole() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      await addRole(formData);

      showToast("success", "Role added successfully.");

      navigate("/employee/roles");
    } catch (err) {
      showToast("error", err.message || "Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <div className="page-header">

        <div className="page-title">

          <button
            className="btn-secondary"
            style={{ marginBottom: "15px", width: "fit-content" }}
            onClick={() => navigate("/employee/roles")}
          >
            ← Back to Roles
          </button>

          <h2>Add Role</h2>

          <p>Create a new company role.</p>

        </div>

      </div>

      <RoleForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/employee/roles")}
      />

    </div>
  );
}