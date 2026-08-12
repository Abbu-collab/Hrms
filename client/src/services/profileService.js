const PROFILE_URL = "/api/employees/profile";

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
  const token = localStorage.getItem("token");
  const res = await fetch("/api/departments", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await handleResponse(res);
  return {
    ...data,
    departments: data?.departments || data?.data || (Array.isArray(data) ? data : []),
  };
};

