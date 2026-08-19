import axios from "axios";

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanEnv = envUrl.replace(/\/$/, "");
    return cleanEnv.endsWith("/api")
      ? `${cleanEnv}/biometric`
      : `${cleanEnv}/api/biometric`;
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
