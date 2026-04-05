import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './bejelentkezes.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info-circle';
    }
  };

  const getColor = () => {
    switch(type) {
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

function Bejelentkezes({ navigateTo, setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = 'http://localhost:5001/api';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2100);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) errors.email = 'Az email cím megadása kötelező';
    else if (!emailRegex.test(formData.email)) errors.email = 'Érvényes email címet adjon meg';
    if (!formData.password) errors.password = 'A jelszó megadása kötelező';
    else if (formData.password.length < 6) errors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      });
      if (response.data.success) {
        localStorage.setItem('powerplan_token', response.data.token);
        localStorage.setItem('powerplan_current_user', JSON.stringify(response.data.user));
        localStorage.setItem('powerplan_user_logged_in', 'true');
        if (formData.remember) {
          localStorage.setItem('powerplan_remember_me', 'true');
          localStorage.setItem('powerplan_remembered_email', formData.email);
        }
        if (setIsLoggedIn) setIsLoggedIn(true);
        showToast('✅ Sikeres bejelentkezés!', 'success');
        setTimeout(() => {
          if (navigateTo) navigateTo('dashboard');
          else window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      if (error.response) showToast(error.response.data.error || '❌ Hibás email cím vagy jelszó', 'error');
      else if (error.request) showToast('❌ Nem sikerült kapcsolódni a szerverhez!', 'error');
      else showToast('❌ Váratlan hiba történt.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      showToast('Add meg az email címedet a jelszó visszaállításához.', 'warning');
      return;
    }

    if (!emailRegex.test(formData.email)) {
      showToast('Érvényes email címet adj meg a jelszó visszaállításához.', 'warning');
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email: formData.email
      });
      showToast(response.data.message || 'Az ideiglenes jelszót elküldtük emailben.', 'success');
    } catch (error) {
      if (error.response) showToast(error.response.data.error || '❌ Nem sikerült elküldeni az ideiglenes jelszót.', 'error');
      else if (error.request) showToast('❌ Nem sikerült kapcsolódni a szerverhez!', 'error');
      else showToast('❌ Váratlan hiba történt.', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="bejelentkezes-container">
      <div className="form-container">
        <div className="form-box">
          <h2>Bejelentkezés</h2>
          <p>Add meg az adataidat a belépéshez</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email cím</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input type="email" id="email" name="email" placeholder="email.cim@pelda.hu" value={formData.email} onChange={handleInputChange} className={formErrors.email ? 'input-error' : ''} disabled={isLoading} />
              </div>
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Jelszó</label>
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Add meg a jelszavad" value={formData.password} onChange={handleInputChange} className={formErrors.password ? 'input-error' : ''} disabled={isLoading} />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.password && <span className="error-message">{formErrors.password}</span>}
            </div>
            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" name="remember" checked={formData.remember} onChange={handleInputChange} disabled={isLoading} />
                <label htmlFor="remember">Emlékezz rám</label>
              </div>
              <a
                href="#"
                className="forgot-password"
                onClick={handleForgotPassword}
                style={isResettingPassword ? { pointerEvents: 'none', opacity: 0.7 } : undefined}
              >
                {isResettingPassword ? 'Ideiglenes jelszó küldése...' : 'Elfelejtetted a jelszavad?'}
              </a>
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? <><i className="fas fa-spinner fa-spin"></i> BEJELENTKEZÉS...</> : 'BEJELENTKEZÉS'}
            </button>
          </form>
          <div className="form-footer">
            Még nincs fiókod? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('regisztracio'); }}>Regisztrálj most!</a>
          </div>
        </div>
      </div>
      {toast && <div className="toast-container"><Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /></div>}
    </div>
  );
}

export default Bejelentkezes;