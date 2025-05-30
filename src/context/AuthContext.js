import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth';
import { debugLog, debugAuthState } from '../utils/debugUtils';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [token, setToken] = useState(null); // Will be set to null, not used for actual token string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  // Pre-define logout function for use in handleSessionExpired
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setPatient(null);
      setToken(null);
      setSessionActive(false);
      // Clear all authentication data from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('patient_data');
      localStorage.removeItem('patient_id');
      localStorage.removeItem('patient_phone');
      localStorage.removeItem('patient');
      localStorage.removeItem('token');
      localStorage.removeItem('last_login_success');

      debugLog('AUTH_CONTEXT', 'Logout complete - cleared all localStorage items');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define handleSessionExpired before it's used in useEffect
  const handleSessionExpired = useCallback(
    () => {
      setSessionActive(false);
      logout();
    },
    [
      /* No need to include logout as it's defined in the same functional scope */
    ]
  );
  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check local storage for patient data as a starting point
        const localPatientData = localStorage.getItem('patient_data');

        console.log('Initializing auth - Local storage data:', {
          hasPatientData: !!localPatientData,
        });

        // If we have local patient data, use it to potentially improve UX while validating
        if (localPatientData) {
          try {
            const patientData = JSON.parse(localPatientData);
            setPatient(patientData);
            // setToken(null); // Token is not loaded from localStorage
            setSessionActive(true); // Assume active until validation
            console.log('Auth partially initialized from local storage patient data');
          } catch (parseErr) {
            console.error('Failed to parse local patient data:', parseErr);
            localStorage.removeItem('patient_data'); // Clear corrupted data
          }
        }

        // Then verify with server using validateSession
        const authData = await authService.validateSession();
        if (authData && authData.isValid) {
          setPatient(authData.patient);
          // setToken(authData.token); // Token from validateSession is not stored in context state
          setToken(null); // Ensure token state is null
          setSessionActive(true);
          // Persist patient data upon successful validation
          if (authData.patient) {
            localStorage.setItem('patient_data', JSON.stringify(authData.patient));
          }
          console.log('Auth validated with server');
        } else {
          // Server validation failed or session is not valid
          console.log('Server validation failed or session invalid, logging out');
          // await authService.logout(); // This is called by logout() which is called by handleSessionExpired or directly
          setPatient(null);
          setToken(null);
          setSessionActive(false);
          localStorage.removeItem('auth_token'); // Cleanup old token if any
          localStorage.removeItem('patient_data'); // Cleanup patient data
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        // Clear any potentially invalid tokens
        await authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up event listeners for session expiration
    window.addEventListener('auth:sessionExpired', handleSessionExpired);

    // Initialize session monitoring
    const cleanupSessionMonitoring = authService.initSessionMonitoring(() => {
      handleSessionExpired();
    });

    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
      cleanupSessionMonitoring();
    };
  }, [handleSessionExpired]); // Login function
  const login = async (phone, password) => {
    try {
      setLoading(true);
      setError(null);

      // Get authentication data from service
      const authData = await authService.login(phone, password); // authService.login no longer returns token

      if (!authData || !authData.patient) {
        throw new Error('Invalid login response: missing patient data');
      }

      // Store patient data in localStorage upon successful login
      localStorage.setItem('patient_data', JSON.stringify(authData.patient));
      // localStorage.removeItem('auth_token'); // Ensure old token is not lingering if any

      // Set auth state with patient data from response
      setPatient(authData.patient);
      // setToken(authData.token); // Token is HttpOnly, not set in context state from here
      setToken(null); // Ensure token state is null
      setSessionActive(true);

      // Log authentication state for debugging
      console.log('Login successful, auth state updated:', {
        hasPatient: !!authData.patient,
        // hasToken: !!authData.token, // Token is not expected here for HttpOnly
        sessionActive: true,
        patient: authData.patient,
      });

      return authData; // Contains patient, but token is handled by HttpOnly cookie
    } catch (err) {
      console.error('Login error:', err);
      // Make sure the error message is properly set and preserved
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);

      // Make sure we're properly passing the error with its message
      const error = new Error(errorMessage);
      // Preserve any response status information
      if (err.response) {
        error.response = err.response;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (patientData) => {
    try {
      setLoading(true);
      setError(null);
      const authData = await authService.register(patientData); // Assuming authService.register also aligns with HttpOnly
      setPatient(authData.patient);
      // setToken(authData.token); // Token is HttpOnly, not set in context state
      setToken(null); // Ensure token state is null
      setSessionActive(true);
      // Persist patient data upon successful registration
      if (authData.patient) {
        localStorage.setItem('patient_data', JSON.stringify(authData.patient));
      }
      return authData;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update patient data
  const updatePatient = async (updatedData) => {
    try {
      setLoading(true);
      const updatedPatient = await authService.updatePatient(updatedData);
      setPatient(updatedPatient);
      return updatedPatient;
    } catch (err) {
      setError(err.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Check if user is authenticated
  const isAuthenticated = !!patient && sessionActive;

  // Debug the authentication state whenever it changes
  useEffect(() => {
    debugAuthState({
      isAuthenticated,
      patient,
      token,
      sessionActive,
      loading,
    });
  }, [isAuthenticated, patient, token, sessionActive, loading]);

  const contextValue = {
    patient,
    token,
    loading,
    error,
    isAuthenticated,
    sessionActive,
    login,
    register,
    logout,
    updatePatient,
    refreshSession: async () => {
      try {
        await authService.refreshToken();
        return true;
      } catch (err) {
        handleSessionExpired();
        return false;
      }
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
