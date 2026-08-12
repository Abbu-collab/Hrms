import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import logo from "../../assets/infinetra-logo.png";
import { registerUser, getPublicDepartments, getPublicRoles } from "../../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [role, setRole] = useState("Employee");
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, roleRes] = await Promise.allSettled([
          getPublicDepartments(),
          getPublicRoles(),
        ]);

        if (deptRes.status === "fulfilled") {
          setDepartments(deptRes.value?.data || []);
        } else {
          console.error("Failed to load departments:", deptRes.reason);
        }
        setDepartmentsLoading(false);

        if (roleRes.status === "fulfilled") {
          let fetchedRoles = roleRes.value?.data || [];
          if (!Array.isArray(fetchedRoles)) fetchedRoles = [];

          const defaultRoleNames = ["Admin", "HR Manager", "Employee"];
          defaultRoleNames.forEach((defName) => {
            const hasRole = fetchedRoles.some(
              (r) => (r.roleName || "").toLowerCase() === defName.toLowerCase() ||
                     (r.roleName || "").toLowerCase() === defName.toLowerCase().replace(" ", "_")
            );
            if (!hasRole) {
              fetchedRoles.push({ _id: defName, roleName: defName });
            }
          });

          setRoles(fetchedRoles);
          if (fetchedRoles.length > 0) {
            const empRole = fetchedRoles.find(
              (r) => (r.roleName || "").toLowerCase() === "employee"
            );
            if (empRole) {
              setRole(empRole.roleName);
            } else {
              setRole(fetchedRoles[0].roleName);
            }
          }
        } else {
          console.error("Failed to load roles:", roleRes.reason);
          setRolesError(roleRes.reason?.message || "Failed to load roles");
          setRoles([
            { _id: "Admin", roleName: "Admin" },
            { _id: "HR Manager", roleName: "HR Manager" },
            { _id: "Employee", roleName: "Employee" }
          ]);
          setRole("Employee");
        }
        setRolesLoading(false);
      } catch (error) {
        console.error("Failed to load register options:", error);
        setDepartmentsLoading(false);
        setRolesLoading(false);
      }
    };

    fetchData();
  }, []);


  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !phone ||
      !department ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      showToast("error", "Please fill in all required fields.");
      return;
    }

    // Remove spaces, hyphens, brackets, etc.
    const cleanedPhone = phone.replace(/\D/g, "");

    // Validate exactly 10 digits
    if (cleanedPhone.length !== 10) {
      showToast("error", "Please enter a valid 10-digit phone number.");
      return;
    }

    if (password !== confirmPassword) {
      showToast("error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanedPhone,
        department: department.trim(),
        password,
        confirm_password: confirmPassword,
        role,
      });

      showToast("success", data.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);

      showToast(
        "error",
        error.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </div>

          <div className="toast-content">
            <strong>{toast.type === "success" ? "Success" : "Error"}</strong>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="login-left">
        <div className="brand-section">
          <img src={logo} alt="Infinetra Logo" className="logo-image" />

          <h1>Infinetra HRMS</h1>

          <p className="brand-description">
            Elevating enterprise productivity through intelligent employee
            management and seamless human resource workflows.
          </p>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <svg
              className="feature-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>

            <h4>Unified Dashboard</h4>

            <p>Real-time metrics at your fingertips.</p>
          </div>

          <div className="feature-card">
            <svg
              className="feature-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L20 6V12C20 17 16.5 20 12 22C7.5 20 4 17 4 12V6L12 2Z" />
              <path d="M8.5 12L11 14.5L15.5 10" />
            </svg>

            <h4>Secure Access</h4>

            <p>Enterprise-grade data protection.</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <div className="mobile-logo-header">
            <img src={logo} alt="Infinetra Logo" className="mobile-logo" />
          </div>

          <h2>Create account</h2>

          <p className="subtitle">Please enter your details to register.</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={departmentsLoading}
              >
                <option value="">
                  {departmentsLoading ? 'Loading departments...' : 'Select a department'}
                </option>

                {departments.map((dept) => (
                  <option key={dept._id} value={dept.departmentName}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={rolesLoading}
              >
                <option value="">
                  {rolesLoading ? "Loading roles..." : "Select a role"}
                </option>
                {roles.map((r) => (
                  <option key={r._id || r.roleId || r.roleName} value={r.roleName}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              {rolesError && (
                <span className="error-text" style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                  {rolesError}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show or hide password"
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Show or hide confirm password"
                >
                  {showConfirmPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="register-text">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login
            </Link>
          </p>

          <p className="powered-by">POWERED BY INFINETRA TECH</p>
        </div>
      </div>
    </div>
  );
}

export default Register;