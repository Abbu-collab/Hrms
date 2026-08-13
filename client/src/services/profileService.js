const API_BASE = "https://hrms-1-k152.onrender.com/api";

const PROFILE_URL = `${API_BASE}/employees/profile`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const text = await res.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Server returned an invalid response (${res.status}). Please check the API URL.`
    );
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export const getMyEmployeeProfile = async () => {
  const res = await fetch(PROFILE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

export const updateMyEmployeeProfile = async (profileData) => {
  const res = await fetch(PROFILE_URL, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  return handleResponse(res);
};

export const getAllDepartments = async () => {
  const res = await fetch(`${API_BASE}/departments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(res);

  return {
    ...data,
    departments:
      data?.departments ||
      data?.data ||
      (Array.isArray(data) ? data : []),
  };
};