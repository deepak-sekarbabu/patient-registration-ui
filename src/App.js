import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientRegistrationForm from './components/PatientRegistration/PatientRegistrationForm';
import LoginForm from './components/Login/LoginForm';
import PatientInfo from './components/PatientInfo/PatientInfo';
import AppointmentForm from './components/Appointment/Appointment';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, patient, token, sessionActive } = useAuth();

  console.log('ProtectedRoute - Auth state:', {
    isAuthenticated,
    hasPatient: !!patient,
    hasToken: !!token,
    sessionActive,
    loading,
  });

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// App routes with AuthProvider
function AppRoutes() {
  const { patient, login, register, logout, updatePatient, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  return (
    <div className="App">
      <Routes>
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/info" />
            ) : (
              <PatientRegistrationForm onRegisterSuccess={register} />
            )
          }
        />{' '}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/info" /> : <LoginForm onLogin={login} />}
        />
        <Route
          path="/info"
          element={
            <ProtectedRoute>
              <PatientInfo patient={patient} onUpdate={updatePatient} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentForm patient={patient} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/info' : '/login'} />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/info' : '/register'} />} />
      </Routes>
    </div>
  );
}

// Main App component wraps routes with providers
function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
