import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ type: 'success', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, message: '' }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast type={toast.type} message={toast.message} onClose={handleClose} />
    </ToastContext.Provider>
  );
};
