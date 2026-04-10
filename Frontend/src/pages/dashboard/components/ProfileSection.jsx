import React from 'react';

const ProfileSection = ({
  editingProfile,
  setEditingProfile,
  setIsProfileSaved,
  profileImage,
  profileImageInputRef,
  handleImageUpload,
  openProfileImageEditor,
  editFormData,
  handleProfileFieldChange,
  minRealisticWeightKg,
  maxRealisticWeightKg,
  preventNumberInputWheel,
  passwordVisibility,
  passwordFormData,
  handlePasswordFieldChange,
  togglePasswordVisibility,
  handlePasswordChange,
  savingPasswordChange,
  isProfileSaved,
  handleProfileSave,
  calculateAge
}) => (
  <div className="card">
    <div className="section-header">
      <h2><i className="fas fa-user-circle"></i> Profilom</h2>
      <button className="btn btn-secondary" onClick={() => {
        setEditingProfile(!editingProfile);
        setIsProfileSaved(false);
      }}>
        <i className="fas fa-edit"></i> {editingProfile ? 'Mégse' : 'Szerkesztés'}
      </button>
    </div>

    {editingProfile ? (
      <div className="profile-form">
        <div className="profile-image-upload">
          <div className="profile-pic-large">
            {profileImage ? <img src={profileImage} alt="Profil" /> : <i className="fas fa-user"></i>}
          </div>
          <input ref={profileImageInputRef} type="file" accept="image/*" onChange={handleImageUpload} id="profile-image-input" style={{ display: 'none' }} />
          <div className="profile-image-action-row">
            <button className="btn btn-secondary" type="button" onClick={() => profileImageInputRef.current?.click()}>
              <i className="fas fa-upload"></i> Profilkép
            </button>
            {profileImage && (
              <button className="btn btn-secondary" type="button" onClick={() => openProfileImageEditor(profileImage)}>
                <i className="fas fa-expand"></i> Igazítás
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Teljes név</label>
          <input type="text" className="form-control" value={editFormData.fullName} onChange={(e) => handleProfileFieldChange('fullName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={editFormData.email} onChange={(e) => handleProfileFieldChange('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Magasság (cm)</label>
          <input type="number" className="form-control" min="100" max="250" onWheel={preventNumberInputWheel} value={editFormData.height} onChange={(e) => handleProfileFieldChange('height', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Súly (kg)</label>
          <input type="number" className="form-control" min={minRealisticWeightKg} max={maxRealisticWeightKg} step="0.1" onWheel={preventNumberInputWheel} value={editFormData.weight} onChange={(e) => handleProfileFieldChange('weight', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Születési dátum</label>
          <input type="date" className="form-control" value={editFormData.birthDate} onChange={(e) => handleProfileFieldChange('birthDate', e.target.value)} />
        </div>
        <div className="profile-password-section">
          <h3 className="profile-password-title">Jelszó módosítása</h3>
          <p className="profile-password-help">Ha ideiglenes jelszóval léptél be, itt azonnal lecserélheted.</p>
          <div className="form-group">
            <label>Jelenlegi vagy ideiglenes jelszó</label>
            <div className="password-field-wrapper">
              <input
                type={passwordVisibility.currentPassword ? 'text' : 'password'}
                className="form-control password-field-input"
                value={passwordFormData.currentPassword}
                onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
              />
              <button
                type="button"
                className="password-visibility-toggle"
                onClick={() => togglePasswordVisibility('currentPassword')}
                aria-label={passwordVisibility.currentPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
              >
                <i className={`fas ${passwordVisibility.currentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Új jelszó</label>
              <div className="password-field-wrapper">
                <input
                  type={passwordVisibility.newPassword ? 'text' : 'password'}
                  className="form-control password-field-input"
                  value={passwordFormData.newPassword}
                  onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  aria-label={passwordVisibility.newPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                >
                  <i className={`fas ${passwordVisibility.newPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Új jelszó megerősítése</label>
              <div className="password-field-wrapper">
                <input
                  type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                  className="form-control password-field-input"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  aria-label={passwordVisibility.confirmPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                >
                  <i className={`fas ${passwordVisibility.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handlePasswordChange} disabled={savingPasswordChange}>
            <i className="fas fa-key"></i> {savingPasswordChange ? 'Jelszó mentése...' : 'Jelszó módosítása'}
          </button>
        </div>
        <button className={`btn btn-primary profile-save-button ${isProfileSaved ? 'saved' : ''}`} onClick={handleProfileSave}>
          <i className={`fas ${isProfileSaved ? 'fa-check-circle' : 'fa-save'}`}></i> {isProfileSaved ? 'Mentve' : 'Mentés'}
        </button>
      </div>
    ) : (
      <div className="profile-view">
        <div className="profile-image-large">
          {profileImage ? <img src={profileImage} alt="Profil" /> : <i className="fas fa-user-circle"></i>}
        </div>
        <div className="profile-info-grid">
          <div className="info-item"><label>Név</label><p>{editFormData.fullName || '-'}</p></div>
          <div className="info-item"><label>Email</label><p>{editFormData.email || '-'}</p></div>
          <div className="info-item"><label>Magasság</label><p>{editFormData.height || '-'} cm</p></div>
          <div className="info-item"><label>Súly</label><p>{editFormData.weight || '-'} kg</p></div>
          <div className="info-item"><label>Születési dátum</label><p>{editFormData.birthDate ? new Date(editFormData.birthDate).toLocaleDateString('hu-HU') : '-'}</p></div>
          <div className="info-item"><label>Kor</label><p>{calculateAge(editFormData.birthDate)} év</p></div>
        </div>
      </div>
    )}
  </div>
);

export default ProfileSection;