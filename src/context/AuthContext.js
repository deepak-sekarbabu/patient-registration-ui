import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth';
import { debugLog, debugAuthState } from '../utils/debugUtils';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [token, setToken] = useState(null); // Will store the JWT string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionActive, setSessionActive] = useState(false); // Default to false until token validated

  // Core function to handle client-side session clearing and optionally backend logout
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
          // authService.logout will be adapted to accept a token for invalidation
          await authService.logout(currentTokenForBackendLogout);
          debugLog('AUTH_CONTEXT', 'Backend logout called by handleSessionExpired.');
        } catch (err) {
          console.error('Error during server logout in handleSessionExpired:', err);
          // Even if backend logout fails, client state is cleared.
        }
      }
    },
    []
  ); // No direct dependencies on 'token' state here to avoid re-creating it too often. Token is passed as arg.

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedToken = localStorage.getItem('jwt_token');
        debugLog('AUTH_CONTEXT_INIT', 'Stored token found:', storedToken ? 'Yes' : 'No');

        if (storedToken) {
          // authService.validateToken is expected to be created in services/auth.js
          // It should return { isValid: boolean, patient: object | null, error: string | null }
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
        await handleSessionExpired(true, localStorage.getItem('jwt_token')); // Proactive, clear client state
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Event listener for 'auth:sessionExpired' - this might be dispatched by authService
    // if it detects an issue that requires immediate logout (e.g. refresh fails definitively)
    const onAuthSessionExpiredEvent = () => {
      debugLog('AUTH_CONTEXT', "'auth:sessionExpired' event received.");
      const currentToken = localStorage.getItem('jwt_token'); // Get token at the time of event
      handleSessionExpired(false, currentToken); // Not proactive, try backend logout.
    };

    window.addEventListener('auth:sessionExpired', onAuthSessionExpiredEvent);

    // Client-side session inactivity monitoring (optional, can be removed if JWT dictates all session length)
    // If kept, `initSessionMonitoring` would call `handleSessionExpired(true)` upon timeout.
    const cleanupSessionMonitoring = authService.initSessionMonitoring(() => {
      debugLog('AUTH_CONTEXT', 'Client-side inactivity session monitoring triggered.');
      handleSessionExpired(true, localStorage.getItem('jwt_token')); // Proactive, clear client state
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
      setError(err.message || 'Login failed');
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
    // refreshSession logic would change with Bearer tokens.
    // JWT refresh usually involves POSTing the current (expiring) JWT or a refresh token
    // to a specific endpoint, and receiving a new JWT.
    // This is more complex than the HttpOnly refresh and would be handled in authService.
    // For now, let's comment out or simplify, as its direct equivalent isn't here yet.
    // refreshSession: async () => {
    //   try {
    //     // This would call a new method in authService, e.g., authService.refreshAuthToken()
    //     // const newToken = await authService.refreshAuthToken(token); // Pass current token
    //     // if (newToken) {
    //     //   setToken(newToken);
    //     //   localStorage.setItem('jwt_token', newToken);
    //     //   setSessionActive(true);
    //     //   return true;
    //     // } else {
    //     //   await handleSessionExpired(false, token); // Refresh failed, logout
    //     //   return false;
    //     // }
    //     console.warn("refreshSession is not fully implemented for Bearer token flow yet.");
    //     return false; // Placeholder
    //   } catch (err) {
    //     await handleSessionExpired(false, token); // Refresh failed, logout
    //     return false;
    //   }
    // },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
