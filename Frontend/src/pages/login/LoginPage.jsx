import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import LoginForm from './LoginForm';
import LoginToast from './LoginToast';

function LoginPage({ navigateTo, setIsLoggedIn }) {
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
      <LoginForm
        formData={formData}
        formErrors={formErrors}
        isLoading={isLoading}
        isResettingPassword={isResettingPassword}
        showPassword={showPassword}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
        onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
        onNavigateToRegistration={(e) => {
          e.preventDefault();
          navigateTo('registration');
        }}
      />
      {toast && <div className="toast-container"><LoginToast message={toast.message} type={toast.type} onClose={() => setToast(null)} /></div>}
    </div>
  );
}

export default LoginPage;