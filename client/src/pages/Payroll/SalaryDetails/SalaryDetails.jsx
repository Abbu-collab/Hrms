import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSalaryById, deactivateSalary } from '../../../services/payrollService';
import StatusBadge from '../../../components/Payroll/StatusBadge';
import LoadingState from '../../../components/Payroll/LoadingState';
import ErrorState from '../../../components/Payroll/ErrorState';
import formatCurrency from '../../../utils/formatCurrency';
import { getEmployeeDisplay } from '../../../utils/payrollConstants';
import '../../../components/Payroll/payrollTheme.css';
import './SalaryDetails.css';

export default function SalaryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSalaryById(id);
      if (res?.success && res.data) {
        setSalary(res.data);
      } else {
        setError('Salary record not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch salary details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this salary structure?')) return;
    setDeactivating(true);
    try {
      const res = await deactivateSalary(id);
      if (res?.success) {
        setSalary((prev) => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      alert(err.message || 'Failed to deactivate salary structure');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) return <LoadingState message="Loading salary details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDetails} />;
  if (!salary) return null;

  const empDisplay = getEmployeeDisplay(salary.employeeId);

  return (
    <div className="payroll-container">
      {/* Header Banner */}
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Salary Structure Details</h1>
          <p className="payroll-header-subtitle">
            Itemized breakdown for: <strong>{empDisplay.label}</strong>
          </p>
        </div>
        <div className="payroll-header-actions">
          <button className="pr-btn pr-btn-secondary" onClick={() => navigate('/payroll/salaries')}>
            ← Back to List
          </button>
          <button className="pr-btn pr-btn-primary" onClick={() => navigate(`/payroll/salaries/${id}/edit`)}>
            Edit Structure
          </button>
          {salary.isActive && (
            <button className="pr-btn pr-btn-danger" onClick={handleDeactivate} disabled={deactivating}>
              {deactivating ? 'Deactivating...' : 'Deactivate'}
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="details-card">
        <div className="details-card-header">
          <div className="status-meta">
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6c5ce7', fontSize: '15px' }}>
              {empDisplay.code || '—'}
            </span>
            {empDisplay.name && <span style={{ marginLeft: '10px', fontWeight: 600 }}>{empDisplay.name}</span>}
            {empDisplay.dept && <span style={{ marginLeft: '10px', color: '#64748b' }}>({empDisplay.dept} — {empDisplay.desig})</span>}
          </div>
          <StatusBadge status={salary.isActive} type="active" />
        </div>

        <div className="details-grid">
          <div className="details-section">
            <h3 className="details-section-title">Earnings Breakdown</h3>
            <div className="details-row">
              <span className="label">Basic Salary:</span>
              <span className="value font-strong">{formatCurrency(salary.basicSalary)}</span>
            </div>
            <div className="details-row">
              <span className="label">House Rent Allowance (HRA):</span>
              <span className="value">{formatCurrency(salary.hra)}</span>
            </div>
            <div className="details-row">
              <span className="label">Special Allowances:</span>
              <span className="value">{formatCurrency(salary.allowances)}</span>
            </div>
            <div className="details-row">
              <span className="label">Bonus:</span>
              <span className="value">{formatCurrency(salary.bonus)}</span>
            </div>
            <div className="details-row highlight-row">
              <span className="label">Gross Salary:</span>
              <span className="value font-strong">{formatCurrency(salary.grossSalary)}</span>
            </div>
          </div>

          <div className="details-section">
            <h3 className="details-section-title">Deductions & Net Pay</h3>
            <div className="details-row">
              <span className="label">Total Deductions:</span>
              <span className="value text-danger font-strong">-{formatCurrency(salary.deductions)}</span>
            </div>
            <div className="details-row highlight-row net-box">
              <span className="label">Net Salary:</span>
              <span className="value text-success font-strong">{formatCurrency(salary.netSalary)}</span>
            </div>
          </div>
        </div>

        <div className="details-footer-meta">
          <div className="meta-item">
            <span>Effective Date:</span>
            <strong>{salary.effectiveFrom ? new Date(salary.effectiveFrom).toLocaleDateString('en-IN') : '-'}</strong>
          </div>
          <div className="meta-item">
            <span>Created At:</span>
            <strong>{salary.createdAt ? new Date(salary.createdAt).toLocaleString('en-IN') : '-'}</strong>
          </div>
          <div className="meta-item">
            <span>Last Updated:</span>
            <strong>{salary.updatedAt ? new Date(salary.updatedAt).toLocaleString('en-IN') : '-'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
