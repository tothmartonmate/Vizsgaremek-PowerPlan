import React from 'react';

const ProgressPhotosSection = ({
  currentSection,
  handleProgressPhotoUpload,
  progressPhotos,
  openDeleteProgressPhotoModal,
  saveProgressPhoto,
  updateProgressNote,
  saveProgressNote
}) => (
  <div className={`content-section ${currentSection === 'fejlodes' ? 'active' : ''}`}>
    <div className="card">
      <div className="section-header section-header-actions-only">
        <input type="file" accept="image/*" onChange={handleProgressPhotoUpload} id="progress-photo-input" style={{ display: 'none' }} />
        <button className="btn btn-primary" onClick={() => document.getElementById('progress-photo-input').click()}>
          <i className="fas fa-plus"></i> Fotó feltöltés
        </button>
      </div>

      {progressPhotos.length === 0 ? (
        <div className="no-data-message">
          <i className="fas fa-image"></i>
          <p>Még nincsenek feltöltött fotók</p>
          <p className="subtitle">Kattints a "Fotó feltöltés" gombra, hogy hozzáadj egy képet!</p>
        </div>
      ) : (
        <div className="progress-photos-grid">
          {progressPhotos.map((photo) => (
            <div key={photo.id} className="progress-photo-card">
              <div className="photo-image-container">
                <img src={photo.image} alt="Fejlődés fotó" className="progress-photo-img" />
                <button className="delete-meal-btn" onClick={() => openDeleteProgressPhotoModal(photo)} title="Kép törlése">🗑️</button>
              </div>
              <div className="photo-date">
                {photo.date}
                <button
                  className={`btn btn-secondary btn-sm ${photo.isPhotoSaved ? 'saved' : ''}`}
                  onClick={() => saveProgressPhoto(photo.id)}
                  disabled={photo.isPhotoSaved}
                  style={{ marginLeft: '12px' }}
                >
                  {photo.isPhotoSaved ? 'Mentve' : 'Kép mentése'}
                </button>
              </div>
              <div className="photo-note-section">
                <label>Megjegyzés:</label>
                <textarea
                  className="photo-note-input"
                  placeholder="pl. itt 78kg voltam..."
                  value={photo.note}
                  onChange={(e) => updateProgressNote(photo.id, e.target.value)}
                  maxLength="200"
                />
                <div className="note-cta-row">
                  <span className="note-char-count">{photo.note.length}/200</span>
                  <button
                    className={`btn btn-secondary btn-sm ${photo.isNoteSaved ? 'saved' : ''}`}
                    onClick={() => saveProgressNote(photo.id)}
                    disabled={photo.isNoteSaved}
                  >
                    {photo.isNoteSaved ? 'Mentve' : 'Megjegyzés mentése'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ProgressPhotosSection;