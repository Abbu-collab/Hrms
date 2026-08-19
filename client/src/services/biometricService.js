import axios from "axios";

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/biometric`;
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "/api/biometric";
  }
  return "https://hrms-6k8j.onrender.com/api/biometric";
};

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function getBiometricStatus() {
  const response = await axios.get(`${getApiBase()}/status`, getAuthConfig());
  return response.data;
}

export async function enrollFace(faceEmbedding) {
  const response = await axios.post(
    `${getApiBase()}/enroll`,
    { faceEmbedding },
    getAuthConfig()
  );
  return response.data;
}

export async function verifyFace(faceEmbedding) {
  const response = await axios.post(
    `${getApiBase()}/verify`,
    { faceEmbedding },
    getAuthConfig()
  );
  return response.data;
}

export async function resetFace(targetEmployeeId = null) {
  const response = await axios.post(
    `${getApiBase()}/reset`,
    { targetEmployeeId },
    getAuthConfig()
  );
  return response.data;
}
