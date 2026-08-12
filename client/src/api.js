const API_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/newEmp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_URL}/Emplogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const googleLoginUser = async (googleToken) => {
  const response = await fetch(`${API_URL}/googleLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: googleToken })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Google login failed');
  }

  return data;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : {
        'Content-Type': 'application/json'
      };
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load profile');
  }

  return data;
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/sendOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }

  return data;
};

export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_URL}/verifyOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }

  return data;
};

export const verifyOtpForEmail = async (email, otp) => {
  return verifyOtp(email, otp);
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_URL}/resetpassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      otp,
      newPassword
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }

  return data;
};