import React from 'react';

const QuestionnaireSectionsPrimary = ({
  currentSection,
  formData,
  errors,
  skipped,
  handleInputChange,
  handleCheckboxGroup,
  handleSkip
}) => (
  <>
    <div className={`question-section ${currentSection === 1 ? 'active' : ''}`} id="section1">
      <h2 className="question-title">1. Alap információk</h2>

      <div className="question-group">
        <div className="form-group">
          <label htmlFor="gender">Nem</label>
          <select className="input-field" id="gender" value={formData.personalInfo.gender} onChange={handleInputChange} name="gender" required>
            <option value="">Válasszon...</option>
            <option value="male">Férfi</option>
            <option value="female">Nő</option>
            <option value="other">Egyéb</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="height">Magasság (cm)</label>
          <input type="number" className="input-field" id="height" min="100" max="250" value={formData.personalInfo.height} onChange={handleInputChange} onWheel={(event) => event.currentTarget.blur()} name="height" required />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Testsúly (kg)</label>
          <input type="number" className="input-field" id="weight" min="30" max="200" step="0.1" value={formData.personalInfo.weight} onChange={handleInputChange} onWheel={(event) => event.currentTarget.blur()} name="weight" required />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Születési dátum</label>
          <input type="date" className="input-field" id="birthDate" value={formData.personalInfo.birthDate} onChange={handleInputChange} name="birthDate" required />
        </div>

        <div className="form-group">
          <label>Napi aktivitási szint</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="activity" value="sedentary" checked={formData.personalInfo.activity === 'sedentary'} onChange={handleInputChange} required />Ülőmunka (kevés mozgás)</label>
            <label className="radio-label"><input type="radio" name="activity" value="light" checked={formData.personalInfo.activity === 'light'} onChange={handleInputChange} />Könnyű mozgás (1-3 nap/hét)</label>
            <label className="radio-label"><input type="radio" name="activity" value="moderate" checked={formData.personalInfo.activity === 'moderate'} onChange={handleInputChange} />Mérsékelt mozgás (3-5 nap/hét)</label>
            <label className="radio-label"><input type="radio" name="activity" value="very" checked={formData.personalInfo.activity === 'very'} onChange={handleInputChange} />Nagyon aktív (6-7 nap/hét)</label>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 2 ? 'active' : ''}`} id="section2">
      <h2 className="question-title">2. Edzés tapasztalat</h2>

      <div className="question-group">
        <div className="form-group">
          <label htmlFor="trainingFrequency">Mióta edzel?</label>
          <select className="input-field" id="trainingFrequency" value={formData.trainingExperience.frequency} onChange={handleInputChange} name="frequency" required>
            <option value="">Válasszon...</option>
            <option value="never">Soha</option>
            <option value="beginner">Kezdő (0-6 hónap)</option>
            <option value="intermediate">Középhaladó (6-24 hónap)</option>
            <option value="advanced">Haladó (2+ év)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hetente hányszor szoktál edzeni?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="weeklyTraining" value="0" checked={formData.trainingExperience.weeklyTraining === '0'} onChange={handleInputChange} required />0 alkalom</label>
            <label className="radio-label"><input type="radio" name="weeklyTraining" value="1-2" checked={formData.trainingExperience.weeklyTraining === '1-2'} onChange={handleInputChange} />1-2 alkalom</label>
            <label className="radio-label"><input type="radio" name="weeklyTraining" value="3-4" checked={formData.trainingExperience.weeklyTraining === '3-4'} onChange={handleInputChange} />3-4 alkalom</label>
            <label className="radio-label"><input type="radio" name="weeklyTraining" value="5+" checked={formData.trainingExperience.weeklyTraining === '5+'} onChange={handleInputChange} />5+ alkalom</label>
          </div>
        </div>

        <div className="form-group">
          <label>Milyen típusú edzéseket végeztél eddig? (több válasz is lehetséges)</label>
          <div className="checkbox-group">
            <label className="checkbox-label"><input type="checkbox" name="trainingTypes[]" value="weight" checked={formData.trainingExperience.trainingTypes.includes('weight')} onChange={(e) => handleCheckboxGroup(e, 'trainingExperience', 'trainingTypes', 'weight')} />Súlyzós edzés</label>
            <label className="checkbox-label"><input type="checkbox" name="trainingTypes[]" value="cardio" checked={formData.trainingExperience.trainingTypes.includes('cardio')} onChange={(e) => handleCheckboxGroup(e, 'trainingExperience', 'trainingTypes', 'cardio')} />Kardió</label>
            <label className="checkbox-label"><input type="checkbox" name="trainingTypes[]" value="crossfit" checked={formData.trainingExperience.trainingTypes.includes('crossfit')} onChange={(e) => handleCheckboxGroup(e, 'trainingExperience', 'trainingTypes', 'crossfit')} />Crossfit / funkcionális</label>
            <label className="checkbox-label"><input type="checkbox" name="trainingTypes[]" value="home" checked={formData.trainingExperience.trainingTypes.includes('home')} onChange={(e) => handleCheckboxGroup(e, 'trainingExperience', 'trainingTypes', 'home')} />Otthoni edzés</label>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 3 ? 'active' : ''}`} id="section3">
      <h2 className="question-title">3. Egészségügyi információk</h2>

      <div className="warning-note">
        <i className="fas fa-exclamation-triangle"></i>
        <span>Ezek az információk segítenek a biztonságos edzésterv elkészítésében. Minden adat bizalmas kezelés alá esik.</span>
      </div>

      <div className="question-group">
        <div className="form-group">
          <label>Van-e jelenleg sérülésed?</label>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="radio-group" style={{ flex: 1 }}>
              <label className="radio-label"><input type="radio" name="currentInjury" value="no" checked={formData.healthInfo.currentInjury === 'no'} onChange={handleInputChange} required={!skipped.currentInjury} disabled={skipped.currentInjury} />Nincs</label>
              <label className="radio-label"><input type="radio" name="currentInjury" value="shoulder" checked={formData.healthInfo.currentInjury === 'shoulder'} onChange={handleInputChange} required={!skipped.currentInjury} disabled={skipped.currentInjury} />Váll</label>
              <label className="radio-label"><input type="radio" name="currentInjury" value="knee" checked={formData.healthInfo.currentInjury === 'knee'} onChange={handleInputChange} required={!skipped.currentInjury} disabled={skipped.currentInjury} />Térd</label>
              <label className="radio-label"><input type="radio" name="currentInjury" value="back" checked={formData.healthInfo.currentInjury === 'back'} onChange={handleInputChange} required={!skipped.currentInjury} disabled={skipped.currentInjury} />Hát</label>
            </div>
            <button type="button" className={`skip-btn ${skipped.currentInjury ? 'is-skipped' : ''}`} id="skip-currentInjury" onClick={() => handleSkip('currentInjury')}>
              {skipped.currentInjury ? 'Kihagyás visszavonása' : 'Kihagyom'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Van-e krónikus betegséged?</label>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="checkbox-group" style={{ flex: 1 }}>
              <label className="checkbox-label"><input type="checkbox" name="chronicConditions[]" value="bloodPressure" checked={formData.healthInfo.chronicConditions.includes('bloodPressure')} onChange={(e) => handleCheckboxGroup(e, 'healthInfo', 'chronicConditions', 'bloodPressure')} disabled={skipped.chronicConditions} />Magas vérnyomás</label>
              <label className="checkbox-label"><input type="checkbox" name="chronicConditions[]" value="diabetes" checked={formData.healthInfo.chronicConditions.includes('diabetes')} onChange={(e) => handleCheckboxGroup(e, 'healthInfo', 'chronicConditions', 'diabetes')} disabled={skipped.chronicConditions} />Cukorbetegség</label>
              <label className="checkbox-label"><input type="checkbox" name="chronicConditions[]" value="heart" checked={formData.healthInfo.chronicConditions.includes('heart')} onChange={(e) => handleCheckboxGroup(e, 'healthInfo', 'chronicConditions', 'heart')} disabled={skipped.chronicConditions} />Szívprobléma</label>
              <label className="checkbox-label"><input type="checkbox" name="chronicConditions[]" value="other" checked={formData.healthInfo.chronicConditions.includes('other')} onChange={(e) => handleCheckboxGroup(e, 'healthInfo', 'chronicConditions', 'other')} disabled={skipped.chronicConditions} />Egyéb</label>
            </div>
            <button type="button" className={`skip-btn ${skipped.chronicConditions ? 'is-skipped' : ''}`} id="skip-chronicConditions" onClick={() => handleSkip('chronicConditions')}>
              {skipped.chronicConditions ? 'Kihagyás visszavonása' : 'Kihagyom'}
            </button>
          </div>
          {!skipped.chronicConditions && formData.healthInfo.chronicConditions.includes('other') && (
            <div className="form-group conditional-input-group">
              <label htmlFor="otherChronicCondition">Mi az egyéb betegséged?</label>
              <input type="text" className="input-field" id="otherChronicCondition" value={formData.healthInfo.otherChronicCondition} onChange={handleInputChange} name="healthInfo.otherChronicCondition" placeholder="Írd be az egyéb betegséget" required />
              {errors.otherChronicCondition && <small className="field-error">{errors.otherChronicCondition}</small>}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="medications">Szed-e rendszeresen gyógyszert?</label>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <textarea className="input-field" id="medications" rows="3" placeholder="Ha igen, kérjük írja le..." value={formData.healthInfo.medications} onChange={handleInputChange} name="medications" disabled={skipped.medications} style={{ flex: 1 }}></textarea>
            <button type="button" className={`skip-btn ${skipped.medications ? 'is-skipped' : ''}`} id="skip-medications" onClick={() => handleSkip('medications')}>
              {skipped.medications ? 'Kihagyás visszavonása' : 'Kihagyom'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className={`question-section ${currentSection === 4 ? 'active' : ''}`} id="section4">
      <h2 className="question-title">4. Célok</h2>

      <div className="question-group">
        <div className="form-group">
          <label>Mi a fő célod?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="mainGoal" value="weightLoss" checked={formData.goals.mainGoal === 'weightLoss'} onChange={handleInputChange} required />Fogyás</label>
            <label className="radio-label"><input type="radio" name="mainGoal" value="muscleGain" checked={formData.goals.mainGoal === 'muscleGain'} onChange={handleInputChange} />Izomtömeg-növelés</label>
            <label className="radio-label"><input type="radio" name="mainGoal" value="fitness" checked={formData.goals.mainGoal === 'fitness'} onChange={handleInputChange} />Általános fittség</label>
            <label className="radio-label"><input type="radio" name="mainGoal" value="strength" checked={formData.goals.mainGoal === 'strength'} onChange={handleInputChange} />Erőnövelés</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="timeframe">Mennyi idő alatt szeretnél eredményt?</label>
          <select className="input-field" id="timeframe" value={formData.goals.timeframe} onChange={handleInputChange} name="timeframe" required>
            <option value="">Válasszon...</option>
            <option value="1month">1 hónap</option>
            <option value="3months">3 hónap</option>
            <option value="6months">6 hónap</option>
            <option value="1year">1 év</option>
            <option value="longterm">Hosszú távú</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="specificGoal">Van-e konkrét cél?</label>
          <textarea className="input-field" id="specificGoal" rows="3" placeholder="Pl. -10 kg, fekvenyomás 100 kg, futás 5 km..." value={formData.goals.specificGoal} onChange={handleInputChange} name="specificGoal"></textarea>
        </div>

        <div className="form-group">
          <label>Szeretnél edzésterv mintát?</label>
          <div className="radio-group">
            <label className="radio-label"><input type="radio" name="workoutPlanRecommendation" value="yes" checked={formData.goals.workoutPlanRecommendation === 'yes'} onChange={handleInputChange} required />Igen</label>
            <label className="radio-label"><input type="radio" name="workoutPlanRecommendation" value="no" checked={formData.goals.workoutPlanRecommendation === 'no'} onChange={handleInputChange} />Nem</label>
          </div>
        </div>

        <div className="form-group">
          <label>Mi a legnagyobb motivációd?</label>
          <div className="checkbox-group">
            <label className="checkbox-label"><input type="checkbox" name="motivation[]" value="health" checked={formData.goals.motivation.includes('health')} onChange={(e) => handleCheckboxGroup(e, 'goals', 'motivation', 'health')} />Egészség</label>
            <label className="checkbox-label"><input type="checkbox" name="motivation[]" value="appearance" checked={formData.goals.motivation.includes('appearance')} onChange={(e) => handleCheckboxGroup(e, 'goals', 'motivation', 'appearance')} />Kinézet</label>
            <label className="checkbox-label"><input type="checkbox" name="motivation[]" value="performance" checked={formData.goals.motivation.includes('performance')} onChange={(e) => handleCheckboxGroup(e, 'goals', 'motivation', 'performance')} />Teljesítmény</label>
            <label className="checkbox-label"><input type="checkbox" name="motivation[]" value="confidence" checked={formData.goals.motivation.includes('confidence')} onChange={(e) => handleCheckboxGroup(e, 'goals', 'motivation', 'confidence')} />Magabiztosság</label>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default QuestionnaireSectionsPrimary;