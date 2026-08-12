import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPayrollById, markPayrollAsPaid, downloadPayslip } from '../../../services/payrollService';
import StatusBadge from '../../../components/Payroll/StatusBadge';
import LoadingState from '../../../components/Payroll/LoadingState';
import ErrorState from '../../../components/Payroll/ErrorState';
import formatCurrency from '../../../utils/formatCurrency';
import { getMonthName, getEmployeeDisplay } from '../../../utils/payrollConstants';
import '../../../components/Payroll/payrollTheme.css';
import './PayrollDetails.css';

export default function PayrollDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchPayrollDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPayrollById(id);
      if (res?.success && res.data) {
        setPayroll(res.data);
      } else {
        setError('Payroll record not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payroll record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollDetails();
  }, [id]);

  const handleMarkPaid = async () => {
    setActionLoading(true);
    try {
      const res = await markPayrollAsPaid(id);
      if (res?.success && res.data) {
        setPayroll(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to mark payroll as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadPayslip(id);
    } catch (err) {
      alert(err.message || 'PDF Download not available for this record');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingState message="Loading payroll details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPayrollDetails} />;
  if (!payroll) return null;

  const empDisplay = getEmployeeDisplay(payroll.employeeId, payroll.employeeSnapshot);
  const monthStr = getMonthName(payroll.month);

  return (
    <div className="payroll-container">
      {/* Header Banner */}
      <div className="payroll-header">
        <div>
          <h1 className="payroll-header-title">Payroll Details</h1>
          <p className="payroll-header-subtitle">
            Pay run period: <strong>{monthStr} {payroll.year}</strong> | Employee: <strong>{empDisplay.label}</strong>
          </p>
        </div>
        <div className="payroll-header-actions">
          <button className="pr-btn pr-btn-secondary" onClick={() => navigate('/payroll/history')}>
            ← Back to History
          </button>
          <button
            className="pr-btn pr-btn-secondary"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : '📄 Download Payslip PDF'}
          </button>
          {payroll.status === 'Generated' && (
            <button
              className="pr-btn pr-btn-success"
              onClick={handleMarkPaid}
              disabled={actionLoading}
            >
              {actionLoading ? 'Updating...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      </div>

      {/* Main Breakdown Sheet */}
      <div className="payroll-sheet">
        <div className="sheet-header font-mono">
          <div>
            <span className="meta-label">RECORD ID</span>
            <div className="meta-val">{payroll._id}</div>
          </div>
          <div>
            <span className="meta-label">EMPLOYEE</span>
            <div className="meta-val">{empDisplay.code || '—'}</div>
            {empDisplay.name && <div style={{fontSize:'12px',color:'#64748b'}}>{empDisplay.name}</div>}
          </div>
          <div>
            <span className="meta-label">STATUS</span>
            <div style={{ marginTop: '4px' }}>
              <StatusBadge status={payroll.status} />
            </div>
          </div>
        </div>

        {/* Attendance Summary Strip */}
        <div className="attendance-strip">
          <div className="strip-item">
            <span>Days Present</span>
            <strong>{payroll.daysPresent} days</strong>
          </div>
          <div className="strip-item">
            <span>Total Working Days</span>
            <strong>{payroll.totalWorkingDays} days</strong>
          </div>
          <div className="strip-item">
            <span>Attendance Percentage</span>
            <strong>
              {((payroll.daysPresent / payroll.totalWorkingDays) * 100).toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* Itemized Grid */}
        <div className="sheet-body-grid">
          {/* Earnings Column */}
          <div className="column-box">
            <h3 className="column-title text-success">Earnings Breakdown</h3>
            <div className="item-row">
              <span>Basic Salary</span>
              <span>{formatCurrency(payroll.basicSalary)}</span>
            </div>
            <div className="item-row">
              <span>House Rent Allowance (HRA)</span>
              <span>{formatCurrency(payroll.hra)}</span>
            </div>
            <div className="item-row">
              <span>Special Allowances</span>
              <span>{formatCurrency(payroll.allowances)}</span>
            </div>
            <div className="item-row">
              <span>Bonus Payout</span>
              <span>{formatCurrency(payroll.bonus)}</span>
            </div>
            <div className="item-row total-item-row">
              <span>Gross Earnings</span>
              <span className="font-strong">{formatCurrency(payroll.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="column-box">
            <h3 className="column-title text-danger">Deductions Breakdown</h3>
            <div className="item-row">
              <span>Total Deductions</span>
              <span className="text-danger font-strong">-{formatCurrency(payroll.deductions)}</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <div className="item-row total-item-row">
              <span>Total Deductions</span>
              <span className="text-danger font-strong">-{formatCurrency(payroll.deductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Summary Band */}
        <div className="net-pay-banner">
          <div>
            <span className="net-label">FINAL NET PAYOUT</span>
            <div className="net-sublabel">Gross Earnings minus Deductions</div>
          </div>
          <div className="net-amount">{formatCurrency(payroll.netSalary)}</div>
        </div>

        {/* Meta Info Footer */}
        <div className="sheet-footer-meta">
          <div>
            <span>Payment Date:</span>
            <strong>
              {payroll.paymentDate
                ? new Date(payroll.paymentDate).toLocaleString('en-IN')
                : 'Not Yet Disbursed'}
            </strong>
          </div>
          <div>
            <span>Salary Ref ID:</span>
            <strong className="font-mono">{payroll.salaryId}</strong>
          </div>
          <div>
            <span>Generated At:</span>
            <strong>{new Date(payroll.createdAt).toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
