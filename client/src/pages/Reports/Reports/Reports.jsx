import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./Reports.css";

export default function Reports() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isTabActive = (path) => {
    if (path === "/reports/dashboard") {
      return currentPath === "/reports" || currentPath === "/reports/" || currentPath === "/reports/dashboard";
    }
    return currentPath === path;
  };

  return (
    <div className="reports-layout-wrapper">
      <div className="reports-header-bar">
        <div>
          <h1 className="reports-page-title">Reports & Analytics</h1>
          <p className="reports-page-subtitle">
            Generate payroll reports, track department performance, and gain real-time workforce financial analytics.
          </p>
        </div>
      </div>

      <nav className="reports-nav-tabs">
        <NavLink
          to="/reports/dashboard"
          className={`reports-tab ${isTabActive("/reports/dashboard") ? "active" : ""}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/reports/monthly"
          className={`reports-tab ${isTabActive("/reports/monthly") ? "active" : ""}`}
        >
          Monthly Report
        </NavLink>
        <NavLink
          to="/reports/yearly"
          className={`reports-tab ${isTabActive("/reports/yearly") ? "active" : ""}`}
        >
          Yearly Report
        </NavLink>
        <NavLink
          to="/reports/employee"
          className={`reports-tab ${isTabActive("/reports/employee") ? "active" : ""}`}
        >
          Employee Report
        </NavLink>
        <NavLink
          to="/reports/department"
          className={`reports-tab ${isTabActive("/reports/department") ? "active" : ""}`}
        >
          Department Report
        </NavLink>
        <NavLink
          to="/reports/analytics"
          className={`reports-tab ${isTabActive("/reports/analytics") ? "active" : ""}`}
        >
          Analytics Dashboard
        </NavLink>
        <NavLink
          to="/reports/all"
          className={`reports-tab ${isTabActive("/reports/all") ? "active" : ""}`}
        >
          All Reports
        </NavLink>
      </nav>

      <div className="reports-content-body">
        <Outlet />
      </div>
    </div>
  );
}
