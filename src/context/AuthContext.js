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
      setToken(null); // Ensure token state is correctly managed (already null)
      setSessionActive(false);
      debugLog('AUTH_CONTEXT', 'Logout complete via authService.logout()');
    } catch (err) {
      console.error('Logout failed:', err);
      // Optionally set an error state here if needed for UI feedback
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

        // Step 1: Optimistically load patient data from localStorage.
        // This allows the UI to render potentially authenticated state quickly
        // while server validation is in progress.
        const localPatientData = localStorage.getItem('patient_data');

        console.log('Initializing auth - Local storage data:', {
          hasPatientData: !!localPatientData,
        });

        if (localPatientData) {
          try {
            const patientData = JSON.parse(localPatientData);
            setPatient(patientData);
            setSessionActive(true); // Assume active until server validation confirms or denies.
            console.log('Auth partially initialized from local storage patient data');
          } catch (parseErr) {
            console.error('Failed to parse local patient data:', parseErr);
            localStorage.removeItem('patient_data'); // Clear corrupted data.
          }
        }

        // Step 2: Perform server-side session validation.
        // This is crucial to confirm the session is still valid on the server.
        // Relies on HttpOnly cookie being sent automatically by the browser.
        const authData = await authService.validateSession();

        if (authData && authData.isValid) {
          // Server confirms session is valid. Update context state.
          setPatient(authData.patient);
          setToken(null); // Token string is not stored in context state (HttpOnly).
          setSessionActive(true);
          // Ensure localStorage is up-to-date with validated patient data.
          if (authData.patient) {
            localStorage.setItem('patient_data', JSON.stringify(authData.patient));
          }
          console.log('Auth validated with server');
          setError(null); // Clear any previous errors from optimistic load or prior state.
        } else {
          // Server validation failed, session is invalid, or an error occurred during validation.
          const validationErrorMessage = authData.error || 'Session validation failed, logging out.';
          console.log('Auth validation outcome:', validationErrorMessage);

          setError(validationErrorMessage); // Set context error state for UI feedback.

          // Step 3: If validation fails, perform a full logout.
          // authService.logout() handles clearing localStorage and notifying the backend.
          await authService.logout();
          setPatient(null);
          setToken(null);
          setSessionActive(false);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err.message || 'Failed to initialize authentication state.'); // Set error state
        // Clear any potentially invalid tokens/state by ensuring logout
        // This might be redundant if the error came from validateSession's else block which now also calls logout
        // However, this catch block handles other potential errors during initialization.
        await authService.logout();
        setPatient(null);
        setToken(null);
        setSessionActive(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listens for 'auth:sessionExpired' events dispatched by authService, typically when
    // token refresh fails or server explicitly indicates session termination.
    // This ensures the AuthContext state is updated even if the expiration is detected
    // outside of a direct component interaction (e.g., during a background API call).
    window.addEventListener('auth:sessionExpired', handleSessionExpired);

    // Initialize client-side session inactivity monitoring.
    // This is a UX enhancement to proactively log out the user after a period of inactivity,
    // complementing server-side session expiration.
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
      setError(null); // Clear previous errors
      const updatedPatient = await authService.updatePatient(updatedData); // updatedData should contain patient ID
      setPatient(updatedPatient);

      // **Add this line to update localStorage:**
      if (updatedPatient) {
        localStorage.setItem('patient_data', JSON.stringify(updatedPatient));
      }

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
