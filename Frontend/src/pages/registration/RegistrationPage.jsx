import React, { useState } from 'react';
import './registration.css';
import FeedbackModal from '../../components/FeedbackModal';
import RegistrationForm from './RegistrationForm';

function RegistrationPage({ navigateTo, registrationDraft, setRegistrationDraft }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const handleInputChange = (event) => {
    const { id, value, type, checked } = event.target;
    setRegistrationDraft((currentDraft) => ({
      ...currentDraft,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registrationDraft.password !== registrationDraft.confirmPassword) {
      setModalConfig({
        type: 'error',
        title: 'Jelszó hiba',
        message: 'A két jelszó nem egyezik meg.',
        confirmLabel: 'Rendben'
      });
      return;
    }

    const userData = {
      full_name: `${registrationDraft.lastName} ${registrationDraft.firstName}`,
      email: registrationDraft.email,
      password: registrationDraft.password,
      fitnessGoal: registrationDraft.fitnessGoal
    };

    try {
      const emailCheckResponse = await fetch(`http://localhost:5001/api/register/check-email?email=${encodeURIComponent(registrationDraft.email)}`);
      if (emailCheckResponse.ok) {
        const emailCheckData = await emailCheckResponse.json();
        if (emailCheckData.exists) {
          setModalConfig({
            type: 'error',
            title: 'Regisztráció sikertelen',
            message: 'Ez az email cím már foglalt.',
            confirmLabel: 'Rendben'
          });
          return;
        }
      }

      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { error: 'A szerver nem JSON választ adott' };
      }

      if (response.ok) {
        localStorage.setItem('powerplan_user_logged_in', 'true');
        if (data.userId) {
          localStorage.setItem('powerplan_current_user', JSON.stringify({
            id: data.userId,
            full_name: userData.full_name,
            email: userData.email,
            role: 'user',
            is_admin: false
          }));
        }
        setRegistrationDraft({
          lastName: '',
          firstName: '',
          email: '',
          password: '',
          confirmPassword: '',
          fitnessGoal: '',
          termsAccepted: false
        });
        setModalConfig({
          type: 'success',
          title: 'Sikeres regisztráció',
          message: 'Kérlek, töltsd ki a kérdőívet a személyre szabott élményhez.',
          confirmLabel: 'Tovább a kérdőívhez',
          action: 'questionnaire'
        });
      } else {
        setModalConfig({
          type: 'error',
          title: 'Regisztráció sikertelen',
          message: response.status === 409 ? 'Ez az email cím már foglalt.' : (data.error || 'Ismeretlen hiba történt.'),
          confirmLabel: 'Rendben'
        });
      }
    } catch (error) {
      console.error('❌ Hiba a regisztráció során:', error);
      setModalConfig({
        type: 'error',
        title: 'Kapcsolódási hiba',
        message: 'Nem sikerült csatlakozni a szerverhez. Ellenőrizd, hogy a backend fut-e a localhost:5001 címen.',
        confirmLabel: 'Rendben'
      });
    }
  };

  const handleNavClick = (e, page, hash = '') => {
    e.preventDefault();
    navigateTo(page);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleModalClose = () => {
    const action = modalConfig?.action;
    setModalConfig(null);

    if (action === 'questionnaire') {
      navigateTo('questionnaire');
    }
  };

  return (
    <>
      <div className="regisztracio-container">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <RegistrationForm
          registrationDraft={registrationDraft}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
          onToggleConfirmPassword={() => setShowConfirmPassword((currentValue) => !currentValue)}
          onNavigate={handleNavClick}
        />
      </div>

      <FeedbackModal
        isOpen={Boolean(modalConfig)}
        type={modalConfig?.type}
        title={modalConfig?.title}
        message={modalConfig?.message}
        confirmLabel={modalConfig?.confirmLabel}
        onClose={handleModalClose}
      />
    </>
  );
}

export default RegistrationPage;