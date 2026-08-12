const API_BASE = "/api/reports";

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
    throw new Error(data?.message || "Report request failed");
  }
  return data;
};

// Generate Monthly Report: POST /api/reports/monthly
export const generateMonthlyReport = async (month, year) => {
  const res = await fetch(`${API_BASE}/monthly`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ month: Number(month), year: Number(year) }),
  });
  return handleResponse(res);
};

// Generate Yearly Report: POST /api/reports/yearly
export const generateYearlyReport = async (year) => {
  const res = await fetch(`${API_BASE}/yearly`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ year: Number(year) }),
  });
  return handleResponse(res);
};

// Generate Employee Report: POST /api/reports/employee
export const generateEmployeeReport = async (employeeId) => {
  const res = await fetch(`${API_BASE}/employee`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId }),
  });
  return handleResponse(res);
};

// Generate Department Report: POST /api/reports/department
export const generateDepartmentReport = async (department, month, year) => {
  const payload = { department };
  if (month) payload.month = Number(month);
  if (year) payload.year = Number(year);

  const res = await fetch(`${API_BASE}/department`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Get All Reports: GET /api/reports or GET /api/reports?reportType=...
export const getAllReports = async (reportType = "") => {
  const url = reportType ? `${API_BASE}?reportType=${encodeURIComponent(reportType)}` : API_BASE;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Get Report By ID: GET /api/reports/:id
export const getReportById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Export Report: GET /api/reports/:id/export (returns CSV)
export const exportReport = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/${id}/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { message: text }; }
    throw new Error(data?.message || "Export failed");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};
