import axios from "axios";

const API_URL = "http://localhost:5000/api/leave";


// JWT Authorization Header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};


// Apply Leave
export const applyLeave = async (leaveData) => {
  const response = await axios.post(
    `${API_URL}/apply`,
    leaveData,
    getAuthHeader()
  );

  return response.data;
};


// Get Own Leave History (for the logged-in user only — works for all roles)
export const getLeaveHistory = async () => {
  const response = await axios.get(
    `${API_URL}/history`,
    getAuthHeader()
  );

  return response.data;
};


// Admin/HR management view: all employees' leave requests
export const getAdminAllLeaves = async () => {
  const response = await axios.get(
    `${API_URL}/admin/all`,
    getAuthHeader()
  );

  return response.data;
};


// Approve Leave
export const approveLeave = async (id) => {
  const response = await axios.put(
    `${API_URL}/approve/${id}`,
    {},
    getAuthHeader()
  );

  return response.data;
};


// Reject Leave
export const rejectLeave = async (id) => {
  const response = await axios.put(
    `${API_URL}/reject/${id}`,
    {},
    getAuthHeader()
  );

  return response.data;
};


// Cancel Leave
export const cancelLeave = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};