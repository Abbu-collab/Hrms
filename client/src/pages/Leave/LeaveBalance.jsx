import { useEffect, useState } from "react";
import { getMyLeaveBalance } from "../../services/leaveBalanceService";

export default function LeaveBalance() {
  const [balance, setBalance] = useState({
    annualTotal: 20,
    annualUsed: 0,
    annualRemaining: 20,
    sickTotal: 10,
    sickUsed: 0,
    sickRemaining: 10,
    casualTotal: 6,
    casualUsed: 0,
    casualRemaining: 6,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyLeaveBalance();
      if (res && res.success && res.balance) {
        setBalance(res.balance);
      }
    } catch (err) {
      console.error("Error fetching leave balance:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load leave balance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const cardsData = [
    {
      id: "annual",
      title: "Annual Leave",
      icon: "🏖️",
      total: balance.annualTotal ?? 20,
      used: balance.annualUsed ?? 0,
      remaining: balance.annualRemaining ?? 20,
      gradient: "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)",
      lightBg: "var(--primary-50)",
      accentColor: "var(--primary-600)",
      badgeClass: "badge-info",
    },
    {
      id: "sick",
      title: "Sick Leave",
      icon: "🤒",
      total: balance.sickTotal ?? 10,
      used: balance.sickUsed ?? 0,
      remaining: balance.sickRemaining ?? 10,
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      lightBg: "var(--success-bg)",
      accentColor: "var(--success)",
      badgeClass: "badge-success",
    },
    {
      id: "casual",
      title: "Casual Leave",
      icon: "☕",
      total: balance.casualTotal ?? 6,
      used: balance.casualUsed ?? 0,
      remaining: balance.casualRemaining ?? 6,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      lightBg: "var(--warning-bg)",
      accentColor: "var(--warning)",
      badgeClass: "badge-warning",
    },
  ];

  return (
    <div className="leave-balance-container">
      <div className="leave-balance-header">
        <div>
          <h2 className="leave-balance-title">Leave Balance Quotas</h2>
          <p className="leave-balance-subtitle">Overview of your allocated, used, and remaining annual leave balance</p>
        </div>
        <button className="btn-secondary" onClick={fetchBalance} title="Refresh Leave Balance">
          🔄 Refresh Quota
        </button>
      </div>

      {error && (
        <div className="status-message error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="leave-grid">
        {cardsData.map((card) => {
          const total = card.total > 0 ? card.total : 1;
          const percentage = Math.min(
            100,
            Math.max(0, Math.round((card.remaining / total) * 100))
          );

          return (
            <div key={card.id} className="leave-card">
              {/* Card Header */}
              <div className="leave-card-header">
                <div className="leave-icon-box" style={{ background: card.lightBg }}>
                  <span>{card.icon}</span>
                </div>
                <span className={`badge ${card.badgeClass}`}>
                  {card.title}
                </span>
              </div>

              {/* Balance Counter */}
              <div className="leave-counter">
                <div>
                  <span className="leave-count-huge">
                    {loading ? "..." : card.remaining}
                  </span>
                  <span className="leave-count-total"> / {card.total} Days</span>
                </div>
                <span className={`badge ${card.remaining > 0 ? "badge-success" : "badge-danger"}`}>
                  {card.remaining > 0 ? "Available" : "Exhausted"}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="leave-progress-track">
                <div
                  className="leave-progress-bar"
                  style={{
                    width: loading ? "0%" : `${percentage}%`,
                    background: card.gradient,
                  }}
                />
              </div>

              {/* Card Footer Details */}
              <div className="leave-card-footer">
                <div className="leave-footer-col">
                  <span className="leave-footer-label">Used</span>
                  <span className="leave-footer-val">
                    {loading ? "-" : `${card.used} Days`}
                  </span>
                </div>
                <div style={{ width: 1, height: 24, backgroundColor: 'var(--slate-200)' }} />
                <div className="leave-footer-col">
                  <span className="leave-footer-label">Remaining</span>
                  <span className="leave-footer-val" style={{ color: card.accentColor }}>
                    {loading ? "-" : `${card.remaining} Days`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
