import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/Notifications/ToastContainer';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type = 'info', message = '', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastHelpers = {
    showToast,
    success: (msg, dur) => showToast('success', msg, dur),
    error: (msg, dur) => showToast('error', msg, dur),
    warning: (msg, dur) => showToast('warning', msg, dur),
    info: (msg, dur) => showToast('info', msg, dur),
    removeToast
  };

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
