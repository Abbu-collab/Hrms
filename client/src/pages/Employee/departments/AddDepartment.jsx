import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DepartmentForm from "../../../components/department/DepartmentForm";
import { addDepartment } from "../../../services/departmentService";
import { useToast } from "../../../context/ToastContext";

import "../department-role.css";

export default function AddDepartment() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      await addDepartment(formData);

      showToast("success", "Department added successfully.");

      navigate("/employee/departments");
    } catch (err) {
      showToast("error", err.message || "Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button
            className="btn-secondary"
            style={{ marginBottom: "15px" }}
            onClick={() => navigate("/employee/departments")}
          >
            ← Back to Departments
          </button>

          <h2>Add Department</h2>
          <p>Create a new department for your organization.</p>
        </div>
      </div>

      <DepartmentForm
        initialData={{
          departmentId: "",
          departmentName: "",
          description: "",
          location: "",
          status: "Active",
        }}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/employee/departments")}
      />
    </div>
  );
}