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

// Authentication
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP/VerifyOTP";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ChangePassword from "./pages/ChangePassword/ChangePassword";

// Dashboard & Profile
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

// Attendance
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";

// Payroll & Reports
import PayrollRoutes from "./routes/PayrollRoutes";
import ReportsRoutes from "./routes/ReportsRoutes";

// Other pages
import Settings from "./pages/Settings/Settings";
import Users from "./pages/Users/Users";

// Employee Management
// IMPORTANT: Folder is "Employee" with capital E
import EmployeeList from "./pages/Employee/EmployeeList";
import AddEmployee from "./pages/Employee/AddEmployee";
import EditEmployee from "./pages/Employee/EditEmployee";
import EmployeeDetails from "./pages/Employee/EmployeeDetails";
import EmployeeProfile from "./pages/Employee/EmployeeProfile";

// Departments
import DepartmentList from "./pages/Employee/departments/DepartmentList";
import AddDepartment from "./pages/Employee/departments/AddDepartment";
import EditDepartment from "./pages/Employee/departments/EditDepartment";

// Roles
import RoleList from "./pages/Employee/roles/RoleList";
import AddRole from "./pages/Employee/roles/AddRole";
import EditRole from "./pages/Employee/roles/EditRole";

// Leave
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
    <div
      className={`app-layout ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
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

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  return (
    <Routes>

      {/* ==================== AUTHENTICATION ==================== */}

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOTP />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* ==================== PROTECTED APPLICATION ==================== */}

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >

        {/* Root */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />


        {/* ==================== DASHBOARD ==================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== PROFILE ==================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ==================== EMPLOYEE MANAGEMENT ==================== */}

        <Route
          path="/directory"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <AddEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <EditEmployee />
            </ProtectedRoute>
          }
        />


        {/* ==================== DEPARTMENTS ==================== */}

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


        {/* ==================== ROLES ==================== */}

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


        {/* ==================== ATTENDANCE ==================== */}

        <Route
          path="/attendance-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <AttendanceDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== LEAVE ==================== */}

        <Route
          path="/leave"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <LeaveDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== PAYROLL ==================== */}

        <Route
          path="/payroll/*"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <PayrollRoutes />
            </ProtectedRoute>
          }
        />


        {/* ==================== REPORTS ==================== */}

        <Route
          path="/reports/*"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
              ]}
            >
              <ReportsRoutes />
            </ProtectedRoute>
          }
        />


        {/* ==================== SETTINGS ==================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* ==================== USERS ==================== */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />


        {/* ==================== CHANGE PASSWORD ==================== */}

        <Route
          path="/change-password"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "HR Manager",
                "Employee",
              ]}
            >
              <ChangePassword />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* ==================== FALLBACK ==================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
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