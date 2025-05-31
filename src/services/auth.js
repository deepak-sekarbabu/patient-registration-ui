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
    updateSessionActivity(); // Keep client-side activity tracking

    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // XSRF token logic removed as per plan for now.
    // If baseApiClient adds X-XSRF-TOKEN, it will persist unless explicitly removed here.

    // Debug log for Bearer token
    console.log('Auth API Request (Bearer):', {
      url: config.url,
      method: config.method,
      headers: {
        Authorization: config.headers['Authorization'] ? 'Bearer token set' : 'No Bearer token',
        'Content-Type': config.headers['Content-Type'],
        // Include X-XSRF-TOKEN in log if potentially still present from baseApiClient
        'X-XSRF-TOKEN': config.headers['X-XSRF-TOKEN'] || 'not-set',
      },
      withCredentials: config.withCredentials, // Inherits from baseApiClient, usually true.
                                               // Consider implications if backend strictly expects no credentials with Bearer tokens.
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// This response interceptor handles 401 errors (likely due to an expired JWT).
// It attempts to refresh the token using refreshToken(). If successful, the original request is retried.
// If token refresh fails, it triggers a logout.
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Condition to attempt refresh:
    // 1. Status is 401.
    // 2. Not already retried.
    // 3. URL is not the refresh endpoint itself (to prevent loops on refresh failure).
    // 4. URL is not the login endpoint (to prevent refresh attempts on initial login failure).
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/patients/login') // Avoid refresh on login 401
    ) {
      originalRequest._retry = true;
      // console.log('AUTH_SERVICE_INTERCEPTOR: Attempting token refresh for', originalRequest.url); // Using debugLog from plan
      console.log('AUTH_SERVICE_INTERCEPTOR: Attempting token refresh for', originalRequest.url); // debugLog not defined, using console.log
      try {
        await refreshToken(); // This should update 'jwt_token' in localStorage
        // console.log('AUTH_SERVICE_INTERCEPTOR: Token refresh successful, retrying original request.'); // Using debugLog from plan
        console.log('AUTH_SERVICE_INTERCEPTOR: Token refresh successful, retrying original request.'); // debugLog not defined, using console.log
        return authAxios(originalRequest); // Retry the original request, request interceptor will add new token
      } catch (refreshError) {
        // console.log('AUTH_SERVICE_INTERCEPTOR: Token refresh failed, logging out.', refreshError); // Using debugLog from plan
        console.log('AUTH_SERVICE_INTERCEPTOR: Token refresh failed, logging out.', refreshError); // debugLog not defined, using console.log
        // Pass no token to logout, as it might be invalid or already cleared.
        // authService.logout() will handle clearing client-side storage.
        await logout();
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Session management functions (updateSessionActivity, getSessionActivity, isSessionExpired, initSessionMonitoring)
// These can be kept for client-side inactivity detection if desired, independent of JWT expiry.
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

// refreshToken is called by the response interceptor when a 401 is received.
// Assumes the backend's /auth/refresh endpoint expects the (expired) JWT in the Authorization header
// and returns a new JWT if successful.
const refreshToken = async () => {
  try {
    // Prevent too many refresh attempts (existing logic)
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.warn('Refresh attempts too frequent, on cooldown');
      throw new Error('Token refresh on cooldown');
    }
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.warn('Max refresh attempts reached, forcing logout');
      throw new Error('Maximum refresh attempts reached');
    }
    refreshAttempts++;
    lastRefreshTime = now;

    // authAxios's request interceptor will add the current (likely expired) 'jwt_token' from localStorage.
    // Swagger for /auth/refresh does not specify a request body.
    const response = await authAxios.post('/auth/refresh');

    const newToken = response.data.token; // Expect backend to send { "token": "new_jwt_string" }
    if (!newToken) {
      throw new Error('Refresh endpoint did not return a new token.');
    }

    localStorage.setItem('jwt_token', newToken); // Store the new token
    updateSessionActivity(); // Update client-side activity timestamp
    refreshAttempts = 0; // Reset on success
    console.log('AUTH_SERVICE: Token refreshed successfully.');
    return newToken; // Return new token (interceptor doesn't directly use it, but good practice)
  } catch (error) {
    console.error('Token refresh failed in authService:', error);
    // This error is caught by the interceptor's catch(refreshError) block, which then calls logout().
    throw error;
  }
};

// validateToken: Called by AuthContext during initialization.
// Validates a given token by sending it to the backend's /auth/validate endpoint.
const validateToken = async (tokenToValidate) => {
  if (!tokenToValidate) {
    return { isValid: false, patient: null, error: 'No token provided for validation.' };
  }
  try {
    // Using axios.create() for this specific call to avoid authAxios interceptor
    // potentially using a different token from localStorage.
    // Swagger for POST /auth/validate expects token in body: { "token": "string" }
    // and does not specify cookie usage (so withCredentials: false is safer if not needed).
    const response = await axios.create({
        baseURL: API_BASE_URL,
        // withCredentials: false // Set if cookies are NOT involved in this specific endpoint
      })
      .post('/auth/validate', { token: tokenToValidate });

    // Assuming response.data is { "valid": true, "patient": { ... } } or { "valid": false, "message": "..." }
    if (response.data && typeof response.data.valid === 'boolean') {
      return {
        isValid: response.data.valid,
        patient: response.data.patient || null,
        error: response.data.valid ? null : (response.data.message || 'Token validation returned invalid.'),
      };
    }
    // If response format is unexpected
    return { isValid: false, patient: null, error: 'Invalid response from token validation endpoint.' };
  } catch (error) {
    console.error('Token validation API call failed:', error);
    return {
      isValid: false,
      patient: null,
      error: error.response?.data?.message || error.message || 'Token validation API error.',
    };
  }
};

// Login function
const login = async (phone, password) => {
  try {
    const response = await authAxios.post('/patients/login', {
      phoneNumber: phone,
      password: password,
    });

    const { patient, token } = response.data; // Expect 'token' in response.data
    if (!patient || !token) {
      throw new Error('Login response missing patient data or token');
    }
    const normalizedPatient = normalizePatientData(patient, phone);

    updateSessionActivity(); // Keep client-side activity tracking
    refreshAttempts = 0; // Reset refresh attempts on successful login

    // AuthContext will handle storing the token and patient data in localStorage.
    // Removed localStorage.setItem for patient_id and patient_phone here.

    return {
      patient: normalizedPatient,
      token: token, // Pass the token to AuthContext
    };
  } catch (error) {
    console.error('Login failed in authService:', error);
    // Ensure consistent error structure for AuthContext to handle.
    if (error.response && error.response.status === 401) {
      const authError = new Error('Unauthorized: Invalid phone number or password');
      authError.response = error.response; // Preserve response for potential use
      throw authError;
    } else {
      const generalError = new Error(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
      if (error.response) {
        generalError.response = error.response;
      }
      throw generalError;
    }
  }
};

// Register function
const register = async (patientData) => {
  try {
    const response = await authAxios.post('/patients', patientData);
    const { patient, token } = response.data; // Expect 'token' in response.data

    if (!patient || !token) {
      throw new Error('Registration response missing patient data or token');
    }
    const normalizedPatient = normalizePatientData(patient, patientData.phoneNumber);
    updateSessionActivity(); // Keep client-side activity tracking

    // AuthContext will handle storing the token and patient data in localStorage.
    return {
      patient: normalizedPatient,
      token: token,
    };
  } catch (error) {
    console.error('Registration failed in authService:', error);
    // Let AuthContext handle displaying the error, propagate it.
    throw error;
  }
};

// Logout function
// AuthContext passes the current token if available, for backend invalidation.
const logout = async (token) => {
  try {
    if (token) {
      // Backend /auth/logout: Swagger doesn't specify a body.
      // Assuming it relies on the Bearer token in the header for which session to invalidate.
      // Or, if it requires the token in the body, the call would be:
      // await authAxios.post('/auth/logout', { token: token });
      // For now, assume it uses the Bearer token from the interceptor.
      await authAxios.post('/auth/logout');
      console.log('AUTH_SERVICE: Backend logout called.');
    }
  } catch (error) {
    console.error('Error during backend logout:', error);
    // Important: Client-side cleanup should happen regardless of backend logout success.
  } finally {
    // Client-side cleanup MUST run.
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('patient_data');
    localStorage.removeItem(TOKEN_KEY); // session_last_active (client-side inactivity)
    localStorage.removeItem('patient_id');   // Legacy or specific use case item
    localStorage.removeItem('patient_phone');  // Legacy or specific use case item
    localStorage.removeItem('last_login_success'); // Legacy or specific use case item

    console.log('AUTH_SERVICE: Client-side logout - cleared localStorage items for Bearer token auth.');
    refreshAttempts = 0; // Reset refresh attempts on any logout.
  }
};

// Update patient function
const updatePatient = async (updatedData) => {
  try {
    // Use authAxios, which handles CSRF.
    const response = await authAxios.put(`/patients/${updatedData.id}`, updatedData);
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
  validateToken, // Added validateToken
  login,
  register,
  logout,
  updatePatient,
  refreshToken,
  changePassword,
  initSessionMonitoring, // Kept for client-side inactivity checks
  isSessionExpired,      // Kept for client-side inactivity checks
  // validateSession, // validateSession is replaced by validateToken for JWT flow
};

export default authService;

// Removed debugLog import as it's not explicitly used in the provided snippets.
// If it's used elsewhere in this file, it should be kept.
// For the purpose of this diff, assuming it's not used in the changed parts.
// import { debugLog } from '../utils/debugUtils'; // If used, ensure it's present.
