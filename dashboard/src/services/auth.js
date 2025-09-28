// src/services/auth.js
import axios from 'axios';

const API = '/dash-api';

export async function signup(email) {
  return axios.post(`${API}/signup`, { email });
}

export async function verify(email, code) {
  return axios.post(`${API}/verify`, { email, code });
}

export async function refresh(refreshToken) {
  return axios.post(`${API}/refresh`, { refreshToken });
}

export async function logout(email) {
  return axios.post(`${API}/logout`, { email });
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await refresh(refreshToken);
    localStorage.setItem('accessToken', res.data.accessToken);
    return true;
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