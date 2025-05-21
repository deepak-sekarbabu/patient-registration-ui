import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PatientRegistrationForm from "./components/PatientRegistration/PatientRegistrationForm";
import LoginForm from "./components/LoginForm";
import PatientInfo from "./components/PatientInfo";
import patientService from "./services/api";

function App() {
  const [auth, setAuth] = useState(() => {
    // Try to load from localStorage
    const token = localStorage.getItem("token");
    const patient = localStorage.getItem("patient");
    return token && patient ? { token, patient: JSON.parse(patient) } : null;
  });
  const [patient, setPatient] = useState(auth ? auth.patient : null);

  const handleLogin = async (phone, password) => {
    try {
      const { token, patient } = await patientService.login(phone, password);
      // Normalize patient object for PatientInfo
      let normalizedPatient = patient;
      if (patient.personalDetails) {
        normalizedPatient = {
          fullName: patient.personalDetails.name || patient.fullName || "",
          phone: patient.personalDetails.phoneNumber || patient.phone || "",
          ...patient,
        };
      }
      setAuth({ token, patient: normalizedPatient });
      setPatient(normalizedPatient);
      localStorage.setItem("token", token);
      localStorage.setItem("patient", JSON.stringify(normalizedPatient));
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by the component
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setPatient(null);
    localStorage.removeItem("token");
    localStorage.removeItem("patient");
  };

  const handleUpdate = async (updatedData) => {
    // Call update API (to be implemented)
    const updatedPatient = await patientService.updatePatient(
      auth.token,
      updatedData
    );
    setPatient(updatedPatient);
    setAuth((prev) => ({ ...prev, patient: updatedPatient }));
    localStorage.setItem("patient", JSON.stringify(updatedPatient));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<PatientRegistrationForm />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route
            path="/info"
            element={
              auth ? (
                <PatientInfo
                  patient={patient}
                  onUpdate={handleUpdate}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
