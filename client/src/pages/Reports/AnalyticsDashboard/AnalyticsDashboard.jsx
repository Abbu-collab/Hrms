import React, { useEffect, useState } from "react";
import {
  getPayrollTrend,
  getDepartmentBreakdown,
  getDeductionBreakdown,
  getTopEarners,
} from "../../../services/analyticsService";

import ReportFilters from "../../../components/Reports/ReportFilters/ReportFilters";
import AnalyticsCard from "../../../components/Reports/AnalyticsCard/AnalyticsCard";
import PayrollTrendChart from "../../../components/Reports/PayrollTrendChart/PayrollTrendChart";
import DepartmentBreakdownChart from "../../../components/Reports/DepartmentBreakdownChart/DepartmentBreakdownChart";
import DeductionBreakdownChart from "../../../components/Reports/DeductionBreakdownChart/DeductionBreakdownChart";
import TopEarnersTable from "../../../components/Reports/TopEarnersTable/TopEarnersTable";
import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trendData, setTrendData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [deductionData, setDeductionData] = useState({});
  const [topEarnersData, setTopEarnersData] = useState([]);

  useEffect(() => {
    fetchAnalytics(filters);
  }, []);

  const fetchAnalytics = async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const { month, year } = currentFilters;
      const [trendRes, deptRes, deductionRes, topEarnersRes] = await Promise.all([
        getPayrollTrend(year).catch(() => ({ data: [] })),
        getDepartmentBreakdown(month, year).catch(() => ({ data: [] })),
        getDeductionBreakdown(month, year).catch(() => ({ data: {} })),
        getTopEarners(month, year, 5).catch(() => ({ data: [] })),
      ]);

      setTrendData(trendRes.data || []);
      setDeptData(deptRes.data || []);
      setDeductionData(deductionRes.data || {});
      setTopEarnersData(topEarnersRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (newFilters) => {
    fetchAnalytics(newFilters);
  };

  const handleResetFilter = () => {
    const defaultFilters = { month: "", year: currentDate.getFullYear() };
    setFilters(defaultFilters);
    fetchAnalytics(defaultFilters);
  };

  return (
    <div className="analytics-dashboard-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2>Financial & Payroll Analytics</h2>
          <p>Filter payroll trend, department distribution, tax deductions, and top earners by period.</p>
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
          visibleFields={["month", "year"]}
          loading={loading}
          submitText="Apply Period Filter"
        />

        {error && <div className="report-alert alert-error">{error}</div>}

        <div className="analytics-grid-container">
          <div className="analytics-full-width">
            <AnalyticsCard
              title="Payroll Financial Trend"
              subtitle={`Monthly gross vs net pay trend for year ${filters.year || currentDate.getFullYear()}`}
            >
              <PayrollTrendChart data={trendData} loading={loading} error={error} />
            </AnalyticsCard>
          </div>

          <div className="analytics-two-col">
            <AnalyticsCard
              title="Department Net Pay Distribution"
              subtitle="Net salary expenditure by department"
            >
              <DepartmentBreakdownChart data={deptData} loading={loading} error={error} />
            </AnalyticsCard>

            <AnalyticsCard
              title="Deduction Breakdown"
              subtitle="Tax, PF, Insurance and Other deductions"
            >
              <DeductionBreakdownChart data={deductionData} loading={loading} error={error} />
            </AnalyticsCard>
          </div>

          <div className="analytics-full-width">
            <AnalyticsCard
              title="Top Salary Earners"
              subtitle="Top 5 highest paid employees for selected period"
            >
              <TopEarnersTable data={topEarnersData} loading={loading} error={error} />
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </div>
  );
}
