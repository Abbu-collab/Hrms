import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getAllPayrolls, markPayrollAsPaid } from '../../../services/payrollService';
import { normalizeRole } from '../../../utils/permission';
import PayrollFilter from '../../../components/Payroll/PayrollFilter';
import SearchBar from '../../../components/Payroll/SearchBar';
import PayrollTable from '../../../components/Payroll/PayrollTable';
import LoadingState from '../../../components/Payroll/LoadingState';
import ErrorState from '../../../components/Payroll/ErrorState';
import EmptyState from '../../../components/Payroll/EmptyState';
import Pagination from '../../../components/Payroll/Pagination';
import { getEmployeeDisplay } from '../../../utils/payrollConstants';
import '../../../components/Payroll/payrollTheme.css';
import './PayrollHistory.css';

export default function PayrollHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === 'admin';
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllPayrolls();
      if (res?.success) {
        setPayrolls(res.data || []);
      } else {
        setError(res?.message || 'Failed to load payroll history');
      }
    } catch (err) {
      setError(err.message || 'Error fetching payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      const res = await markPayrollAsPaid(id);
      if (res?.success) {
        setPayrolls((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: 'Paid', paymentDate: new Date() } : item
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to mark payroll as paid');
    } finally {
      setActionLoading(false);
    }
  };

  // Client-side filtering over real API data
  const filteredPayrolls = payrolls.filter((item) => {
    if (monthFilter && Number(item.month) !== Number(monthFilter)) return false;
    if (yearFilter && Number(item.year) !== Number(yearFilter)) return false;
    if (statusFilter && item.status !== statusFilter) return false;

    if (searchTerm) {
      const empDisplay = getEmployeeDisplay(item.employeeId);
      const searchLower = searchTerm.toLowerCase();
      return (
        (empDisplay.code && empDisplay.code.toLowerCase().includes(searchLower)) ||
        (empDisplay.name && empDisplay.name.toLowerCase().includes(searchLower)) ||
        (empDisplay.dept && empDisplay.dept.toLowerCase().includes(searchLower)) ||
        (empDisplay.label && empDisplay.label.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setMonthFilter('');
    setYearFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) return <LoadingState message="Loading Payroll History..." />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;

  return (
    <div className="payroll-container">
      {/* Header Banner */}
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Payroll History</h1>
          <p className="payroll-header-subtitle">
            Historical log of all generated and disbursed employee payroll runs.
          </p>
        </div>
        <div className="payroll-header-actions">
          <button className="pr-btn pr-btn-primary" onClick={() => navigate('/payroll/dashboard')}>
            Dashboard Overview
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="history-controls-row">
        <SearchBar
          value={searchTerm}
          onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          placeholder="🔍 Search by Employee Code or Name..."
        />
        <PayrollFilter
          selectedMonth={monthFilter}
          selectedYear={yearFilter}
          selectedStatus={statusFilter}
          onMonthChange={(val) => { setMonthFilter(val); setCurrentPage(1); }}
          onYearChange={(val) => { setYearFilter(val); setCurrentPage(1); }}
          onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        />
      </div>

      {/* Main Table Card */}
      <div className="payroll-card">
        {filteredPayrolls.length === 0 ? (
          <EmptyState
            title="No payroll records found."
            message={
              monthFilter || yearFilter || statusFilter || searchTerm
                ? 'No payroll records match your selected filter criteria.'
                : 'No payroll records exist in the database.'
            }
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            <PayrollTable
              payrolls={paginatedPayrolls}
              onView={(id) => navigate(`/payroll/${id}`)}
              onMarkPaid={isAdmin ? handleMarkPaid : undefined}
              isActionLoading={actionLoading}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPayrolls.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
