const API_BASE = "/api/departments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

// Get All Departments
export const getDepartments = async () => {
  const res = await fetch(API_BASE, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

// Get Department By ID
export const getDepartmentById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

// Create Department
export const addDepartment = async (department) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(department),
  });

  return handleResponse(res);
};

// Update Department
export const updateDepartment = async (id, department) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(department),
  });

  return handleResponse(res);
};

// Delete Department
export const deleteDepartment = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};