const API_BASE = "https://hrms-1-k152.onrender.com/api";

/* =========================
   AUTH HEADERS
========================= */

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* =========================
   RESPONSE HANDLER
========================= */

const handleResponse = async (res) => {
  const text = await res.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON response:", text);

      throw new Error(
        `Server returned an invalid response (${res.status}). ` +
        `Please check the API URL.`
      );
    }
  }

  if (!res.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors)
        ? data.errors.join(", ")
        : null) ||
      `Request failed (${res.status})`;

    throw new Error(errorMsg);
  }

  return data;
};

/* =========================================================
   SALARY APIs
========================================================= */

export const getAllSalaries = async () => {
  const res = await fetch(`${API_BASE}/salaries`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getSalaryById = async (id) => {
  const res = await fetch(`${API_BASE}/salaries/id/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getSalaryByEmployee = async (employeeId) => {
  const res = await fetch(`${API_BASE}/salaries/${employeeId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const createSalary = async (salaryData) => {
  const res = await fetch(`${API_BASE}/salaries`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(salaryData),
  });

  return handleResponse(res);
};

export const updateSalary = async (id, salaryData) => {
  const res = await fetch(`${API_BASE}/salaries/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(salaryData),
  });

  return handleResponse(res);
};

export const deactivateSalary = async (id) => {
  const res = await fetch(`${API_BASE}/salaries/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

/* =========================================================
   PAYROLL APIs
========================================================= */

export const getAllPayrolls = async () => {
  const res = await fetch(`${API_BASE}/payrolls`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getPayrollById = async (id) => {
  const res = await fetch(`${API_BASE}/payrolls/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getPayrollsByEmployee = async (employeeId) => {
  const res = await fetch(
    `${API_BASE}/payrolls/employee/${employeeId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

export const generatePayroll = async (payrollData) => {
  const res = await fetch(`${API_BASE}/payrolls/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payrollData),
  });

  return handleResponse(res);
};

export const markPayrollAsPaid = async (id) => {
  const res = await fetch(
    `${API_BASE}/payrolls/${id}/mark-paid`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

/* =========================================================
   PAYSLIP APIs
========================================================= */

export const getAllPayslips = async () => {
  const res = await fetch(`${API_BASE}/payslips`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getPayslipById = async (id) => {
  const res = await fetch(`${API_BASE}/payslips/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const getPayslipsByEmployee = async (employeeId) => {
  const res = await fetch(
    `${API_BASE}/payslips/employee/${employeeId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

export const generatePayslip = async (data) => {
  const res = await fetch(`${API_BASE}/payslips/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

export const updatePayslipStatus = async (id, data) => {
  const res = await fetch(
    `${API_BASE}/payslips/${id}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(res);
};

/* =========================================================
   DOWNLOAD PAYSLIP PDF
========================================================= */

export const downloadPayslip = async (payrollId) => {
  const token = localStorage.getItem("token");

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const res = await fetch(
    `${API_BASE}/payrolls/${payrollId}/download`,
    {
      method: "GET",
      headers,
    }
  );

  if (!res.ok) {
    let errMsg = "Failed to download payslip PDF";

    try {
      const errData = await res.json();
      errMsg = errData?.message || errMsg;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(errMsg);
  }

  const disposition =
    res.headers.get("Content-Disposition") || "";

  let filename = "payslip.pdf";

  const filenameMatch =
    disposition.match(/filename="?([^"]+)"?/);

  if (filenameMatch && filenameMatch[1]) {
    filename = filenameMatch[1];
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.style.display = "none";
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);

  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/* =========================================================
   DELETE PAYSLIP
========================================================= */

export const deletePayslip = async (id) => {
  const res = await fetch(
    `${API_BASE}/payslips/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  getAllSalaries,
  getSalaryById,
  getSalaryByEmployee,
  createSalary,
  updateSalary,
  deactivateSalary,

  getAllPayrolls,
  getPayrollById,
  getPayrollsByEmployee,
  generatePayroll,
  markPayrollAsPaid,

  getAllPayslips,
  getPayslipById,
  getPayslipsByEmployee,
  generatePayslip,
  updatePayslipStatus,
  downloadPayslip,
  deletePayslip,
};