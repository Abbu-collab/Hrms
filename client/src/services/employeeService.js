const API_BASE =
  "https://hrms-6k8j.onrender.com/api/employees";

/* =====================================================
   AUTH HEADERS
===================================================== */

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/* =====================================================
   HANDLE RESPONSE
===================================================== */

const handleResponse = async (res) => {
  const text = await res.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error(
        "Invalid JSON response from server:",
        text
      );

      throw new Error(
        `Server returned an invalid response (${res.status}).`
      );
    }
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${res.status}`
    );
  }

  return data;
};

/* =====================================================
   GET ALL EMPLOYEES
===================================================== */

export const getAllEmployees = async ({
  search = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("status", status);
  }

  params.append("page", page);
  params.append("limit", limit);

  const res = await fetch(
    `${API_BASE}?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

/* =====================================================
   CREATE EMPLOYEE
===================================================== */

export const createEmployee = async (employeeData) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(employeeData),
  });

  return handleResponse(res);
};

/* =====================================================
   GET EMPLOYEE BY ID
===================================================== */

export const getEmployeeById = async (id) => {
  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

/* =====================================================
   UPDATE EMPLOYEE
===================================================== */

export const updateEmployee = async (
  id,
  employeeData
) => {
  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    }
  );

  return handleResponse(res);
};

/* =====================================================
   DELETE EMPLOYEE
===================================================== */

export const deleteEmployee = async (id) => {
  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(res);
};

/* =====================================================
   UPDATE EMPLOYEE STATUS
===================================================== */

export const updateEmployeeStatus = async (
  id,
  employment_status
) => {
  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        employment_status,
      }),
    }
  );

  return handleResponse(res);
};