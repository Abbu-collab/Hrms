import axios from "axios";

const API = "https://hrms-1-k152.onrender.com/api/notifications";

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getNotifications = async () => {
  const res = await axios.get(API, getAuthConfig());
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axios.put(`${API}/${id}/read`, {}, getAuthConfig());
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.put(`${API}/read-all`, {}, getAuthConfig());
  return res.data;
};
