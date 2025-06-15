import { genericApiClient } from './api';

export const getPatientAppointments = async (patientId, token) => {
  try {
    const response = await genericApiClient.get(`/appointments/patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
