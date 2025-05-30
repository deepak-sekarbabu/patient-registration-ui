import axios from 'axios';
import { baseApiClient } from './axiosInstance';

// Create a secure API client
const genericApiClient = baseApiClient;

// Add response interceptor for handling auth errors
genericApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized and there's a window object, redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // This will trigger the auth context to handle the session expiry
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'));

      // Modify the error message to ensure consistent error handling
      if (error.config?.url?.includes('/patients/login')) {
        error.message = 'Unauthorized: Invalid phone number or password';
      }
    }
    return Promise.reject(error);
  }
);

// ===================== DEPRECATED PATIENT METHODS =====================
// The following methods are deprecated and will be removed in a future release.
// Please use corresponding methods from authService instead.
// =======================================================================

const patientService = {
  /**
   * Check if a patient exists by phone number
   * @param {string} phoneNumber - The phone number to check
   * @returns {Promise<boolean>} - Whether the patient exists
   */
  checkPhoneExists: async (phoneNumber) => {
    try {
      const response = await genericApiClient.get(`/patients/exists-by-phone?phoneNumber=${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error checking phone number existence:', error);
      throw error;
    }
  },
  // Deprecated methods removed:
  // - registerPatient
  // - login
  // - loginPatient
  // - updatePatient
  // - changePassword
};

// Export the API client for other services to use
export { genericApiClient };

export default patientService;
