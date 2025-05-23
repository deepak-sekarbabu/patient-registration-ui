import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientRegistrationForm from './components/PatientRegistration/PatientRegistrationForm';
import LoginForm from './components/LoginForm';
import PatientInfo from './components/PatientInfo';
import patientService from './services/api';

function App() {
  const [auth, setAuth] = useState(() => {
    // Try to load from localStorage
    const token = localStorage.getItem('token');
    const patient = localStorage.getItem('patient');
    return token && patient ? { token, patient: JSON.parse(patient) } : null;
  });
  const [patient, setPatient] = useState(auth ? auth.patient : null);
  // Refresh auth state when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedPatient = localStorage.getItem('patient');
    if (token && storedPatient) {
      const parsedPatient = JSON.parse(storedPatient);
      setAuth({ token, patient: parsedPatient });
      setPatient(parsedPatient);
    }
  }, []);

  const handleLogin = async (phone, password) => {
    try {
      const response = await patientService.login(phone, password);

      // Safely extract token and patient data
      const token = response.token || '';

      // For the new API response format, the patient data is the response itself
      const patientData = response || {};

      // Normalize patient object for PatientInfo
      let normalizedPatient = {
        fullName: '',
        phone: phone || '',
        ...patientData,
      };

      // Extract data from the API response format which has personalDetails
      if (patientData && patientData.personalDetails) {
        normalizedPatient.fullName = patientData.personalDetails.name || '';
        normalizedPatient.phone = patientData.personalDetails.phoneNumber || phone || '';
        normalizedPatient.email = patientData.personalDetails.email || '';
        normalizedPatient.birthdate = patientData.personalDetails.birthdate || '';
        normalizedPatient.age = patientData.personalDetails.age || '';
        normalizedPatient.address = patientData.personalDetails.address || {};
      }

      setAuth({ token, patient: normalizedPatient });
      setPatient(normalizedPatient);
      localStorage.setItem('token', token);
      localStorage.setItem('patient', JSON.stringify(normalizedPatient));
      return true; // Indicate success
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to be caught by the component
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setPatient(null);
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    // Clear all React state by forcing a full reload (optional, but ensures all state is reset)
    window.location.href = '/login';
  };

  const handleUpdate = async (updatedData) => {
    // Call update API (to be implemented)
    const updatedPatient = await patientService.updatePatient(auth.token, updatedData);
    // Normalize patient object for PatientInfo (same as in handleLogin)
    let normalizedPatient = {
      fullName: '',
      phone: updatedPatient.phoneNumber || '',
      ...updatedPatient,
    };
    if (updatedPatient && updatedPatient.personalDetails) {
      normalizedPatient.fullName = updatedPatient.personalDetails.name || '';
      normalizedPatient.phone =
        updatedPatient.personalDetails.phoneNumber || updatedPatient.phoneNumber || '';
      normalizedPatient.email = updatedPatient.personalDetails.email || '';
      normalizedPatient.birthdate = updatedPatient.personalDetails.birthdate || '';
      normalizedPatient.age = updatedPatient.personalDetails.age || '';
      normalizedPatient.address = updatedPatient.personalDetails.address || {};
      // Preserve existing sex and occupation if not present in update
      normalizedPatient.sex =
        updatedPatient.personalDetails.sex !== undefined &&
        updatedPatient.personalDetails.sex !== null
          ? updatedPatient.personalDetails.sex
          : (patient && patient.sex) || '';
      normalizedPatient.occupation =
        updatedPatient.personalDetails.occupation !== undefined &&
        updatedPatient.personalDetails.occupation !== null
          ? updatedPatient.personalDetails.occupation
          : (patient && patient.occupation) || '';
    }
    setPatient(normalizedPatient);
    setAuth((prev) => ({ ...prev, patient: normalizedPatient }));
    localStorage.setItem('patient', JSON.stringify(normalizedPatient));
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Routes>
          <Route
            path="/register"
            element={
              <PatientRegistrationForm
                onRegisterSuccess={(patientData) => {
                  setAuth({
                    token: patientData.token || '',
                    patient: patientData,
                  });
                  setPatient(patientData);
                }}
              />
            }
          />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route
            path="/info"
            element={
              auth ? (
                <PatientInfo patient={patient} onUpdate={handleUpdate} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to={auth ? '/info' : '/login'} />} />
          <Route path="*" element={<Navigate to={auth ? '/info' : '/register'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
