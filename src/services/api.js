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
};

export default patientService;
