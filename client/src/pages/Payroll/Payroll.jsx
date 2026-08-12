import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '../../components/Payroll/payrollTheme.css';
import './PayrollNavigation.css';

export default function Payroll() {
  const location = useLocation();

  // If at exact path "/payroll" or "/payroll/", we can render the main dashboard view via Outlet or direct component
  return (
    <div className="payroll-main-wrapper">
      {/* Sub Navigation Tabs Bar */}
      <div className="payroll-nav-tabs">
        <NavLink
          to="/payroll/dashboard"
          className={({ isActive }) =>
            `payroll-tab ${isActive || location.pathname === '/payroll' ? 'active' : ''}`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/payroll/salaries"
          className={({ isActive }) =>
            `payroll-tab ${isActive || location.pathname.includes('/payroll/salaries') ? 'active' : ''}`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Salaries
        </NavLink>

        <NavLink
          to="/payroll/history"
          className={({ isActive }) =>
            `payroll-tab ${isActive || location.pathname.includes('/payroll/history') ? 'active' : ''}`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payroll History
        </NavLink>
      </div>

      {/* Render Sub-route Content */}
      <div className="payroll-content-body">
        <Outlet />
      </div>
    </div>
  );
}
