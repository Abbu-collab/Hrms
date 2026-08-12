const API_BASE = "/api/analytics";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new Error(data?.message || "Analytics request failed");
  }
  return data;
};

// Summary Stats: GET /api/analytics/summary?year=2026
export const getSummaryStats = async (year = "") => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/summary${queryString}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Payroll Trend: GET /api/analytics/trend?year=2026
export const getPayrollTrend = async (year = "") => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/trend${queryString}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Department Breakdown: GET /api/analytics/department-breakdown?month=8&year=2026
export const getDepartmentBreakdown = async (month = "", year = "") => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/department-breakdown${queryString}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Top Earners: GET /api/analytics/top-earners?month=8&year=2026&limit=5
export const getTopEarners = async (month = "", year = "", limit = 5) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (limit) params.append("limit", limit);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/top-earners${queryString}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Deduction Breakdown: GET /api/analytics/deduction-breakdown?month=8&year=2026
export const getDeductionBreakdown = async (month = "", year = "") => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/deduction-breakdown${queryString}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
