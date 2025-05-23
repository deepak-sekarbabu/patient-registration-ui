import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth';
import { debugLog, debugAuthState } from '../utils/debugUtils';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [token, setToken] = useState(null);
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

        // First check local storage for backup authentication data
        const localToken = localStorage.getItem('auth_token');
        const localPatientData = localStorage.getItem('patient_data');

        console.log('Initializing auth - Local storage data:', {
          hasToken: !!localToken,
          hasPatientData: !!localPatientData,
        });

        // If we have local data, use it first to avoid showing login screen unnecessarily
        if (localToken && localPatientData) {
          try {
            const patientData = JSON.parse(localPatientData);
            setPatient(patientData);
            setToken(localToken);
            setSessionActive(true);
            console.log('Auth initialized from local storage');
          } catch (parseErr) {
            console.error('Failed to parse local patient data:', parseErr);
          }
        }

        // Then verify with server
        const authData = await authService.validateSession();
        if (authData && authData.isValid) {
          setPatient(authData.patient);
          setToken(authData.token);
          setSessionActive(true);
          console.log('Auth validated with server');
        } else {
          // Clear any potentially invalid tokens only if server validation fails
          console.log('Server validation failed, logging out');
          await authService.logout();
          setPatient(null);
          setToken(null);
          setSessionActive(false);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('patient_data');
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
      const authData = await authService.login(phone, password);

      if (!authData || !authData.patient) {
        throw new Error('Invalid login response: missing patient data');
      }

      // Explicitly store authentication data in localStorage as a backup
      localStorage.setItem('auth_token', authData.token || '');
      localStorage.setItem('patient_data', JSON.stringify(authData.patient));

      // Set auth state with patient data from response
      setPatient(authData.patient);
      setToken(authData.token);
      setSessionActive(true);

      // Log authentication state for debugging
      console.log('Login successful, auth state updated:', {
        hasPatient: !!authData.patient,
        hasToken: !!authData.token,
        sessionActive: true,
        patient: authData.patient,
      });

      return authData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (patientData) => {
    try {
      setLoading(true);
      setError(null);
      const authData = await authService.register(patientData);
      setPatient(authData.patient);
      setToken(authData.token);
      setSessionActive(true);
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
  const isAuthenticated = !!token && !!patient && sessionActive;

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
