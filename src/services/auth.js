import axios from 'axios';
// import Cookies from 'js-cookie';
import { baseApiClient } from './axiosInstance'; // Import baseApiClient

// Remove unused import to fix ESLint warning
// import patientService from './api';

const API_BASE_URL = 'http://localhost:8080/v1/api'; // Keep for refreshToken special case
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_KEY = 'session_last_active';

// Use baseApiClient for auth operations, inheriting its config and CSRF interceptor
const authAxios = baseApiClient;

// Add request interceptor for auth headers
authAxios.interceptors.request.use(
  (config) => {
    // Update session activity timestamp
    updateSessionActivity();

    // For testing purposes: Get token from local storage and add as Bearer token
    // Note: The application primarily uses HttpOnly cookies for authentication
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // The CSRF token is handled by baseApiClient\'s interceptor.

    // Debug log the request headers
    console.log('Auth API Request:', {
      url: config.url,
      method: config.method,
      headers: {
        'X-XSRF-TOKEN': config.headers['X-XSRF-TOKEN'] || 'not-set', // Should be set by baseApiClient
        Authorization: config.headers['Authorization'] ? 'set (Bearer token)' : 'not-set', // Should NOW be set by this interceptor for testing
        'Content-Type': config.headers['Content-Type'],
      },
      withCredentials: config.withCredentials, // Should be true from baseApiClient
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token (401) and we haven't tried to refresh yet
    // AND the request URL is not the refresh token endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        await refreshToken();
        // Retry the original request
        return authAxios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        console.log('Token refresh failed, logging out');
        logout();
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Session management functions
const updateSessionActivity = () => {
  localStorage.setItem(TOKEN_KEY, Date.now().toString());
};

const getSessionActivity = () => {
  return parseInt(localStorage.getItem(TOKEN_KEY) || '0', 10);
};

const isSessionExpired = () => {
  const lastActivity = getSessionActivity();
  if (!lastActivity) return true;

  const currentTime = Date.now();
  return currentTime - lastActivity > SESSION_TIMEOUT;
};

// Check session status periodically
const initSessionMonitoring = (onExpire) => {
  const interval = setInterval(() => {
    if (isSessionExpired()) {
      clearInterval(interval);
      onExpire();
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
};

// Keep track of refresh attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds

// Refresh token function
const refreshToken = async () => {
  try {
    // Prevent too many refresh attempts in a short time
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.log('Refresh attempts too frequent, on cooldown');
      throw new Error('Token refresh on cooldown');
    }

    // Prevent infinite refresh loops
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.log('Max refresh attempts reached, forcing logout');
      throw new Error('Maximum refresh attempts reached');
    }

    refreshAttempts++;
    lastRefreshTime = now;

    // Create a new instance for this request to avoid interceptors
    const response = await axios
      .create({
        baseURL: API_BASE_URL,
        withCredentials: true,
      })
      .post('/auth/refresh');

    // The server should set a new HttpOnly cookie
    updateSessionActivity();

    // Reset refresh attempts on success
    refreshAttempts = 0;

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Validate current session
const validateSession = async () => {
  try {
    if (isSessionExpired()) {
      return { isValid: false };
    }

    const response = await authAxios.get('/auth/validate');
    if (response.data.valid) {
      updateSessionActivity();
    }
    return {
      isValid: response.data.valid,
      patient: response.data.patient,
      token: response.data.token,
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return { isValid: false };
  }
};

// Login function
const login = async (phone, password) => {
  try {
    // Use authAxios for login, it now inherits CSRF handling and doesn't add Auth header
    const response = await authAxios.post('/patients/login', {
      phoneNumber: phone,
      password: password,
    });

    // Extract patient and token from the new backend response format
    const { patient, token } = response.data; // Assuming token is still sent for HttpOnly cookie setting by backend
    if (!patient) {
      // Token might not be in response body if HttpOnly
      throw new Error('Login response missing patient data');
    }
    const normalizedPatient = normalizePatientData(patient, phone);

    // Initialize session activity timestamp
    updateSessionActivity();

    // Reset refresh attempts on successful login
    refreshAttempts = 0;

    // Store backup data in localStorage
    localStorage.setItem('patient_id', normalizedPatient.id || '');
    localStorage.setItem('patient_phone', normalizedPatient.phone || phone);

    // DO NOT store token in localStorage anymore, it's HttpOnly
    // localStorage.setItem('auth_token', token || '');

    // The backend is expected to set the HttpOnly cookie.
    // Cookies.set('accessToken', token, { ... }); // This was for client-side cookie, no longer primary method

    return {
      patient: normalizedPatient,
      // token: token || '', // Token is no longer returned to client like this
    };
  } catch (error) {
    console.error('Login failed:', error);
    // Check for 401 Unauthorized specifically
    if (error.response && error.response.status === 401) {
      const authError = new Error('Unauthorized: Invalid phone number or password');
      authError.response = error.response;
      console.log('Throwing unauthorized error:', authError.message);
      throw authError;
    } else {
      const generalError = new Error(
        error.response?.data?.message || 'Invalid phone number or password'
      );
      if (error.response) {
        generalError.response = error.response;
      }
      console.log('Throwing general error:', generalError.message);
      throw generalError;
    }
  }
};

// Register function
const register = async (patientData) => {
  try {
    const response = await authAxios.post('/patients', patientData);

    // Normalize patient object
    const normalizedPatient = normalizePatientData(response.data, patientData.phoneNumber);

    // Initialize session activity timestamp
    //updateSessionActivity();

    return {
      patient: normalizedPatient,
      token: response.data.token || '',
    };
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Logout function
const logout = async () => {
  try {
    // Call backend to invalidate session
    await authAxios.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Clear all session data from localStorage regardless of server response
    localStorage.removeItem(TOKEN_KEY);
    // localStorage.removeItem('auth_token'); // No longer storing auth_token here
    localStorage.removeItem('patient_data');
    localStorage.removeItem('patient_id');
    localStorage.removeItem('patient_phone');
    localStorage.removeItem('patient');
    localStorage.removeItem('token');
    localStorage.removeItem('last_login_success');

    console.log('AUTH_SERVICE: Logout complete - cleared all localStorage items');
  }
};

// Update patient function
const updatePatient = async (updatedData) => {
  try {
    // For testing purposes: Get token from local storage and add as Bearer token
    // Note: The application primarily uses HttpOnly cookies for authentication
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Use authAxios, which handles CSRF. Add the Authorization header for testing.
    const response = await authAxios.put(`/patients/${updatedData.id}`, updatedData, { headers });
    return normalizePatientData(response.data);
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// Helper function to normalize patient data
const normalizePatientData = (patientData, phoneNumber = '') => {
  let normalizedPatient = {
    fullName: '',
    phone: phoneNumber || '',
    ...patientData,
  };

  // Extract data from the API response format which has personalDetails
  if (patientData && patientData.personalDetails) {
    normalizedPatient.fullName = patientData.personalDetails.name || '';
    normalizedPatient.phone = patientData.personalDetails.phoneNumber || phoneNumber || '';
    normalizedPatient.email = patientData.personalDetails.email || '';
    normalizedPatient.birthdate = patientData.personalDetails.birthdate || '';
    normalizedPatient.age = patientData.personalDetails.age || '';
    normalizedPatient.address = patientData.personalDetails.address || {};
    normalizedPatient.sex = patientData.personalDetails.sex || '';
    normalizedPatient.occupation = patientData.personalDetails.occupation || '';
  }

  return normalizedPatient;
};

// Change password function
const changePassword = async (id, newPassword) => {
  try {
    await authAxios.post(`/patients/${id}/password`, { newPassword });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

const authService = {
  validateSession,
  login,
  register,
  logout,
  updatePatient,
  refreshToken,
  changePassword,
  initSessionMonitoring,
  isSessionExpired,
};

export default authService;
