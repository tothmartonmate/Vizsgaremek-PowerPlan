import React from 'react';

const RegistrationForm = ({
  registrationDraft,
  showPassword,
  showConfirmPassword,
  onInputChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
  onNavigate
}) => (
  <div className="form-container">
    <div className="form-box">
      <h2>Regisztráció</h2>
      <p>Hozz létre egy fiókot, és kezdd el az edzést!</p>

      <form id="registerForm" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lastName">Vezetéknév</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input type="text" id="lastName" placeholder="Vezetéknév" value={registrationDraft.lastName} onChange={onInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="firstName">Keresztnév</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input type="text" id="firstName" placeholder="Keresztnév" value={registrationDraft.firstName} onChange={onInputChange} required />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email cím</label>
          <div className="input-with-icon">
            <i className="fas fa-envelope"></i>
            <input type="email" id="email" placeholder="email.cim@pelda.hu" value={registrationDraft.email} onChange={onInputChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Jelszó</label>
          <div className="input-with-icon">
            <i className="fas fa-lock"></i>
            <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Válassz erős jelszót" value={registrationDraft.password} onChange={onInputChange} required />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Jelszó megerősítése</label>
          <div className="input-with-icon">
            <i className="fas fa-lock"></i>
            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" placeholder="Ismételd meg a jelszót" value={registrationDraft.confirmPassword} onChange={onInputChange} required />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={onToggleConfirmPassword}
              aria-label={showConfirmPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
            >
              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fitnessGoal">Fitness cél</label>
          <select id="fitnessGoal" required value={registrationDraft.fitnessGoal} onChange={onInputChange}>
            <option value="" disabled>Válaszd ki a célodat</option>
            <option value="weight-loss">Fogyás</option>
            <option value="muscle-gain">Izomépítés</option>
            <option value="endurance">Stamina növelés</option>
            <option value="general-fitness">Általános fitness</option>
            <option value="competition">Versenyre készülés</option>
          </select>
        </div>

        <div className="terms">
          <input type="checkbox" id="termsAccepted" checked={registrationDraft.termsAccepted} onChange={onInputChange} required />
          <label htmlFor="termsAccepted">Elfogadom a <a href="#" onClick={(e) => onNavigate(e, 'terms')}>Felhasználási feltételeket</a> és az <a href="#" onClick={(e) => onNavigate(e, 'privacy')}>Adatvédelmi szabályzatot</a></label>
        </div>

        <button type="submit" className="submit-button">REGISZTRÁCIÓ</button>
      </form>

      <div className="form-footer">
        Már van fiókod? <a href="#" onClick={(e) => onNavigate(e, 'login')}>Jelentkezz be!</a>
      </div>
    </div>
  </div>
);

export default RegistrationForm;