import React, { useEffect, useRef, useState } from 'react';
import '../questionnaire.css';
import FeedbackModal from '../../components/FeedbackModal';
import QuestionnaireHeader from './QuestionnaireHeader';
import QuestionnaireSectionsPrimary from './QuestionnaireSectionsPrimary';
import QuestionnaireSectionsSecondary from './QuestionnaireSectionsSecondary';

const MIN_REALISTIC_WEIGHT_KG = 30;
const MAX_REALISTIC_WEIGHT_KG = 200;
const getTodayInputDate = () => new Date().toISOString().split('T')[0];

const QuestionnairePage = ({ navigateTo, setIsLoggedIn }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 8;
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    personalInfo: { gender: '', height: '', weight: '', birthDate: '', activity: '' },
    trainingExperience: { frequency: '', weeklyTraining: '', trainingTypes: [] },
    healthInfo: { currentInjury: '', chronicConditions: [], otherChronicCondition: '', medications: '' },
    goals: { mainGoal: '', timeframe: '', specificGoal: '', motivation: [], workoutPlanRecommendation: '' },
    lifestyle: { sleepHours: '7', stressLevel: '5', sittingTime: '' },
    nutrition: { diet: [], allergies: '', dietControl: '5', dietRecommendations: '' },
    preferences: { trainingLocation: '', workoutTime: '', preferredFrequency: '' },
    selfAssessment: { satisfaction: '5', energy: '5', obstacles: [], comments: '' }
  });
  const [skipped, setSkipped] = useState({ currentInjury: false, chronicConditions: false, medications: false });
  const [errors, setErrors] = useState({});
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    const today = new Date();
    document.getElementById('birthDate')?.setAttribute('max', today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${(currentSection / totalSections) * 100}%`;
    }
  }, [currentSection]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentSection]);

  useEffect(() => {
    const inputs = document.querySelectorAll('.questionnaire-container input[type="number"], .questionnaire-container select');
    const preventWheelChange = (event) => {
      event.currentTarget.blur();
    };

    inputs.forEach((input) => input.addEventListener('wheel', preventWheelChange));
    return () => {
      inputs.forEach((input) => input.removeEventListener('wheel', preventWheelChange));
    };
  }, [currentSection]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, id } = e.target;
    const isBirthDateField = name === 'birthDate' || id === 'birthDate';
    const normalizedValue = isBirthDateField && value ? (value > getTodayInputDate() ? getTodayInputDate() : value) : value;

    if (id && id.includes('.')) {
      const [category, field] = id.split('.');
      setFormData((prev) => ({ ...prev, [category]: { ...prev[category], [field]: type === 'checkbox' ? checked : normalizedValue } }));
    } else if (name && name.includes('.')) {
      const [category, field] = name.split('.');
      setFormData((prev) => ({ ...prev, [category]: { ...prev[category], [field]: type === 'checkbox' ? checked : normalizedValue } }));
    } else {
      setFormData((prev) => {
        const newData = { ...prev };
        if (id && id.includes('.')) {
          const [category, field] = id.split('.');
          newData[category][field] = normalizedValue;
        } else {
          for (const category in prev) {
            if (prev[category].hasOwnProperty(name)) {
              newData[category][name] = normalizedValue;
              break;
            }
          }
        }
        return newData;
      });
    }

    if (errors[name] || errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleCheckboxGroup = (e, category, field, value) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      let currentArray = [...prev[category][field]];

      if (category === 'nutrition' && field === 'diet') {
        if (checked && value === 'none') {
          currentArray = ['none'];
        } else if (checked) {
          currentArray = currentArray.filter((item) => item !== 'none');
          if (!currentArray.includes(value)) currentArray.push(value);
        } else {
          currentArray = currentArray.filter((item) => item !== value);
        }
      } else if (checked) {
        if (!currentArray.includes(value)) currentArray.push(value);
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) currentArray.splice(index, 1);
      }

      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: currentArray,
          ...(category === 'healthInfo' && field === 'chronicConditions' && !currentArray.includes('other') ? { otherChronicCondition: '' } : {})
        }
      };
    });

    if (category === 'healthInfo' && field === 'chronicConditions' && value === 'other' && !checked) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors.otherChronicCondition;
        return nextErrors;
      });
    }
  };

  const handleSliderChange = (e, category, field) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
    const displayElement = document.getElementById(`${field}Value`);
    if (displayElement) {
      displayElement.textContent = field === 'sleepHours' ? `${value} óra` : `${value}/10`;
    }
  };

  const handleSkip = (field) => {
    setSkipped((prev) => {
      const nextSkipped = !prev[field];
      if (nextSkipped) {
        if (field === 'currentInjury') {
          setFormData((currentFormData) => ({ ...currentFormData, healthInfo: { ...currentFormData.healthInfo, currentInjury: '' } }));
        } else if (field === 'chronicConditions') {
          setFormData((currentFormData) => ({ ...currentFormData, healthInfo: { ...currentFormData.healthInfo, chronicConditions: [], otherChronicCondition: '' } }));
        } else if (field === 'medications') {
          setFormData((currentFormData) => ({ ...currentFormData, healthInfo: { ...currentFormData.healthInfo, medications: '' } }));
        }
      }
      return { ...prev, [field]: nextSkipped };
    });

    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (field === 'currentInjury') delete nextErrors.currentInjury;
      if (field === 'chronicConditions') {
        delete nextErrors.chronicConditions;
        delete nextErrors.otherChronicCondition;
      }
      if (field === 'medications') delete nextErrors.medications;
      return nextErrors;
    });
  };

  const validateSection = (section) => {
    const sectionErrors = {};
    const sectionEl = document.getElementById(`section${section}`);
    if (!sectionEl) return true;
    const requiredInputs = sectionEl.querySelectorAll('[required]');
    const validatedGroups = new Set();
    let isValid = true;

    requiredInputs.forEach((input) => {
      const isCheckboxGroup = input.type === 'checkbox' && input.name && input.name.includes('[]');
      const isRadioGroup = input.type === 'radio' && input.name;

      if (isRadioGroup) {
        if (validatedGroups.has(input.name)) return;
        validatedGroups.add(input.name);
        const checkedExists = sectionEl.querySelectorAll(`input[name="${input.name}"]:checked`).length > 0;
        if (!checkedExists) {
          isValid = false;
          sectionErrors[input.name] = 'Kérjük, válasszon egy opciót';
          const group = input.closest('.radio-group');
          if (group) {
            group.style.animation = 'shake 0.5s';
            setTimeout(() => { group.style.animation = ''; }, 500);
          }
        }
        return;
      }

      if (isCheckboxGroup) {
        const name = input.name.replace('[]', '');
        if (validatedGroups.has(name)) return;
        validatedGroups.add(name);
        const checkedExists = sectionEl.querySelectorAll(`input[name="${input.name}"]:checked`).length > 0;
        if (!checkedExists) {
          isValid = false;
          sectionErrors[name] = 'Kérjük, válasszon legalább egy opciót';
          const group = input.closest('.checkbox-group');
          if (group) {
            group.style.animation = 'shake 0.5s';
            setTimeout(() => { if (group) group.style.animation = ''; }, 500);
          }
        }
      } else {
        const value = input.type === 'checkbox' ? input.checked : String(input.value || '').trim();
        if (!value) {
          isValid = false;
          sectionErrors[input.name || input.id] = 'Ez a mező kötelező';
          input.style.borderColor = 'var(--primary)';
          input.style.animation = 'shake 0.5s';
          setTimeout(() => { input.style.animation = ''; }, 500);
        } else {
          input.style.borderColor = '';
        }
      }
    });

    if (section === 3 && !skipped.chronicConditions && formData.healthInfo.chronicConditions.includes('other')) {
      const otherCondition = String(formData.healthInfo.otherChronicCondition || '').trim();
      if (!otherCondition) {
        isValid = false;
        sectionErrors.otherChronicCondition = 'Írd be az egyéb betegséget is.';
      }
    }

    if (!isValid) {
      setModalConfig({ type: 'warning', title: 'Hiányzó adatok', message: 'Kérjük, töltsd ki az összes kötelező mezőt, mielőtt továbblépsz.', confirmLabel: 'Rendben' });
    }

    if (section === 1) {
      const weightValue = parseFloat((formData.personalInfo.weight || '').toString().replace(',', '.'));
      const birthDateValue = String(formData.personalInfo.birthDate || '');
      if (!Number.isFinite(weightValue) || weightValue < MIN_REALISTIC_WEIGHT_KG || weightValue > MAX_REALISTIC_WEIGHT_KG) {
        sectionErrors.weight = `A testsúlynak ${MIN_REALISTIC_WEIGHT_KG} és ${MAX_REALISTIC_WEIGHT_KG} kg között kell lennie.`;
        setModalConfig({ type: 'warning', title: 'Hibás testsúly', message: `Adj meg egy valós testsúlyt ${MIN_REALISTIC_WEIGHT_KG} és ${MAX_REALISTIC_WEIGHT_KG} kg között.`, confirmLabel: 'Rendben' });
        setErrors(sectionErrors);
        return false;
      }
      if (birthDateValue && birthDateValue > getTodayInputDate()) {
        sectionErrors.birthDate = 'A születési dátum nem lehet jövőbeli.';
        setModalConfig({ type: 'warning', title: 'Hibás dátum', message: 'A születési dátum nem lehet későbbi a mai napnál.', confirmLabel: 'Rendben' });
        setErrors(sectionErrors);
        return false;
      }
    }

    setErrors(sectionErrors);
    return isValid;
  };

  const nextSection = () => {
    if (validateSection(currentSection) && currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
  };

  const goToSection = (section) => {
    setCurrentSection(section);
  };

  const submitQuestionnaire = async () => {
    if (!validateSection(currentSection)) return;
    const questionnaireData = { ...formData, submittedAt: new Date().toISOString() };
    try {
      const token = localStorage.getItem('powerplan_token');
      const currentUserStr = localStorage.getItem('powerplan_current_user');
      const userId = currentUserStr ? JSON.parse(currentUserStr).id : null;
      if (!userId) {
        setModalConfig({ type: 'error', title: 'Bejelentkezés szükséges', message: 'Nem vagy bejelentkezve. Kérjük, jelentkezz be a kérdőív mentéséhez.', confirmLabel: 'Rendben' });
        return;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch('http://localhost:5001/api/questionnaire', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, questionnaire: questionnaireData })
      });
      if (!response.ok) {
        const errData = await response.json();
        console.error('Hiba az adatbázisba mentéskor:', errData);
        setModalConfig({ type: 'error', title: 'Mentési hiba', message: errData.error || 'Nem sikerült menteni az adatokat az adatbázisba.', confirmLabel: 'Rendben' });
        return;
      }
    } catch (error) {
      console.error('Nem sikerült csatlakozni a szerverhez:', error);
      setModalConfig({ type: 'error', title: 'Szerverhiba', message: 'Nem sikerült csatlakozni a backendhez.', confirmLabel: 'Rendben' });
      return;
    }

    localStorage.setItem('powerplan_questionnaire', JSON.stringify(questionnaireData));
    localStorage.setItem('powerplan_user_completed_questionnaire', 'true');
    if (setIsLoggedIn) setIsLoggedIn(true);
    setModalConfig({ type: 'success', title: 'Kérdőív sikeresen elküldve', message: 'Köszönjük a kérdőív kitöltését. Az adataid alapján személyre szabott edzéstervet készítünk.', confirmLabel: 'Tovább a dashboardra', action: 'dashboard' });
  };

  const handleModalClose = () => {
    const action = modalConfig?.action;
    setModalConfig(null);
    if (action === 'dashboard') {
      if (navigateTo) navigateTo('dashboard');
      else window.location.href = '/dashboard';
    }
  };

  const getSliderDisplay = (category, field) => {
    const value = formData[category]?.[field];
    return field === 'sleepHours' ? `${value} óra` : `${value}/10`;
  };

  const renderSliderScale = () => (
    <div className="slider-scale" aria-hidden="true">
      <span>1</span>
      <span>10</span>
    </div>
  );

  return (
    <div className="questionnaire-container" ref={containerRef}>
      <QuestionnaireHeader currentSection={currentSection} totalSections={totalSections} />
      <div className="questionnaire-content">
        <QuestionnaireSectionsPrimary
          currentSection={currentSection}
          formData={formData}
          errors={errors}
          skipped={skipped}
          handleInputChange={handleInputChange}
          handleCheckboxGroup={handleCheckboxGroup}
          handleSkip={handleSkip}
        />
        <QuestionnaireSectionsSecondary
          currentSection={currentSection}
          totalSections={totalSections}
          formData={formData}
          handleInputChange={handleInputChange}
          handleCheckboxGroup={handleCheckboxGroup}
          handleSliderChange={handleSliderChange}
          getSliderDisplay={getSliderDisplay}
          renderSliderScale={renderSliderScale}
          prevSection={prevSection}
          nextSection={nextSection}
          submitQuestionnaire={submitQuestionnaire}
          goToSection={goToSection}
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
    </div>
  );
};

export default QuestionnairePage;