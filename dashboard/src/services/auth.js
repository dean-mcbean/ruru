// src/services/auth.js
import axios from 'axios';

const API = process.env.VUE_APP_BASE_API_URL;

const errorWrapper = async (promise) => {
  try {
    return await promise;
  } catch (e) {
    let msg = 'Unknown error';
    if (e.response && e.response.data && typeof e.response.data === 'object') {
      msg = e.response.data.error || JSON.stringify(e.response.data);
    } else if (typeof e.response?.data === 'string') {
      msg = 'Server error. Please try again.';
    }
    throw new Error(msg);
  }
}

export async function signup(email) {
  return errorWrapper(axios.post(`${API}/signup`, { email }));
}

export async function verify(email, code) {
  return errorWrapper(axios.post(`${API}/verify`, { email, code }));
}

export async function refresh(refreshToken) {
  return errorWrapper(axios.post(`${API}/refresh`, { refreshToken }));
}

export async function logout(email) {
  return errorWrapper(axios.post(`${API}/logout`, { email }));
}

export async function refreshAccessToken() {
  console.log('Refreshing access token...');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await refresh(refreshToken);
    localStorage.setItem('accessToken', res.data.accessToken);
    return res.data;
  } catch {
    // Redirect to login
    return false;
  }
}

export async function handleLogout(email) {
  await logout(email);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login
  window.location.href = '/dashboard/login';
}