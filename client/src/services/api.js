const API_URL = "/api";

const parseJsonSafely = async (res) => {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const requestJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await parseJsonSafely(res);

    if (!res.ok) {
      throw new Error(data?.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch");
    }
    throw new Error("Failed to fetch");
  }
};

export const verifyPasskey = async (passkey) => {
  return requestJson(`${API_URL}/passkey`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ passkey })
  });
};

export const getPublicDepartments = async () => {
  return requestJson(`${API_URL}/departments/public/list`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
};

export const getPublicRoles = async () => {
  return requestJson(`${API_URL}/roles/public/list`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
};

export const registerUser = async (userData) => {
  return requestJson(`${API_URL}/newEmp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
};



export const loginUser = async (loginData) => {
  return requestJson(`${API_URL}/Emplogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
  });
};



export const googleLoginUser = async (token) => {
  return requestJson(`${API_URL}/googleLogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token })
  });
};



const authHeaders=()=>{

 const token=localStorage.getItem("token");


 return {
   "Content-Type":"application/json",
   Authorization:`Bearer ${token}`
 };

};



export const getProfile = async () => {
  return requestJson(`${API_URL}/profile`, {
    method: "GET",
    headers: authHeaders()
  });
};



export const updateProfile = async (profileData) => {
  return requestJson(`${API_URL}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(profileData)
  });
};



export const sendOtp = async (email) => {
  return requestJson(`${API_URL}/sendOtp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });
};


export const verifyOtp = async (email, otp) => {
  return requestJson(`${API_URL}/verifyOtp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      otp
    })
  });
};


export const resetPassword = async (data) => {
  return requestJson(`${API_URL}/resetpassword`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const changePassword = async (passwordData) => {
  return requestJson(`${API_URL}/change-password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(passwordData)
  });
};