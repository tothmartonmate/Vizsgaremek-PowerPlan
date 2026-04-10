import React from 'react';

const LoginForm = ({
  formData,
  formErrors,
  isLoading,
  isResettingPassword,
  showPassword,
  onInputChange,
  onSubmit,
  onForgotPassword,
  onTogglePassword,
  onNavigateToRegistration
}) => (
  <div className="form-container">
    <div className="form-box">
      <h2>Bejelentkezés</h2>
      <p>Add meg az adataidat a belépéshez</p>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email cím</label>
          <div className="input-with-icon">
            <i className="fas fa-envelope"></i>
            <input type="email" id="email" name="email" placeholder="email.cim@pelda.hu" value={formData.email} onChange={onInputChange} className={formErrors.email ? 'input-error' : ''} disabled={isLoading} />
          </div>
          {formErrors.email && <span className="error-message">{formErrors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Jelszó</label>
          <div className="input-with-icon">
            <i className="fas fa-lock"></i>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Add meg a jelszavad" value={formData.password} onChange={onInputChange} className={formErrors.password ? 'input-error' : ''} disabled={isLoading} />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={onTogglePassword}
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
            <input type="checkbox" id="remember" name="remember" checked={formData.remember} onChange={onInputChange} disabled={isLoading} />
            <label htmlFor="remember">Emlékezz rám</label>
          </div>
          <a
            href="#"
            className="forgot-password"
            onClick={onForgotPassword}
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
        Még nincs fiókod? <a href="#" onClick={onNavigateToRegistration}>Regisztrálj most!</a>
      </div>
    </div>
  </div>
);

export default LoginForm;