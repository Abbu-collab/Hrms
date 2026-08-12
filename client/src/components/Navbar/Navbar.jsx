import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDirectory = location.pathname.startsWith("/employee");

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <strong>Infinetra HRMS</strong>
          
        </div>

        <nav className="navbar-links">
          <Link to="/employee" className={isDirectory ? "active" : ""}>Directory</Link>
          <Link to="/dashboard">Benefits</Link>
          <Link to="/dashboard">Policies</Link>
        </nav>
      </div>

      {user && (
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user.name}</span>
              <span className="navbar-user-role">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="navbar-button" 
            title="Logout"
            type="button"
          >
            🚪
          </button>
        </div>
      )}
    </header>
  );
}
