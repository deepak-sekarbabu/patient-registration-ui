import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8080/v1/api";

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  return Cookies.get("XSRF-TOKEN");
};

// Add CSRF token to all requests
axios.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = csrfToken;
  }
  return config;
});

const patientService = {
  /**
   * Register a new patient
   * @param {Object} patientData - The patient registration data
   * @returns {Promise} - The API response
   */
  registerPatient: async (patientData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patients`,
        patientData
      );
      return response.data;
    } catch (error) {
      console.error("Error registering patient:", error);
      throw error;
    }
  },

  /**
   * Login patient
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<Object>} The patient data with token
   */
  login: async (phone, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients/login`, {
        phoneNumber: phone,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error("API login error:", error);
      throw error;
    }
  },

  /**
   * Login patient
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<Object>} The patient data with token
   */
  loginPatient: async (phone, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients/login`, {
        phoneNumber: phone,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error("Error logging in patient:", error);
      throw new Error("Invalid phone number or password");
    }
  },

  /**
   * Update patient info
   * @param {string} token
   * @param {object} updatedData
   * @returns {Promise<object>}
   */
  updatePatient: async (token, updatedData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/patients/${updatedData.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating patient information:", error);
      throw error;
    }
  },

  /**
   * Check if a patient exists by phone number
   * @param {string} phoneNumber - The phone number to check
   * @returns {Promise<boolean>} - Whether the patient exists
   */
  checkPhoneExists: async (phoneNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/exists-by-phone?phoneNumber=${phoneNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking phone number existence:", error);
      throw error;
    }
  },
};

export default patientService;
