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
   * @returns {Promise<Object>} The patient data with token
   */
  login: async (phone, password) => {
    try {
      // Call the actual API endpoint
      const response = await axios.post(`${API_BASE_URL}/patients/login`, {
        phoneNumber: phone,
        password: password,
      });

      // If the API request is successful, return the data
      return response.data;
    } catch (error) {
      console.error("API login error:", error);

      // If the API request fails, fall back to mock data for demo purposes
      const normalizedPhone = phone.replace(/^\+91/, "");
      if (
        (phone === "1234567890" || normalizedPhone === "1234567890") &&
        password === "password"
      ) {
        // Mocked response based on the expected API format
        return {
          id: 1,
          phoneNumber: "1234567890",
          personalDetails: {
            name: "John Doe",
            phoneNumber: "+911234567890",
            email: "john.doe@example.com",
            birthdate: "1985-01-01",
            sex: "M",
            address: {
              street: "123 Main St",
              city: "Mumbai",
              state: "Maharashtra",
              postalCode: "400001",
              country: "India",
            },
            occupation: "Software Engineer",
            age: 38,
          },
          medicalInfo: {
            bloodGroup: "O+",
            allergies: [],
            existingConditions: [],
            currentMedications: [],
          },
          token: "mock-token-123",
        };
      } else {
        throw error;
      }
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
