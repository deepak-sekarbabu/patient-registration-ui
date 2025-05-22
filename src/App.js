import React, { useState, useEffect } from "react";
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
  // Refresh auth state when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedPatient = localStorage.getItem("patient");
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
      const token = response.token || "";

      // For the new API response format, the patient data is the response itself
      const patientData = response || {};

      // Normalize patient object for PatientInfo
      let normalizedPatient = {
        fullName: "",
        phone: phone || "",
        ...patientData,
      };

      // Extract data from the API response format which has personalDetails
      if (patientData && patientData.personalDetails) {
        normalizedPatient.fullName = patientData.personalDetails.name || "";
        normalizedPatient.phone =
          patientData.personalDetails.phoneNumber || phone || "";
        normalizedPatient.email = patientData.personalDetails.email || "";
        normalizedPatient.birthdate =
          patientData.personalDetails.birthdate || "";
        normalizedPatient.age = patientData.personalDetails.age || "";
        normalizedPatient.address = patientData.personalDetails.address || {};
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
      {" "}
      <div className="App">
        <Routes>
          <Route
            path="/register"
            element={
              <PatientRegistrationForm
                onRegisterSuccess={(patientData) => {
                  setAuth({
                    token: patientData.token || "",
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
          <Route
            path="/"
            element={<Navigate to={auth ? "/info" : "/login"} />}
          />
          <Route
            path="*"
            element={<Navigate to={auth ? "/info" : "/register"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
