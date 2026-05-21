import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#2563eb';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 24px',
      backgroundColor: bgColor,
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease',
      fontSize: '0.95rem',
      fontWeight: '500',
    }}>
      {type === 'success' && <span style={{ fontSize: '1.2em' }}>✓</span>}
      {type === 'error' && <span style={{ fontSize: '1.2em' }}>✕</span>}
      {type === 'warning' && <span style={{ fontSize: '1.2em' }}>⚠</span>}
      {type === 'info' && <span style={{ fontSize: '1.2em' }}>ℹ</span>}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.2em',
          cursor: 'pointer',
          padding: '0 0 0 8px',
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const ToastContainer = () => {
    if (!toast) return null;
    return <Toast message={toast.message} type={toast.type} onClose={hideToast} />;
  };

  return { showToast, ToastContainer };
};

export default Toast;