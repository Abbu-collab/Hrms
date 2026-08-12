const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const errorMsg = data?.message || data?.error || (data?.errors ? data.errors.join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
};

// ================= SALARY APIs =================

export const getAllSalaries = async () => {
  const res = await fetch(`${API_BASE}/salaries`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getSalaryById = async (id) => {
  const res = await fetch(`${API_BASE}/salaries/id/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getSalaryByEmployee = async (employeeId) => {
  const res = await fetch(`${API_BASE}/salaries/${employeeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createSalary = async (salaryData) => {
  const res = await fetch(`${API_BASE}/salaries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(salaryData),
  });
  return handleResponse(res);
};

export const updateSalary = async (id, salaryData) => {
  const res = await fetch(`${API_BASE}/salaries/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(salaryData),
  });
  return handleResponse(res);
};

export const deactivateSalary = async (id) => {
  const res = await fetch(`${API_BASE}/salaries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ================= PAYROLL APIs =================

export const getAllPayrolls = async () => {
  const res = await fetch(`${API_BASE}/payrolls`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getPayrollById = async (id) => {
  const res = await fetch(`${API_BASE}/payrolls/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getPayrollsByEmployee = async (employeeId) => {
  const res = await fetch(`${API_BASE}/payrolls/employee/${employeeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const generatePayroll = async (payrollData) => {
  const res = await fetch(`${API_BASE}/payrolls/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payrollData),
  });
  return handleResponse(res);
};

export const markPayrollAsPaid = async (id) => {
  const res = await fetch(`${API_BASE}/payrolls/${id}/mark-paid`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ================= PAYSLIP APIs =================

export const getAllPayslips = async () => {
  const res = await fetch(`${API_BASE}/payslips`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getPayslipById = async (id) => {
  const res = await fetch(`${API_BASE}/payslips/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getPayslipsByEmployee = async (employeeId) => {
  const res = await fetch(`${API_BASE}/payslips/employee/${employeeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const generatePayslip = async (data) => {
  const res = await fetch(`${API_BASE}/payslips/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updatePayslipStatus = async (id, data) => {
  const res = await fetch(`${API_BASE}/payslips/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const downloadPayslip = async (payrollId) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Use the new /api/payrolls/:id/download endpoint that generates PDF directly
  const res = await fetch(`${API_BASE}/payrolls/${payrollId}/download`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    let errMsg = 'Failed to download payslip PDF';
    try {
      const errData = await res.json();
      errMsg = errData?.message || errMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg);
  }

  // Extract filename from Content-Disposition header if available
  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = 'payslip.pdf';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  if (filenameMatch && filenameMatch[1]) {
    filename = filenameMatch[1];
  }

  // Get blob from response and trigger browser download
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

export const deletePayslip = async (id) => {
  const res = await fetch(`${API_BASE}/payslips/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

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
