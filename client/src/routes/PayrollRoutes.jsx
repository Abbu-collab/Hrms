import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Payroll from '../pages/Payroll/Payroll';
import PayrollDashboard from '../pages/Payroll/PayrollDashboard/PayrollDashboard';
import SalaryList from '../pages/Payroll/SalaryList/SalaryList';
import AddSalary from '../pages/Payroll/AddSalary/AddSalary';
import EditSalary from '../pages/Payroll/EditSalary/EditSalary';
import SalaryDetails from '../pages/Payroll/SalaryDetails/SalaryDetails';
import PayrollHistory from '../pages/Payroll/PayrollHistory/PayrollHistory';
import PayrollDetails from '../pages/Payroll/PayrollDetails/PayrollDetails';

export default function PayrollRoutes() {
  return (
    <Routes>
      <Route element={<Payroll />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PayrollDashboard />} />
        
        {/* Salary Sub-routes */}
        <Route path="salaries" element={<SalaryList />} />
        <Route path="salaries/add" element={<AddSalary />} />
        <Route path="salaries/:id" element={<SalaryDetails />} />
        <Route path="salaries/:id/edit" element={<EditSalary />} />

        {/* Payroll Sub-routes */}
        <Route path="history" element={<PayrollHistory />} />
        <Route path=":id" element={<PayrollDetails />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
