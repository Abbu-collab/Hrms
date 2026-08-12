import React, { useEffect, useState } from "react";
import { getAllReports } from "../../../services/reportService";
import {
  getSummaryStats,
  getPayrollTrend,
  getDepartmentBreakdown,
  getDeductionBreakdown,
  getTopEarners,
} from "../../../services/analyticsService";

import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import AnalyticsCard from "../../../components/Reports/AnalyticsCard/AnalyticsCard";
import PayrollTrendChart from "../../../components/Reports/PayrollTrendChart/PayrollTrendChart";
import DepartmentBreakdownChart from "../../../components/Reports/DepartmentBreakdownChart/DepartmentBreakdownChart";
import DeductionBreakdownChart from "../../../components/Reports/DeductionBreakdownChart/DeductionBreakdownChart";
import TopEarnersTable from "../../../components/Reports/TopEarnersTable/TopEarnersTable";
import ReportTable from "../../../components/Reports/ReportTable/ReportTable";
import ReportCard from "../../../components/Reports/ReportCard/ReportCard";
import "./ReportsDashboard.css";

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reports, setReports] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [deductionData, setDeductionData] = useState({});
  const [topEarnersData, setTopEarnersData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        reportsRes,
        summaryRes,
        trendRes,
        deptRes,
        deductionRes,
        topEarnersRes,
      ] = await Promise.all([
        getAllReports().catch(() => ({ data: [] })),
        getSummaryStats().catch(() => ({ data: null })),
        getPayrollTrend().catch(() => ({ data: [] })),
        getDepartmentBreakdown().catch(() => ({ data: [] })),
        getDeductionBreakdown().catch(() => ({ data: {} })),
        getTopEarners().catch(() => ({ data: [] })),
      ]);

      setReports(reportsRes.data || []);
      setTrendData(trendRes.data || []);
      setDeptData(deptRes.data || []);
      setDeductionData(deductionRes.data || {});
      setTopEarnersData(topEarnersRes.data || []);

      // Use the dedicated summary endpoint first
      if (summaryRes.data) {
        setSummaryData({
          totalEmployees: summaryRes.data.totalEmployees || 0,
          totalGrossPay: summaryRes.data.totalGrossPay || 0,
          totalDeductions: summaryRes.data.totalDeductions || 0,
          totalNetPay: summaryRes.data.totalNetPay || 0,
        });
      } else {
        // Fallback: aggregate from trend data
        const fetchedTrend = trendRes.data || [];
        if (fetchedTrend.length > 0) {
          const agg = fetchedTrend.reduce(
            (acc, item) => {
              acc.totalEmployees = Math.max(
                acc.totalEmployees,
                item.employeeCount || 0
              );
              acc.totalGrossPay += item.totalGrossPay || 0;
              acc.totalDeductions += item.totalDeductions || 0;
              acc.totalNetPay += item.totalNetPay || 0;
              return acc;
            },
            {
              totalEmployees: 0,
              totalGrossPay: 0,
              totalDeductions: 0,
              totalNetPay: 0,
            }
          );
          setSummaryData(agg);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-dashboard-container">
      {/* 1. Quick Report Generators Cards */}
      <section className="dashboard-section">
        <h2 className="section-title">Report Generators</h2>
        <div className="report-cards-grid">
          <ReportCard
            title="Monthly Report"
            description="Generate comprehensive monthly payroll summary by month and year."
            type="monthly"
            targetPath="/reports/monthly"
            icon="📅"
          />
          <ReportCard
            title="Yearly Report"
            description="Generate annual financial summary and overall tax & salary totals."
            type="yearly"
            targetPath="/reports/yearly"
            icon="📊"
          />
          <ReportCard
            title="Employee Report"
            description="View complete historical salary records and payslips for individual employees."
            type="employee"
            targetPath="/reports/employee"
            icon="👤"
          />
          <ReportCard
            title="Department Report"
            description="Analyze salary distributions and headcount breakdown by department."
            type="department"
            targetPath="/reports/department"
            icon="🏢"
          />
        </div>
      </section>

      {/* 2. Real Summary Cards */}
      <section className="dashboard-section">
        <h2 className="section-title">Summary Metrics</h2>
        <ReportSummary summary={summaryData} />
      </section>

      {/* 3. Analytics Visualizations Grid */}
      <section className="dashboard-section">
        <h2 className="section-title">Visual Analytics</h2>
        <div className="analytics-grid-two-col">
          <AnalyticsCard title="Payroll Financial Trend" subtitle="Gross vs Net Pay trend over time">
            <PayrollTrendChart data={trendData} loading={loading} error={error} />
          </AnalyticsCard>

          <AnalyticsCard title="Department Net Salary Distribution" subtitle="Net salary expenditure by department">
            <DepartmentBreakdownChart data={deptData} loading={loading} error={error} />
          </AnalyticsCard>
        </div>

        <div className="analytics-grid-two-col margin-top-20">
          <AnalyticsCard title="Deduction Breakdown" subtitle="Total deductions summary">
            <DeductionBreakdownChart data={deductionData} loading={loading} error={error} />
          </AnalyticsCard>

          <AnalyticsCard title="Top Earners" subtitle="Highest net paid employees">
            <TopEarnersTable data={topEarnersData} loading={loading} error={error} />
          </AnalyticsCard>
        </div>
      </section>

      {/* 4. Recent Reports Table */}
      <section className="dashboard-section">
        <div className="section-header-row">
          <h2 className="section-title">Recent Generated Reports</h2>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            Refresh Data
          </button>
        </div>
        <ReportTable reports={reports} loading={loading} error={error} onRefresh={fetchDashboardData} />
      </section>
    </div>
  );
}
