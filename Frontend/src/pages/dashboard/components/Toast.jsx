import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#2a9d8f';
      case 'error': return '#e63946';
      case 'warning': return '#f4a261';
      default: return '#457b9d';
    }
  };

  return (
    <div className="toast-notification" style={{ borderLeftColor: getColor() }}>
      <i className={getIcon()} style={{ color: getColor() }}></i>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}><i className="fas fa-times"></i></button>
    </div>
  );
};

export default Toast;