import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Reports from "../pages/Reports/Reports/Reports";
import ReportsDashboard from "../pages/Reports/ReportsDashboard/ReportsDashboard";
import MonthlyReport from "../pages/Reports/MonthlyReport/MonthlyReport";
import YearlyReport from "../pages/Reports/YearlyReport/YearlyReport";
import EmployeeReport from "../pages/Reports/EmployeeReport/EmployeeReport";
import DepartmentReport from "../pages/Reports/DepartmentReport/DepartmentReport";
import ReportDetails from "../pages/Reports/ReportDetails/ReportDetails";
import ExportReport from "../pages/Reports/ExportReport/ExportReport";
import AnalyticsDashboard from "../pages/Reports/AnalyticsDashboard/AnalyticsDashboard";
import AllReports from "../pages/Reports/AllReports/AllReports";

export default function ReportsRoutes() {
  return (
    <Routes>
      <Route element={<Reports />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ReportsDashboard />} />
        <Route path="monthly" element={<MonthlyReport />} />
        <Route path="yearly" element={<YearlyReport />} />
        <Route path="employee" element={<EmployeeReport />} />
        <Route path="department" element={<DepartmentReport />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="all" element={<AllReports />} />
        <Route path="export/:id" element={<ExportReport />} />
        <Route path="export" element={<ExportReport />} />
        <Route path=":id" element={<ReportDetails />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
