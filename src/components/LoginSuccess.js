import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { debugLog } from '../utils/debugUtils';
import LoadingSpinner from './shared/LoadingSpinner';

/**
 * This component serves as an intermediate step after successful login
 * to ensure that authentication state is properly set before redirecting
 * to the protected patient info page
 */
const LoginSuccess = ({ patientData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get patient data from route state if not provided as props
  const routePatientData = location.state?.patientData;
  const effectivePatientData = patientData || routePatientData;

  useEffect(() => {
    debugLog('LOGIN_SUCCESS', 'Login successful, preparing redirect', {
      hasPatientDataFromProps: !!patientData,
      hasPatientDataFromRoute: !!routePatientData,
      hasEffectiveData: !!effectivePatientData,
    }); // Make sure patient data is stored in localStorage as a backup
    if (effectivePatientData) {
      localStorage.setItem('patient_data', JSON.stringify(effectivePatientData));
      localStorage.setItem('auth_token', effectivePatientData.token || '');
    }

    // Set a short delay to ensure authentication context is updated
    const redirectTimer = setTimeout(() => {
      debugLog('LOGIN_SUCCESS', 'Redirecting to patient info');
      navigate('/info', { replace: true });
    }, 800);

    return () => clearTimeout(redirectTimer);
  }, [patientData, routePatientData, effectivePatientData, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginBottom: '2rem' }}>Login Successful!</h2>
      <p style={{ marginBottom: '2rem' }}>Redirecting to your account...</p>
      <LoadingSpinner />
    </div>
  );
};

export default LoginSuccess;
