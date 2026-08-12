import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { normalizeRole } from "./permission.js";

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [] 
}) {

  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user?.role);

  if (
    allowedRoles.length > 0 &&
    !allowedRoles
      .map(role => normalizeRole(role))
      .includes(userRole)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}