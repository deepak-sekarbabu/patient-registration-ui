import axios from "axios";

const API_BASE_URL = "http://localhost:8080/v1/api";

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
   * @returns {Promise<{token: string, patient: object}>}
   */
  login: async (phone, password) => {
    // Accept both with and without country code for mock
    const normalizedPhone = phone.replace(/^\+91/, "");
    if (
      (phone === "1234567890" || normalizedPhone === "1234567890") &&
      password === "password"
    ) {
      // Mocked response
      return {
        token: "mock-token-123",
        patient: {
          fullName: "John Doe",
          phone: "1234567890",
        },
      };
    } else {
      throw new Error("Invalid credentials");
    }
  },

  /**
   * Update patient info
   * @param {string} token
   * @param {object} updatedData
   * @returns {Promise<object>}
   */
  updatePatient: async (token, updatedData) => {
    // Replace with real API call
    // Example: const response = await axios.put(`${API_BASE_URL}/patients/me`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
    // return response.data;
    return { ...updatedData };
  },
};

export default patientService;
