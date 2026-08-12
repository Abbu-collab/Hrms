const API_BASE = "/api/employees";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return{
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if(!res.ok){
    throw new Error(data?.message || "Request failed");
  }
  return data;
};

export const getAllEmployees = async ({
  search = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams();
  if(search){
    params.append("search", search);
  }
  if(status){
    params.append("status", status);
  }
  params.append("page", page);
  params.append("limit", limit);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createEmployee = async (employeeData) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(employeeData),
  });
  return handleResponse(res);
};

export const getEmployeeById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateEmployee = async (id, employeeData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(employeeData),
  });
  return handleResponse(res);
};

export const deleteEmployee = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateEmployeeStatus = async (id, employment_status) => {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ employment_status }),
  });
  return handleResponse(res);
};
