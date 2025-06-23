import axios from 'axios';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_KEY = 'session_last_active';

// Create an axios instance with default config
const authAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Axios response interceptor for handling 401 errors (expired JWT).
 * Attempts token refresh and retries the original request if possible.
 * If refresh fails, triggers logout and session expiration event.
 */
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
      !originalRequest.url.includes('/auth/login') // Avoid refresh on login 401
    ) {
      originalRequest._retry = true;
      console.log('AUTH_SERVICE_INTERCEPTOR: Attempting token refresh for', originalRequest.url);
      try {
        await refreshToken(); // This should update 'jwt_token' in localStorage
        console.log(
          'AUTH_SERVICE_INTERCEPTOR: Token refresh successful, retrying original request.'
        );
        return authAxios(originalRequest); // Retry the original request, request interceptor will add new token
      } catch (refreshError) {
        console.log('AUTH_SERVICE_INTERCEPTOR: Token refresh failed, logging out.', refreshError);
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

/**
 * Attempts to refresh the JWT using the backend's /auth/refresh endpoint.
 * Limits refresh attempts and enforces cooldown to prevent infinite loops.
 * @returns {Promise<string>} The new JWT token if successful.
 * @throws {Error} If refresh fails or is on cooldown.
 */
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
    const response = await axios
      .create({
        baseURL: process.env.REACT_APP_API_URL,
      })
      .post('/auth/validate', { token: tokenToValidate });

    if (response.data && typeof response.data.valid === 'boolean') {
      return {
        isValid: response.data.valid,
        patient: response.data.patient || null,
        error: response.data.valid
          ? null
          : response.data.message || 'Token validation returned invalid.',
      };
    }
    return {
      isValid: false,
      patient: null,
      error: 'Invalid response from token validation endpoint.',
    };
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
    const response = await authAxios.post('/auth/login', {
      phoneNumber: phone.replace(/^\+91/, ''), // Strip +91 prefix if present
      password: password,
    });

    const { patient, token } = response.data; // Expect 'token' in response.data
    if (!patient || !token) {
      throw new Error('Login response missing patient data or token');
    }
    const normalizedPatient = normalizePatientData(patient, phone);

    updateSessionActivity(); // Keep client-side activity tracking
    refreshAttempts = 0; // Reset refresh attempts on successful login

    return {
      patient: normalizedPatient,
      token: token, // Pass the token to AuthContext
    };
  } catch (error) {
    console.error('Login failed in authService:', error);
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
    // Make the registration request
    const response = await authAxios.post('/patients', patientData);

    // If we get here, the request was successful (status 2xx)
    // The API might return the created patient data, but we don't depend on it
    // Just return the patient data we sent (plus any server-generated fields)
    return {
      ...patientData,
      ...(response.data || {}), // Include any data sent back by the server
      id: response.data?.id, // Make sure to include the server-generated ID if it exists
    };
  } catch (error) {
    console.error('Registration failed in authService:', error);
    // If the error has a response with data, include it in the error
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

// Logout function
const logout = async (token) => {
  try {
    if (token) {
      await authAxios.post('/auth/logout');
      console.log('AUTH_SERVICE: Backend logout called.');
    }
  } catch (error) {
    console.error('Error during backend logout:', error);
  } finally {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('patient_data');
    localStorage.removeItem(TOKEN_KEY); // session_last_active (client-side inactivity)
    localStorage.removeItem('patient_id'); // Legacy or specific use case item
    localStorage.removeItem('patient_phone'); // Legacy or specific use case item
    localStorage.removeItem('last_login_success'); // Legacy or specific use case item

    console.log(
      'AUTH_SERVICE: Client-side logout - cleared localStorage items for Bearer token auth.'
    );
    refreshAttempts = 0; // Reset refresh attempts on any logout.
  }
};

// Update patient function
const updatePatient = async (updatedData) => {
  try {
    const response = await authAxios.put(`/patients/${updatedData.id}`, updatedData);
    const updatedPatient = normalizePatientData(response.data);
    localStorage.setItem('patient_data', JSON.stringify(updatedPatient));
    return updatedPatient;
  } catch (error) {
    console.error('Update failed in authService:', error);
    throw error;
  }
};

/**
 * Helper function to normalize patient data from API responses.
 * Ensures consistent structure for use throughout the app.
 * @param {object} patientData
 * @param {string} phoneNumber
 * @returns {object} Normalized patient object
 */
const normalizePatientData = (patientData, phoneNumber = '') => {
  let normalizedPatient = {
    fullName: '',
    phone: phoneNumber || '',
    ...patientData,
  };

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

/**
 * Checks if a phone number exists in the backend.
 * Handles both boolean and object API responses, and 404 as 'not exists'.
 * @param {string} phoneNumber
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
const checkPhoneNumberExists = async (phoneNumber) => {
  try {
    // Ensure phoneNumber is a plain string without any country code prefixes
    // if the backend expects a 10-digit number.
    // The registration form already stores it as digitsOnly, which is good.
    const response = await authAxios.get(`/patients/exists-by-phone?phoneNumber=${phoneNumber}`);
    // Assuming the API returns a body like { "exists": true } or { "exists": false }
    // Or simply a 200 OK if it exists and 404 if not.
    // If it returns 200 and a boolean body:
    // Handle both object with exists property and direct boolean response
    if (typeof response.data === 'boolean') {
      return response.data;
    }
    if (response.data && typeof response.data.exists === 'boolean') {
      return response.data.exists;
    }
    // If response is not in expected format, log warning and return false
    console.warn('Unexpected response format from exists-by-phone endpoint:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // If the API returns 404 for "does not exist", this is not an error for our check.
      return false;
    }
    console.error('Error checking phone number existence:', error.response?.data || error.message);
    // Re-throw the error or return a value indicating an error occurred, e.g., throw error;
    // For now, let's return false and log, but for robustness, throwing might be better
    // so the calling function knows the check itself failed.
    // However, the plan is to redirect if true, do nothing if false. So false on error is "safe".
    return false; // Treat errors in check as "does not exist" for simplicity of calling code, but log it.
  }
};

const authService = {
  validateToken,
  login,
  register,
  logout,
  updatePatient,
  refreshToken,
  changePassword,
  initSessionMonitoring,
  isSessionExpired,
  checkPhoneNumberExists, // Add the new function here
};

export default authService;
