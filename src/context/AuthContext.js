import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authService from '../services/auth';
import { debugAuthState, debugLog } from '../utils/debugUtils';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider manages authentication state and session logic for the app.
 * Handles token validation, session expiration, and global auth events.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [token, setToken] = useState(null); // Will store the JWT string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionActive, setSessionActive] = useState(false); // Default to false until token validated

  /**
   * Handles session expiration by clearing client state and optionally calling backend logout.
   * @param {boolean} isProactiveLogout - If true, only clear client state (e.g., inactivity timeout).
   * @param {string|null} currentTokenForBackendLogout - Token to send to backend for invalidation.
   */
  const handleSessionExpired = useCallback(
    async (isProactiveLogout = false, currentTokenForBackendLogout = null) => {
      debugLog('AUTH_CONTEXT', 'handleSessionExpired called.', { isProactiveLogout });

      // Clear client-side state immediately
      setPatient(null);
      setToken(null);
      setSessionActive(false);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('patient_data');
      // Consider other localStorage items that should be cleared (e.g. patient_id, patient_phone, last_login_success)
      // These should ideally be listed in authService.logout's client-side cleanup part if it's called.

      // If not a proactive client-side only timeout (e.g. actual session expiry detected or manual logout)
      // then attempt to call backend logout.
      if (!isProactiveLogout && currentTokenForBackendLogout) {
        try {
          // Call backend to invalidate token if needed
          await authService.logout(currentTokenForBackendLogout);
          debugLog('AUTH_CONTEXT', 'Backend logout called by handleSessionExpired.');
        } catch (err) {
          // Log error but always clear client state
          console.error('Error during server logout in handleSessionExpired:', err);
        }
      }
    },
    []
  ); // No direct dependencies on 'token' state here to avoid re-creating it too often. Token is passed as arg.

  /**
   * Initializes authentication state on mount.
   * Validates stored token and sets up event listeners for session expiration.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedToken = localStorage.getItem('jwt_token');
        debugLog('AUTH_CONTEXT_INIT', 'Stored token found:', storedToken ? 'Yes' : 'No');

        if (storedToken) {
          // Validate token with backend
          const validationResult = await authService.validateToken(storedToken);
          debugLog('AUTH_CONTEXT_INIT', 'Token validation result:', validationResult);

          if (validationResult && validationResult.isValid) {
            setPatient(validationResult.patient);
            setToken(storedToken); // Set the actual token string
            setSessionActive(true);
            if (validationResult.patient) {
              localStorage.setItem('patient_data', JSON.stringify(validationResult.patient));
            }
            debugLog('AUTH_CONTEXT_INIT', 'Token validated successfully.');
          } else {
            debugLog('AUTH_CONTEXT_INIT', 'Token validation failed or token invalid.');
            // Token is invalid, clear everything
            await handleSessionExpired(true, storedToken); // Proactive, clear client state, try backend logout
            if (validationResult && validationResult.error) {
              setError(validationResult.error);
            } else {
              setError('Session expired or token is invalid.');
            }
          }
        } else {
          // No stored token, ensure clean state
          setPatient(null);
          setToken(null);
          setSessionActive(false);
          debugLog('AUTH_CONTEXT_INIT', 'No stored token, user is logged out.');
        }
      } catch (err) {
        debugLog('AUTH_CONTEXT_INIT', 'Error during auth initialization:', err);
        setError(err.message || 'Failed to initialize authentication state.');
        await handleSessionExpired(true, localStorage.getItem('jwt_token'));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for global session expiration events
    const onAuthSessionExpiredEvent = () => {
      debugLog('AUTH_CONTEXT', "'auth:sessionExpired' event received.");
      const currentToken = localStorage.getItem('jwt_token');
      handleSessionExpired(false, currentToken); // Not proactive, try backend logout.
    };

    window.addEventListener('auth:sessionExpired', onAuthSessionExpiredEvent);

    // Optionally monitor client-side inactivity
    const cleanupSessionMonitoring = authService.initSessionMonitoring(() => {
      debugLog('AUTH_CONTEXT', 'Client-side inactivity session monitoring triggered.');
      handleSessionExpired(true, localStorage.getItem('jwt_token'));
    });

    return () => {
      window.removeEventListener('auth:sessionExpired', onAuthSessionExpiredEvent);
      cleanupSessionMonitoring();
    };
  }, [handleSessionExpired]);

  // Login function
  const login = async (phone, password) => {
    try {
      setLoading(true);
      setError(null);
      // authService.login will be updated to return { patient, token }
      const authData = await authService.login(phone, password);

      if (!authData || !authData.patient || !authData.token) {
        throw new Error('Invalid login response: missing patient data or token');
      }

      localStorage.setItem('jwt_token', authData.token);
      localStorage.setItem('patient_data', JSON.stringify(authData.patient));

      setPatient(authData.patient);
      setToken(authData.token); // Store the actual token
      setSessionActive(true);

      debugLog('AUTH_CONTEXT', 'Login successful, auth state updated with token and patient.');
      return authData;
    } catch (err) {
      debugLog('AUTH_CONTEXT', 'Login failed:', err);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('patient_data');
      setPatient(null);
      setToken(null);
      setSessionActive(false);

      let errorMessage = 'Login failed';

      // Check if it's an Axios error and if it's a network error or server error
      if (err.isAxiosError) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = err.response.data.message || 'Login failed';
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          errorMessage = 'Backend not available. Please try again later.';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = err.message || 'Login failed';
        }
      } else {
        // Handle non-Axios errors
        errorMessage = err.message || 'Login failed';
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (patientRegData) => {
    try {
      setLoading(true);
      setError(null);
      // authService.register will be updated to return { patient, token }
      const authData = await authService.register(patientRegData);

      if (!authData || !authData.patient || !authData.token) {
        throw new Error('Invalid registration response: missing patient data or token');
      }

      localStorage.setItem('jwt_token', authData.token);
      localStorage.setItem('patient_data', JSON.stringify(authData.patient));

      setPatient(authData.patient);
      setToken(authData.token); // Store the actual token
      setSessionActive(true);
      debugLog('AUTH_CONTEXT', 'Registration successful, auth state updated.');
      return authData;
    } catch (err) {
      debugLog('AUTH_CONTEXT', 'Registration failed:', err);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('patient_data');
      setPatient(null);
      setToken(null);
      setSessionActive(false);
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // AuthProvider's logout function (callable by UI)
  const logout = async () => {
    debugLog('AUTH_CONTEXT', 'Manual logout initiated.');
    setLoading(true);
    const currentToken = token; // Capture token before state is cleared
    try {
      // Treat manual logout as not proactive, so it calls backend.
      // Pass the current token for backend invalidation.
      await handleSessionExpired(false, currentToken);
    } catch (err) {
      // This catch is mostly for unexpected errors in handleSessionExpired itself,
      // as backend errors inside handleSessionExpired are caught there.
      console.error('Logout failed:', err);
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Update patient data
  const updatePatient = async (updatedData) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      // authService.updatePatient will use the token from authService's interceptor
      const updatedPatient = await authService.updatePatient(updatedData);
      setPatient(updatedPatient);

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
  // Now explicitly checks for the presence of a token string.
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
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
