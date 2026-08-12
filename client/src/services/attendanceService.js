import axios from "axios";

const API = "http://localhost:5000/api/attendance";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Check In
export async function checkIn(data) {
  const response = await axios.post(
    `${API}/check-in`,
    data,
    getAuthConfig()
  );

  return response.data;
}

// Check Out
export async function checkOut() {
  const response = await axios.post(
    `${API}/check-out`,
    {},
    getAuthConfig()
  );

  return response.data;
}

// Today's Attendance
export async function getTodayAttendance() {
  const response = await axios.get(
    `${API}/today`,
    getAuthConfig()
  );

  return response.data;
}

// Attendance History
export async function getAttendanceHistory() {
  const response = await axios.get(
    `${API}/history`,
    getAuthConfig()
  );

  return response.data;
}

// Monthly Attendance
export async function getMonthlyAttendance(year, month) {
  const response = await axios.get(
    `${API}/month/${year}/${month}`,
    getAuthConfig()
  );

  return response.data;
}

// Attendance Calendar
export async function getAttendanceCalendar(year, month) {
  const response = await axios.get(
    `${API}/calendar/${year}/${month}`,
    getAuthConfig()
  );

  return response.data;
}

// Admin: All Employees Attendance
export async function getAllAttendanceAdmin({ status, employeeId } = {}) {
  const params = {};
  if (status) params.status = status;
  if (employeeId) params.employeeId = employeeId;

  const config = {
    ...getAuthConfig(),
    params,
  };

  const response = await axios.get(`${API}/admin/all`, config);
  return response.data;
}