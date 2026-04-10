import React from 'react';

const QuestionnaireSectionsSecondary = ({
  currentSection,
  totalSections,
  formData,
  handleInputChange,
  handleCheckboxGroup,
  handleSliderChange,
  getSliderDisplay,
  renderSliderScale,
  prevSection,
  nextSection,
  submitQuestionnaire,
  goToSection
}) => (
  <>
    <div className={`question-section ${currentSection === 5 ? 'active' : ''}`} id="section5">
      <h2 className="question-title">5. Életmód</h2>
      <div className="question-group">
        <div className="form-group">
          <label htmlFor="sleepHours">Mennyit alszol átlagosan?</label>
          <div className="slider-container">
            <input type="range" className="range-slider" id="sleepHours" min="4" max="10" step="0.5" value={formData.lifestyle.sleepHours} onChange={(e) => handleSliderChange(e, 'lifestyle', 'sleepHours')} />
            <div className="slider-value" id="sleepValue">{getSliderDisplay('lifestyle', 'sleepHours')}</div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="stressLevel">Mennyire stresszes az életviteled? (1 = alacsony, 10 = nagyon magas)</label>
          <div className="slider-container">
            <input type="range" className="range-slider" id="stressLevel" min="1" max="10" value={formData.lifestyle.stressLevel} onChange={(e) => handleSliderChange(e, 'lifestyle', 'stressLevel')} />
            <div className="slider-value" id="stressValue">{getSliderDisplay('lifestyle', 'stressLevel')}</div>
          </div>
        </div>

        <div className="form-group">
          <label>Mennyit ülsz naponta?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="sittingTime" value="low" checked={formData.lifestyle.sittingTime === 'low'} onChange={handleInputChange} required />0-4 óra</label>
            <label className="radio-label"><input type="radio" name="sittingTime" value="medium" checked={formData.lifestyle.sittingTime === 'medium'} onChange={handleInputChange} />4-8 óra</label>
            <label className="radio-label"><input type="radio" name="sittingTime" value="high" checked={formData.lifestyle.sittingTime === 'high'} onChange={handleInputChange} />8+ óra</label>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 6 ? 'active' : ''}`} id="section6">
      <h2 className="question-title">6. Táplálkozás</h2>
      <div className="question-group">
        <div className="form-group">
          <label>Követsz-e speciális étrendet?</label>
          <div className="checkbox-group">
            <label className="checkbox-label"><input type="checkbox" name="diet[]" value="none" checked={formData.nutrition.diet.includes('none')} onChange={(e) => handleCheckboxGroup(e, 'nutrition', 'diet', 'none')} />Nem</label>
            <label className="checkbox-label"><input type="checkbox" name="diet[]" value="vegetarian" checked={formData.nutrition.diet.includes('vegetarian')} onChange={(e) => handleCheckboxGroup(e, 'nutrition', 'diet', 'vegetarian')} />Vegetáriánus</label>
            <label className="checkbox-label"><input type="checkbox" name="diet[]" value="vegan" checked={formData.nutrition.diet.includes('vegan')} onChange={(e) => handleCheckboxGroup(e, 'nutrition', 'diet', 'vegan')} />Vegán</label>
            <label className="checkbox-label"><input type="checkbox" name="diet[]" value="keto" checked={formData.nutrition.diet.includes('keto')} onChange={(e) => handleCheckboxGroup(e, 'nutrition', 'diet', 'keto')} />Keto</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="allergies">Van-e ételallergiád?</label>
          <textarea className="input-field" id="allergies" rows="2" placeholder="Ha igen, kérjük írja le..." value={formData.nutrition.allergies} onChange={handleInputChange} name="allergies"></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="dietControl">Mennyire érzed kontrolláltnak az étkezésed? (1 = egyáltalán nem, 10 = teljesen)</label>
          <div className="slider-container">
            <input type="range" className="range-slider" id="dietControl" min="1" max="10" value={formData.nutrition.dietControl} onChange={(e) => handleSliderChange(e, 'nutrition', 'dietControl')} />
            <div className="slider-value" id="dietControlValue">{getSliderDisplay('nutrition', 'dietControl')}</div>
          </div>
        </div>

        <div className="form-group">
          <label>Szeretnél étrendi ajánlásokat?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="dietRecommendations" value="yes" checked={formData.nutrition.dietRecommendations === 'yes'} onChange={handleInputChange} required />Igen</label>
            <label className="radio-label"><input type="radio" name="dietRecommendations" value="no" checked={formData.nutrition.dietRecommendations === 'no'} onChange={handleInputChange} />Nem</label>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 7 ? 'active' : ''}`} id="section7">
      <h2 className="question-title">7. Edzés preferenciák</h2>
      <div className="question-group">
        <div className="form-group">
          <label>Hol edzel leggyakrabban?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="trainingLocation" value="gym" checked={formData.preferences.trainingLocation === 'gym'} onChange={handleInputChange} required />Edzőterem</label>
            <label className="radio-label"><input type="radio" name="trainingLocation" value="home" checked={formData.preferences.trainingLocation === 'home'} onChange={handleInputChange} />Otthon</label>
            <label className="radio-label"><input type="radio" name="trainingLocation" value="outdoor" checked={formData.preferences.trainingLocation === 'outdoor'} onChange={handleInputChange} />Kint</label>
            <label className="radio-label"><input type="radio" name="trainingLocation" value="not_started" checked={formData.preferences.trainingLocation === 'not_started'} onChange={handleInputChange} />Nem edzek még</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="workoutTime">Mennyi időt tudsz egy edzésre szánni?</label>
          <select className="input-field" id="workoutTime" value={formData.preferences.workoutTime} onChange={handleInputChange} name="workoutTime" required>
            <option value="">Válasszon...</option>
            <option value="30">30 perc</option>
            <option value="45">45 perc</option>
            <option value="60">60 perc</option>
            <option value="75">75 perc</option>
            <option value="90">90+ perc</option>
          </select>
        </div>

        <div className="form-group">
          <label>Milyen gyakran szeretnél edzeni?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="preferredFrequency" value="2" checked={formData.preferences.preferredFrequency === '2'} onChange={handleInputChange} required />2 alkalom/hét</label>
            <label className="radio-label"><input type="radio" name="preferredFrequency" value="3" checked={formData.preferences.preferredFrequency === '3'} onChange={handleInputChange} />3 alkalom/hét</label>
            <label className="radio-label"><input type="radio" name="preferredFrequency" value="4" checked={formData.preferences.preferredFrequency === '4'} onChange={handleInputChange} />4 alkalom/hét</label>
            <label className="radio-label"><input type="radio" name="preferredFrequency" value="5+" checked={formData.preferences.preferredFrequency === '5+'} onChange={handleInputChange} />5+ alkalom/hét</label>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 8 ? 'active' : ''}`} id="section8">
      <h2 className="question-title">8. Önértékelés</h2>
      <div className="question-group">
        <div className="form-group">
          <label htmlFor="satisfaction">Mennyire vagy elégedett a jelenlegi fizikumoddal? (1 = egyáltalán nem, 10 = teljesen)</label>
          <div className="slider-container">
            <input type="range" className="range-slider" id="satisfaction" min="1" max="10" value={formData.selfAssessment.satisfaction} onChange={(e) => handleSliderChange(e, 'selfAssessment', 'satisfaction')} />
            {renderSliderScale()}
            <div className="slider-value" id="satisfactionValue">{getSliderDisplay('selfAssessment', 'satisfaction')}</div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="energy">Mennyire érzed magad energikusnak napközben?</label>
          <div className="slider-container">
            <input type="range" className="range-slider" id="energy" min="1" max="10" value={formData.selfAssessment.energy} onChange={(e) => handleSliderChange(e, 'selfAssessment', 'energy')} />
            {renderSliderScale()}
            <div className="slider-value" id="energyValue">{getSliderDisplay('selfAssessment', 'energy')}</div>
          </div>
        </div>

        <div className="form-group">
          <label>Mi akadályozott eddig a rendszeres edzésben?</label>
          <div className="checkbox-group">
            <label className="checkbox-label"><input type="checkbox" name="obstacles[]" value="time" checked={formData.selfAssessment.obstacles.includes('time')} onChange={(e) => handleCheckboxGroup(e, 'selfAssessment', 'obstacles', 'time')} />Időhiány</label>
            <label className="checkbox-label"><input type="checkbox" name="obstacles[]" value="motivation" checked={formData.selfAssessment.obstacles.includes('motivation')} onChange={(e) => handleCheckboxGroup(e, 'selfAssessment', 'obstacles', 'motivation')} />Motiváció hiánya</label>
            <label className="checkbox-label"><input type="checkbox" name="obstacles[]" value="knowledge" checked={formData.selfAssessment.obstacles.includes('knowledge')} onChange={(e) => handleCheckboxGroup(e, 'selfAssessment', 'obstacles', 'knowledge')} />Tudás hiánya</label>
            <label className="checkbox-label"><input type="checkbox" name="obstacles[]" value="money" checked={formData.selfAssessment.obstacles.includes('money')} onChange={(e) => handleCheckboxGroup(e, 'selfAssessment', 'obstacles', 'money')} />Pénzügyi okok</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comments">Egyéb megjegyzések vagy igények:</label>
          <textarea className="input-field" id="comments" rows="4" placeholder="Bármi más, amit szeretnél megosztani..." value={formData.selfAssessment.comments} onChange={handleInputChange} name="comments"></textarea>
        </div>
      </div>
    </div>

    <div className="navigation-buttons" id="navButtons">
      <button className="nav-btn prev-btn" id="prevBtn" onClick={prevSection} disabled={currentSection === 1}>
        <i className="fas fa-arrow-left"></i> Előző
      </button>
      <button className="nav-btn next-btn" id="nextBtn" onClick={nextSection} disabled={currentSection === totalSections}>
        Következő <i className="fas fa-arrow-right"></i>
      </button>
    </div>

    <div id="submitContainer" style={{ display: currentSection === totalSections ? 'block' : 'none', textAlign: 'center', marginTop: '40px' }}>
      <button className="submit-btn" onClick={submitQuestionnaire}>
        <i className="fas fa-check-circle"></i> Kérdőív beküldése
      </button>
    </div>

    <div className="section-counter" id="sectionCounter">
      {[...Array(totalSections)].map((_, i) => (
        <div key={i} className={`section-dot ${currentSection === i + 1 ? 'active' : ''}`} data-section={i + 1} onClick={() => goToSection(i + 1)}></div>
      ))}
    </div>
  </>
);

export default QuestionnaireSectionsSecondary;