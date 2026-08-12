import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import ProtectedRoute from "./utils/ProtectedRoute";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP/VerifyOTP";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ChangePassword from "./pages/ChangePassword/ChangePassword";

import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";

import PayrollRoutes from "./routes/PayrollRoutes";
import ReportsRoutes from "./routes/ReportsRoutes";
import Settings from "./pages/Settings/Settings";
import Users from "./pages/Users/Users";

import EmployeeList from "./pages/employee/EmployeeList";
import AddEmployee from "./pages/employee/AddEmployee";
import EditEmployee from "./pages/employee/EditEmployee";
import EmployeeDetails from "./pages/employee/EmployeeDetails";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

import DepartmentList from "./pages/Employee/departments/DepartmentList";
import AddDepartment from "./pages/Employee/departments/AddDepartment";
import EditDepartment from "./pages/Employee/departments/EditDepartment";

import RoleList from "./pages/Employee/roles/RoleList";
import AddRole from "./pages/Employee/roles/AddRole";
import EditRole from "./pages/Employee/roles/EditRole";


import LeaveDashboard from "./pages/Leave/LeaveDashboard";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleSidebar={handleToggleSidebar}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="app-main-wrapper">
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ];

  if (!isAuthenticated && publicPaths.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/directory"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/add"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <EditEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/departments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <DepartmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/departments/add"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddDepartment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/departments/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EditDepartment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/roles"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <RoleList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/roles/add"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/roles/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EditRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <AttendanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <LeaveDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll/*"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <PayrollRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/*"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager"]}>
              <ReportsRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR Manager", "Employee"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
