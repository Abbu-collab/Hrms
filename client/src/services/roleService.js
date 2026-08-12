const API_BASE = "/api/roles";

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

// Get All Roles
export const getRoles = async () => {
  const res = await fetch(API_BASE, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

// Get Role By ID
export const getRoleById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

// Create Role
export const addRole = async (role) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(role),
  });

  return handleResponse(res);
};

// Update Role
export const updateRole = async (id, role) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(role),
  });

  return handleResponse(res);
};

// Delete Role
export const deleteRole = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};