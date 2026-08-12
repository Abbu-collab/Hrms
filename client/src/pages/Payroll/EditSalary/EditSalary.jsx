import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSalaryById, updateSalary } from '../../../services/payrollService';
import formatCurrency from '../../../utils/formatCurrency';
import { getEmployeeDisplay } from '../../../utils/payrollConstants';
import LoadingState from '../../../components/Payroll/LoadingState';
import ErrorState from '../../../components/Payroll/ErrorState';
import '../../../components/Payroll/payrollTheme.css';
import '../AddSalary/AddSalary.css';

export default function EditSalary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Store the raw MongoDB ObjectId for employeeId — required in PUT payload
  const [rawEmployeeId, setRawEmployeeId] = useState('');
  // Display-friendly label (EMP1003 - KANCHI SATHWIKA)
  const [employeeDisplay, setEmployeeDisplay] = useState('');

  const [formData, setFormData] = useState({
    basicSalary: '',
    hra: '0',
    allowances: '0',
    bonus: '0',
    deductions: '0',
    effectiveFrom: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSalaryDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSalaryById(id);
      if (res?.success && res.data) {
        const sal = res.data;

        // Extract the raw ObjectId string for the PUT payload
        let rawId = '';
        if (typeof sal.employeeId === 'object' && sal.employeeId !== null) {
          rawId = sal.employeeId._id || '';
        } else {
          rawId = String(sal.employeeId || '');
        }
        setRawEmployeeId(rawId);

        // Build friendly display from populated employee object
        const disp = getEmployeeDisplay(sal.employeeId);
        setEmployeeDisplay(disp.label || rawId);

        setFormData({
          basicSalary: sal.basicSalary || '',
          hra: sal.hra ?? 0,
          allowances: sal.allowances ?? 0,
          bonus: sal.bonus ?? 0,
          deductions: sal.deductions ?? 0,
          effectiveFrom: sal.effectiveFrom ? new Date(sal.effectiveFrom).toISOString().split('T')[0] : '',
        });
      } else {
        setError('Salary structure not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load salary structure details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryDetails();
  }, [id]);

  const basic = Number(formData.basicSalary || 0);
  const hra = Number(formData.hra || 0);
  const allowances = Number(formData.allowances || 0);
  const bonus = Number(formData.bonus || 0);
  const deductions = Number(formData.deductions || 0);

  const grossSalary = basic + hra + allowances + bonus;
  const netSalary = Math.max(0, grossSalary - deductions);

  const validate = () => {
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
      // CRITICAL FIX: employeeId MUST be included in the PUT body
      // Backend validation (validateUpdateSalary → validateCreateSalary) requires employeeId
      const payload = {
        employeeId: rawEmployeeId,
        basicSalary: basic,
        hra,
        allowances,
        bonus,
        deductions,
        effectiveFrom: formData.effectiveFrom,
      };

      const res = await updateSalary(id, payload);
      if (res?.success) {
        setSuccessMsg('Salary structure updated successfully!');
        setTimeout(() => {
          navigate('/payroll/salaries');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update salary structure.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading salary details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSalaryDetails} />;

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Edit Salary Structure</h1>
          <p className="payroll-header-subtitle">
            Updating compensation for: <strong>{employeeDisplay}</strong>
          </p>
        </div>
        <div className="payroll-header-actions">
          <button className="pr-btn pr-btn-secondary" onClick={() => navigate('/payroll/salaries')}>
            ← Back to Salary List
          </button>
        </div>
      </div>

      <div className="salary-form-card">
        {errorMsg && <div className="form-alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="form-alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="salary-form">
          <div className="form-section">
            <h3 className="section-heading">Employee & Date Information</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Employee (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={employeeDisplay}
                  style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600 }}
                />
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
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
            </div>
          </div>

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
              {submitting ? 'Updating...' : 'Update Salary Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
