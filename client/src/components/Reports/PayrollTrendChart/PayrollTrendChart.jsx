import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./PayrollTrendChart.css";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function PayrollTrendChart({ data = [], loading = false, error = null }) {
  if (loading) {
    return <div className="chart-loading-state">Loading payroll trend...</div>;
  }

  if (error) {
    return (
      <div className="chart-error-state">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No payroll analytics available for this period.</div>;
  }

  // Sort by year and month
  const sortedData = [...data].sort((a, b) => {
    if (a._id.year !== b._id.year) return a._id.year - b._id.year;
    return a._id.month - b._id.month;
  });

  const maxVal = Math.max(
    ...sortedData.map((d) => Math.max(d.totalGrossPay || 0, d.totalNetPay || 0)),
    1000
  );

  const svgWidth = 650;
  const svgHeight = 280;
  const paddingX = 60;
  const paddingY = 40;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const pointsCount = sortedData.length;
  const stepX = pointsCount > 1 ? graphWidth / (pointsCount - 1) : 0;

  const grossPoints = sortedData.map((d, i) => {
    const x = pointsCount === 1 ? svgWidth / 2 : paddingX + i * stepX;
    const y = paddingY + graphHeight - ((d.totalGrossPay || 0) / maxVal) * graphHeight;
    return { x, y, val: d.totalGrossPay, item: d };
  });

  const netPoints = sortedData.map((d, i) => {
    const x = pointsCount === 1 ? svgWidth / 2 : paddingX + i * stepX;
    const y = paddingY + graphHeight - ((d.totalNetPay || 0) / maxVal) * graphHeight;
    return { x, y, val: d.totalNetPay, item: d };
  });

  const grossPath = grossPoints.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
    ""
  );

  const netPath = netPoints.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
    ""
  );

  return (
    <div className="payroll-trend-container">
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot gross-dot"></span>
          <span>Gross Pay</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot net-dot"></span>
          <span>Net Pay</span>
        </div>
      </div>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="trend-svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + graphHeight * (1 - ratio);
            const labelVal = maxVal * ratio;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {labelVal >= 1000 ? `${Math.round(labelVal / 1000)}k` : Math.round(labelVal)}
                </text>
              </g>
            );
          })}

          {/* Paths */}
          {sortedData.length > 1 && (
            <>
              <path d={grossPath} fill="none" stroke="#2563eb" strokeWidth="3" />
              <path d={netPath} fill="none" stroke="#059669" strokeWidth="3" />
            </>
          )}

          {/* Data Points */}
          {grossPoints.map((p, idx) => (
            <g key={`gross-${idx}`} className="chart-point-group">
              <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <title>{`Month: ${MONTH_NAMES[p.item._id.month]} ${p.item._id.year}\nGross Pay: ${formatCurrency(p.val)}\nEmployees: ${p.item.employeeCount}`}</title>
            </g>
          ))}

          {netPoints.map((p, idx) => (
            <g key={`net-${idx}`} className="chart-point-group">
              <circle cx={p.x} cy={p.y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              <title>{`Month: ${MONTH_NAMES[p.item._id.month]} ${p.item._id.year}\nNet Pay: ${formatCurrency(p.val)}\nEmployees: ${p.item.employeeCount}`}</title>
            </g>
          ))}

          {/* X Axis Labels */}
          {sortedData.map((d, i) => {
            const x = pointsCount === 1 ? svgWidth / 2 : paddingX + i * stepX;
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="12"
                fontWeight="500"
              >
                {`${MONTH_NAMES[d._id.month] || d._id.month}`}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
