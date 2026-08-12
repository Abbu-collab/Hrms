import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalary } from '../../../services/payrollService';
import { getAllEmployees } from '../../../services/employeeService';
import formatCurrency from '../../../utils/formatCurrency';
import { getEmployeeOptionLabel } from '../../../utils/payrollConstants';
import LoadingState from '../../../components/Payroll/LoadingState';
import '../../../components/Payroll/payrollTheme.css';
import './AddSalary.css';

export default function AddSalary() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: '',
    hra: '0',
    allowances: '0',
    bonus: '0',
    deductions: '0',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const res = await getAllEmployees();
        if (res?.success) {
          setEmployees(res.data || res.employees || []);
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setLoadingEmps(false);
      }
    };
    fetchEmps();
  }, []);

  const basic = Number(formData.basicSalary || 0);
  const hra = Number(formData.hra || 0);
  const allowances = Number(formData.allowances || 0);
  const bonus = Number(formData.bonus || 0);
  const deductions = Number(formData.deductions || 0);

  // Live calculation preview
  const grossSalary = basic + hra + allowances + bonus;
  const netSalary = Math.max(0, grossSalary - deductions);

  const validate = () => {
    if (!formData.employeeId) return 'Employee selection is required.';
    if (!formData.basicSalary || isNaN(basic) || basic < 0) return 'Basic Salary is required and cannot be negative.';
    if (isNaN(hra) || hra < 0) return 'HRA cannot be negative.';
    if (isNaN(allowances) || allowances < 0) return 'Allowances cannot be negative.';
    if (isNaN(bonus) || bonus < 0) return 'Bonus cannot be negative.';
    if (isNaN(deductions) || deductions < 0) return 'Deductions cannot be negative.';
    if (!formData.effectiveFrom) return 'Effective Date is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const valError = validate();
    if (valError) {
      setErrorMsg(valError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        basicSalary: basic,
        hra,
        allowances,
        bonus,
        deductions,
        effectiveFrom: formData.effectiveFrom,
      };

      const res = await createSalary(payload);
      if (res?.success) {
        setSuccessMsg('Salary structure created successfully!');
        setTimeout(() => {
          navigate('/payroll/salaries');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create salary structure.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEmps) return <LoadingState message="Loading employee directory..." />;

  return (
    <div className="payroll-container">
      {/* Header Banner */}
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Create Salary Structure</h1>
          <p className="payroll-header-subtitle">
            Define a new base salary configuration for an employee.
          </p>
        </div>
        <div className="payroll-header-actions">
          <button className="pr-btn pr-btn-secondary" onClick={() => navigate('/payroll/salaries')}>
            ← Back to Salary List
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="salary-form-card">
        {errorMsg && <div className="form-alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="form-alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="salary-form">
          <div className="form-section">
            <h3 className="section-heading">Employee & Date Information</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="employeeId">Select Employee *</label>
                <select
                  id="employeeId"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {getEmployeeOptionLabel(emp)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="effectiveFrom">Effective Date *</label>
                <input
                  type="date"
                  id="effectiveFrom"
                  required
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-heading">Earnings Components</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="basicSalary">Basic Salary (₹) *</label>
                <input
                  type="number"
                  id="basicSalary"
                  placeholder="e.g. 50000"
                  min="0"
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hra">House Rent Allowance - HRA (₹)</label>
                <input
                  type="number"
                  id="hra"
                  placeholder="e.g. 10000"
                  min="0"
                  value={formData.hra}
                  onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="allowances">Special Allowances (₹)</label>
                <input
                  type="number"
                  id="allowances"
                  placeholder="e.g. 5000"
                  min="0"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bonus">Standard Bonus (₹)</label>
                <input
                  type="number"
                  id="bonus"
                  placeholder="e.g. 2000"
                  min="0"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-heading">Deductions</h3>
            <div className="form-group max-half">
              <label htmlFor="deductions">Total Deductions (₹)</label>
              <input
                type="number"
                id="deductions"
                placeholder="e.g. 3000"
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="calculation-preview-box">
            <div className="preview-heading">Calculated Preview (Client Estimation)</div>
            <div className="preview-stats">
              <div className="stat-item">
                <span>Gross Salary:</span>
                <strong>{formatCurrency(grossSalary)}</strong>
              </div>
              <div className="stat-item">
                <span>Total Deductions:</span>
                <span className="text-danger">-{formatCurrency(deductions)}</span>
              </div>
              <div className="stat-item highlight">
                <span>Net Salary:</span>
                <strong className="text-success">{formatCurrency(netSalary)}</strong>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="pr-btn pr-btn-secondary"
              onClick={() => navigate('/payroll/salaries')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pr-btn pr-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Salary Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
