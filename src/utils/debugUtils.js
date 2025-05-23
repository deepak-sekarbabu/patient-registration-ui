/**
 * Debug utility for patient registration app
 * Helps with tracking authentication and navigation issues
 */

// Enable this for more verbose debugging
const DEBUG_ENABLED = true;

/**
 * Debug logger that only logs when enabled
 * @param {string} context - The context where the log is coming from
 * @param {string} message - The message to log
 * @param {any} data - Optional data to include in the log
 */
export const debugLog = (context, message, data = null) => {
  if (!DEBUG_ENABLED) return;

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // Get HH:MM:SS

  if (data) {
    console.log(`[${timestamp}][${context}] ${message}`, data);
  } else {
    console.log(`[${timestamp}][${context}] ${message}`);
  }
};

/**
 * Print current auth state for debugging
 * @param {Object} authState - The current authentication state
 */
export const debugAuthState = (authState) => {
  if (!DEBUG_ENABLED) return;

  debugLog('AUTH_STATE', 'Current authentication state:', {
    isAuthenticated: authState.isAuthenticated,
    hasPatient: !!authState.patient,
    hasToken: !!authState.token,
    sessionActive: authState.sessionActive,
    loading: authState.loading,
    patientId: authState.patient?.id || null,
  });
};

export default { debugLog, debugAuthState };
