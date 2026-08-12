import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getAllPayrolls, generatePayroll, markPayrollAsPaid, getAllSalaries } from '../../../services/payrollService';
import { getAllEmployees } from '../../../services/employeeService';
import SummaryCard from '../../../components/Payroll/SummaryCard';
import PayrollTable from '../../../components/Payroll/PayrollTable';
import LoadingState from '../../../components/Payroll/LoadingState';
import ErrorState from '../../../components/Payroll/ErrorState';
import EmptyState from '../../../components/Payroll/EmptyState';
import formatCurrency, { formatCompactCurrency } from '../../../utils/formatCurrency';
import { MONTH_NAMES, YEARS_LIST, getEmployeeOptionLabel } from '../../../utils/payrollConstants';
import { normalizeRole } from '../../../utils/permission';
import '../../../components/Payroll/payrollTheme.css';
import './PayrollDashboard.css';

export default function PayrollDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === 'admin';
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payroll Generation Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genData, setGenData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    daysPresent: 22,
    totalWorkingDays: 22,
    bonus: 0,
  });
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [payrollRes, empRes, salaryRes] = await Promise.allSettled([
        getAllPayrolls(),
        getAllEmployees(),
        getAllSalaries(),
      ]);

      if (payrollRes.status === 'fulfilled' && payrollRes.value?.success) {
        setPayrolls(payrollRes.value.data || []);
      } else if (payrollRes.status === 'rejected') {
        setError(payrollRes.reason?.message || 'Failed to fetch payroll records');
      }

      if (empRes.status === 'fulfilled' && empRes.value?.success) {
        setEmployees(empRes.value.data || empRes.value.employees || []);
      }

      if (salaryRes.status === 'fulfilled' && salaryRes.value?.success) {
        setSalaries(salaryRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute summary stats from real data
  const totalRecords = payrolls.length;
  const generatedCount = payrolls.filter((p) => p.status === 'Generated').length;
  const paidCount = payrolls.filter((p) => p.status === 'Paid').length;
  const totalGross = payrolls.reduce((acc, p) => acc + (p.grossSalary || 0), 0);
  const totalNet = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalDeductions = payrolls.reduce((acc, p) => acc + (p.deductions || 0), 0);

  const handleMarkPaid = async (id) => {
    try {
      const res = await markPayrollAsPaid(id);
      if (res?.success) {
        setPayrolls((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: 'Paid', paymentDate: new Date() } : item))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to mark payroll as paid');
    }
  };

  const handleGenSubmit = async (e) => {
    e.preventDefault();
    setGenError('');
    setGenSuccess('');

    if (!genData.employeeId) {
      setGenError('Please select an employee');
      return;
    }

    setGenSubmitting(true);
    try {
      const res = await generatePayroll({
        employeeId: genData.employeeId,
        month: Number(genData.month),
        year: Number(genData.year),
        daysPresent: Number(genData.daysPresent),
        totalWorkingDays: Number(genData.totalWorkingDays),
        bonus: Number(genData.bonus || 0),
      });

      if (res?.success) {
        setGenSuccess('Payroll generated successfully!');
        setTimeout(() => {
          setShowGenModal(false);
          setGenSuccess('');
          fetchData();
        }, 1200);
      }
    } catch (err) {
      setGenError(err.message || 'Failed to generate payroll');
    } finally {
      setGenSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Payroll Dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const hasActiveSalaries = salaries.some((s) => s.isActive);

  return (
    <div className="payroll-container">
      {/* Header Banner */}
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Payroll Dashboard</h1>
          <p className="payroll-header-subtitle">
            Overview of salary runs, payouts, and monthly payroll generation.
          </p>
        </div>
        {/* Admin-only action buttons */}
        {isAdmin && (
          <div className="payroll-header-actions">
            <button className="pr-btn pr-btn-secondary" onClick={() => navigate('/payroll/salaries')}>
              Manage Salary Structures
            </button>
            <button
              className="pr-btn pr-btn-primary"
              onClick={() => setShowGenModal(true)}
              title={!hasActiveSalaries ? 'No active salary structures exist' : ''}
            >
              + Generate Payroll
            </button>
          </div>
        )}
      </div>

      {/* Real Summary Metrics Cards */}
      <div className="payroll-grid">
        <SummaryCard
          title="Total Payroll Runs"
          value={totalRecords}
          subtitle="Real records in database"
          variant="info"
          icon="📊"
        />
        <SummaryCard
          title="Generated (Pending Payout)"
          value={generatedCount}
          subtitle="Status: Generated"
          variant="warning"
          icon="⏳"
        />
        <SummaryCard
          title="Paid Payrolls"
          value={paidCount}
          subtitle="Status: Paid"
          variant="success"
          icon="✅"
        />
        <SummaryCard
          title="Total Net Salary Payout"
          value={formatCompactCurrency(totalNet)}
          exactValue={formatCurrency(totalNet)}
          subtitle={`Gross: ${formatCompactCurrency(totalGross)} | Ded: ${formatCompactCurrency(totalDeductions)}`}
          variant="primary"
          icon="💰"
        />
      </div>

      {/* Recent Payrolls Section */}
      <div className="payroll-card">
        <div className="dashboard-section-header">
          <div>
            <h3 className="section-title">Recent Payroll Records</h3>
            <p className="section-subtitle">Real records stored in MongoDB</p>
          </div>
          <button className="pr-btn pr-btn-secondary pr-btn-sm" onClick={() => navigate('/payroll/history')}>
            View Full History →
          </button>
        </div>

        {payrolls.length === 0 ? (
          <EmptyState
            title="No Payroll Data Available"
            message="No payroll has been generated for any period yet."
            actionText={isAdmin ? '+ Generate First Payroll' : undefined}
            onAction={isAdmin ? () => setShowGenModal(true) : undefined}
          />
        ) : (
          <PayrollTable
            payrolls={payrolls.slice(0, 5)}
            onView={(id) => navigate(`/payroll/${id}`)}
            onMarkPaid={isAdmin ? handleMarkPaid : undefined}
          />
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showGenModal && (
        <div className="pr-modal-overlay">
          <div className="pr-modal-content">
            <div className="modal-header">
              <h3>Generate Monthly Payroll</h3>
              <button className="close-btn" onClick={() => setShowGenModal(false)}>✕</button>
            </div>

            {!hasActiveSalaries && (
              <div className="modal-alert alert-error">
                ⚠️ No active salary structures exist in the system. Please create a salary structure for an employee first.
              </div>
            )}
            {genError && <div className="modal-alert alert-error">{genError}</div>}
            {genSuccess && <div className="modal-alert alert-success">{genSuccess}</div>}

            <form onSubmit={handleGenSubmit} className="gen-form">
              <div className="form-group">
                <label>Select Employee *</label>
                <select
                  required
                  disabled={!hasActiveSalaries}
                  value={genData.employeeId}
                  onChange={(e) => setGenData({ ...genData, employeeId: e.target.value })}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {getEmployeeOptionLabel(emp)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month *</label>
                  <select
                    disabled={!hasActiveSalaries}
                    value={genData.month}
                    onChange={(e) => setGenData({ ...genData, month: e.target.value })}
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Year *</label>
                  <select
                    disabled={!hasActiveSalaries}
                    value={genData.year}
                    onChange={(e) => setGenData({ ...genData, year: e.target.value })}
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Days Present *</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    required
                    disabled={!hasActiveSalaries}
                    value={genData.daysPresent}
                    onChange={(e) => setGenData({ ...genData, daysPresent: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Total Working Days *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    disabled={!hasActiveSalaries}
                    value={genData.totalWorkingDays}
                    onChange={(e) => setGenData({ ...genData, totalWorkingDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bonus (Optional)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!hasActiveSalaries}
                  value={genData.bonus}
                  onChange={(e) => setGenData({ ...genData, bonus: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="pr-btn pr-btn-secondary"
                  onClick={() => setShowGenModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pr-btn pr-btn-primary"
                  disabled={genSubmitting || !hasActiveSalaries}
                >
                  {genSubmitting ? 'Generating...' : 'Generate Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
