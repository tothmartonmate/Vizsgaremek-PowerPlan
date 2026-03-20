import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useJsApiLoader } from '@react-google-maps/api';
import './dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// GYAKORLAT ADATBÁZIS
const EXERCISE_DB = {
  'Mell': ['Fekvenyomás (Rúd)', 'Fekvenyomás (Kézisúlyzó)', 'Ferde pados nyomás', 'Tárogatás', 'Kábelkereszt', 'Tolódzkodás (Mellre)'],
  'Hát': ['Húzódzkodás', 'Lehúzás csigán', 'Döntött törzsű evezés', 'T-rudas evezés', 'Evezés csigán', 'Felhúzás (Deadlift)'],
  'Láb': ['Guggolás', 'Mellső guggolás', 'Bolgár guggolás', 'Lábnytolás', 'Combfeszítő', 'Combhajlító', 'Kitörés', 'Vádli'],
  'Váll': ['Vállból nyomás', 'Oldalemelés', 'Előreemelés', 'Döntött oldalemelés', 'Vállvonogatás (Csuklya)'],
  'Bicepsz': ['Bicepsz karhajlítás rúddal', 'Váltott karú bicepsz', 'Kalapács bicepsz', 'Scott-pad'],
  'Tricepsz': ['Tricepsz letolás csigán', 'Koponyazúzó', 'Lórúgás', 'Szűknyomás', 'Tolódzkodás'],
  'Has': ['Hasprés', 'Lábemelés lógva', 'Plank', 'Orosz csavar', 'Kábeles favágó']
};

// EDZÉSTÍPUS SZERINTI IZOMCSOPORT SZŰRŐ
const MUSCLE_FILTER = {
  'push': ['Mell', 'Váll', 'Tricepsz'],
  'pull': ['Hát', 'Bicepsz'],
  'legs': ['Láb', 'Has'],
  'full_body': Object.keys(EXERCISE_DB)
};

const Dashboard = ({ navigateTo, handleLogout }) => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarActive, setSidebarActive] = useState(false);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [modalOpen, setModalOpen] = useState(null);
  
  const [userData, setUserData] = useState({});
  const [workoutData, setWorkoutData] = useState({ weeklyPlan: [], stats: {}, aiRecommendation: '' });
  const [nutritionData, setNutritionData] = useState({ todayMeals: [], macros: {}, recommendations: [] });
  const [challengesData, setChallengesData] = useState({});

  // Dinamikus edzés űrlap state-ek
  const [workoutFormDetails, setWorkoutFormDetails] = useState({ name: '', type: '', day: '' });
  const [exercisesList, setExercisesList] = useState([
    { id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }
  ]);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: 'AIzaSyDummyKey' });

  useEffect(() => {
    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (currentUser) {
      setUserData({
        email: currentUser.email || '',
        personalInfo: { firstName: currentUser.full_name?.split(' ')[1] || '', lastName: currentUser.full_name?.split(' ')[0] || '' }
      });

      if (currentUser.id && token && currentUser.id !== 'demo-999') {
        loadUserData(currentUser.id, token, currentUser);
        loadDashboardData(currentUser.id, token);
      }
    } else {
      if (navigateTo) navigateTo('home');
    }
  }, []);

  const loadUserData = async (userId, token, currentUser) => {
    try {
      const response = await fetch(`http://localhost:5001/api/questionnaire/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data && data.questionnaire) {
          setUserData(prev => ({ ...data.questionnaire, ...prev, personalInfo: { ...data.questionnaire.personalInfo, ...prev.personalInfo } }));
        }
      }
    } catch (error) { console.error(error); }
  };

  const loadDashboardData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dashboard/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNutritionData(data.nutrition);
          setWorkoutData(data.workout);
          setChallengesData(data.challenges);
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') return alert('Demó módban vagy az adat mentése sikertelen.');

    const mealData = {
      userId: currentUser.id, mealType: document.getElementById('mealType').value,
      foodName: document.getElementById('mealName').value, description: document.getElementById('mealDescription').value,
      calories: document.getElementById('mealCalories').value
    };

    try {
      const response = await fetch('http://localhost:5001/api/meals', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(mealData) });
      if (response.ok) {
        alert('Étkezés naplózva!'); closeModal(); loadDashboardData(currentUser.id, token); document.getElementById('mealLogForm').reset();
      }
    } catch (error) { alert('Hiba a mentéskor!'); }
  };

  // --- TÖBB GYAKORLAT ÉS SZETT KEZELÉSE ŰRLAPON BELÜL ---
  const handleAddExerciseBlock = () => {
    setExercisesList([...exercisesList, { id: Date.now(), muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
  };

  const handleRemoveExerciseBlock = (id) => {
    setExercisesList(exercisesList.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id, field, value) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === id) {
        if (field === 'muscleGroup') return { ...ex, muscleGroup: value, name: '' }; // Reseteljük a nevet, ha új izmot választ
        return { ...ex, [field]: value };
      }
      return ex;
    }));
  };

  const handleAddSet = (exerciseId) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) { return { ...ex, sets: [...ex.sets, { weight: '', reps: '', rpe: '' }] }; }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId, setIndex) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) { return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }; }
      return ex;
    }));
  };

  const handleSetChange = (exerciseId, setIndex, field, value) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex][field] = value;
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    
    if (!currentUser.id || currentUser.id === 'demo-999') return alert('Demó módban a mentés nem elérhető!');
    if (!workoutFormDetails.type) return alert('Kérlek válassz edzés típust (Push/Pull stb.)!');
    
    // Ellenőrzés: minden gyakorlat ki van-e töltve
    const isValid = exercisesList.every(ex => ex.muscleGroup && ex.name && ex.sets.length > 0);
    if (!isValid) return alert('Kérlek válassz izomcsoportot és gyakorlatot minden blokkban!');

    const payload = {
      userId: currentUser.id,
      name: workoutFormDetails.name,
      workoutType: workoutFormDetails.type,
      scheduledDay: workoutFormDetails.day,
      exercises: exercisesList // Egyben küldjük a szervernek az összes gyakorlatot és szettet!
    };

    try {
      const response = await fetch('http://localhost:5001/api/workouts', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Komplett edzésterv elmentve!');
        closeModal();
        loadDashboardData(currentUser.id, token);
        setWorkoutFormDetails({ name: '', type: '', day: '' });
        setExercisesList([{ id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
      } else { alert('Hiba a mentés során.'); }
    } catch (error) { alert('Hálózat hiba a mentéskor!'); }
  };

  const navigateToSection = (section) => { setCurrentSection(section); if (window.innerWidth <= 992) setSidebarActive(false); };
  
  const updateDateTime = () => {
    const now = new Date();
    const el = document.getElementById('currentDateTime');
    if (el) el.textContent = now.toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    let timer;
    if (workoutActive) timer = setInterval(() => setWorkoutTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [workoutActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60); const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleWorkout = () => setWorkoutActive(!workoutActive);
  const stopWorkout = () => { setWorkoutActive(false); setWorkoutTime(0); alert('Edzés befejezve!'); };
  const toggleSidebar = () => setSidebarActive(!sidebarActive);
  const closeModal = () => setModalOpen(null);
  const showMealLogModal = () => setModalOpen('mealLog');
  const showWorkoutModal = () => setModalOpen('workoutLog');
  const changeWeek = (delta) => setCurrentWeek(prev => prev + delta);
  const selectDay = (dayIndex) => { document.querySelectorAll('.day-card').forEach((c, i) => c.classList.toggle('active', i === dayIndex)); };
  const logout = () => { if (window.confirm('Biztosan ki szeretnél jelentkezni?')) { localStorage.clear(); if (navigateTo) navigateTo('home'); else window.location.href = '/'; } };

  // GRAFIKONOK DINAMIKUS FELTÖLTÉSE
  // 1. Súly grafikon (Ha lenne history, most csak a jelenlegi súly egyenesen)
  const userWeight = userData.personalInfo?.weight ? parseFloat(userData.personalInfo.weight) : 0;
  const weightChartData = {
    labels: ['Indulás', '1 hete', 'Ma'],
    datasets: [{ label: 'Testsúly (kg)', data: userWeight ? [userWeight+1, userWeight+0.5, userWeight] : [], borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', borderWidth: 3, fill: true, tension: 0.4 }]
  };

  // 2. Edzési gyakoriság grafikon (Kiszámoljuk az adatbázisból melyik nap mennyi edzés van)
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const workoutCounts = daysOfWeek.map(day => {
    return workoutData.weeklyPlan?.filter(w => w.day === day).length || 0;
  });
  // Felszorozzuk pl 60 perccel, hogy percben mutassa
  const workoutMinutes = workoutCounts.map(count => count * 60);

  const workoutChartData = {
    labels: ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'],
    datasets: [{ data: workoutMinutes, backgroundColor: ['#e63946', '#f4a261', '#2a9d8f', '#e63946', '#f4a261', '#e9c46a', '#ddd'] }]
  };
  const chartOptions = (yLabel) => ({ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: yLabel } }, x: { grid: { display: false } } } });

  const sectionTitles = {
    'dashboard': { icon: 'fa-home', text: 'Dashboard', subtitle: 'Üdvözöljük az Ön személyre szabott edzés dashboard-án' },
    'workout-plan': { icon: 'fa-dumbbell', text: 'Edzésterv', subtitle: 'Heti edzésterv és gyakorlatok' },
    'workout-mode': { icon: 'fa-play-circle', text: 'Edzés mód', subtitle: 'Aktív edzés követése' },
    'progress': { icon: 'fa-chart-line', text: 'Haladás', subtitle: 'Statisztikák és fejlődés' },
    'nutrition': { icon: 'fa-utensils', text: 'Táplálkozás', subtitle: 'Táplálkozási terv és kalóriakövetés' },
    'profile': { icon: 'fa-user-circle', text: 'Profil', subtitle: 'Személyes adatok és beállítások' }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <button className="menu-toggle" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
        <div className="logo"><i className="fas fa-dumbbell"></i><span>PowerPlan</span></div>
        <div className="user-profile">
          <div className="profile-pic" onClick={() => navigateToSection('profile')}><i className="fas fa-user"></i></div>
          <div className="user-name">{userData.personalInfo?.lastName || ''} {userData.personalInfo?.firstName || ''}</div>
          <div className="user-goal">{userData.goals?.mainGoal || 'Cél nincs megadva'}</div>
        </div>
        <div className="nav-menu">
          {Object.keys(sectionTitles).map(section => (
            <div key={section} className={`nav-item ${currentSection === section ? 'active' : ''}`} onClick={() => navigateToSection(section)}>
              <i className={`fas ${sectionTitles[section].icon}`}></i><span>{sectionTitles[section].text}</span>
            </div>
          ))}
        </div>
        <button className="logout-btn" onClick={logout}><i className="fas fa-sign-out-alt"></i><span>Kijelentkezés</span></button>
      </div>

      <div className={`main-content ${sidebarActive ? 'full-width' : ''}`}>
        <div className="top-bar">
          <div className="page-title">
            <h1><i className={`fas ${sectionTitles[currentSection]?.icon}`}></i><span>{sectionTitles[currentSection]?.text}</span></h1>
            <p>{sectionTitles[currentSection]?.subtitle}</p>
          </div>
          <div className="top-actions"><div className="date-time" id="currentDateTime"></div></div>
        </div>

        {/* Dashboard Section */}
        <div className={`content-section ${currentSection === 'dashboard' ? 'active' : ''}`}>
          <div className="card">
            <div className="section-header">
              <h2>Üdvözöljük, <span>{userData.personalInfo?.firstName || 'Felhasználó'}</span>!</h2>
            </div>
            
            <div style={{ padding: '15px', background: 'rgba(42, 157, 143, 0.1)', borderRadius: '10px', borderLeft: '4px solid var(--success)', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '10px' }}><i className="fas fa-robot"></i> AI Ajánlás a céljaidhoz:</h3>
              <p style={{ fontWeight: '500' }}>{workoutData.aiRecommendation || 'Töltsd ki a kérdőívet a személyre szabott tippekért!'}</p>
            </div>

            <div className="workout-actions">
              <button className="btn btn-secondary" onClick={() => navigateToSection('workout-plan')}><i className="fas fa-list"></i> Teljes edzésterv</button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-dumbbell"></i></div>
              <div className="stat-info">
                <h3>FELVETT EDZÉSNAPOK</h3>
                <div className="stat-number">{workoutData.stats?.totalWorkouts || 0} db</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-fire"></i></div>
              <div className="stat-info">
                <h3>ELÉGETETT KALÓRIA</h3>
                <div className="stat-number">{nutritionData.dailyCalories || 0}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-weight"></i></div>
              <div className="stat-info">
                <h3>JELENLEGI TESTSÚLY</h3>
                <div className="stat-number">{userData.personalInfo?.weight || '-'} kg</div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <div className="section-header"><h3>Súlyfejlődés</h3></div>
              <Line data={weightChartData} options={chartOptions('Testsúly (kg)')} />
            </div>
            <div className="chart-container">
              <div className="section-header"><h3>Edzési gyakoriság</h3></div>
              <Bar data={workoutChartData} options={chartOptions('Edzés Perc')} />
            </div>
          </div>
        </div>

        {/* Workout Plan Section */}
        <div className={`content-section ${currentSection === 'workout-plan' ? 'active' : ''}`}>
          <div className="card">
            <div className="section-header">
              <h2><i className="fas fa-dumbbell"></i> Heti Edzésterv</h2>
            </div>
            <div className="week-days">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => {
                const dayNamesHU = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
                const isToday = (index === (new Date().getDay() + 6) % 7);
                return (
                  <div key={index} className={`day-card ${isToday ? 'active' : ''}`} onClick={() => selectDay(index)}>
                    <div className="day-name">{dayNamesHU[index]}</div>
                  </div>
                );
              })}
            </div>
            
            {workoutData.weeklyPlan && workoutData.weeklyPlan.length > 0 ? (
               <div className="exercise-list" style={{ marginTop: '30px' }}>
                 {/* Végigmegyünk a lekérdezett edzésnapokon */}
                 {workoutData.weeklyPlan.map((workout, index) => (
                    <div key={index} className="exercise-card" style={{ display: 'block', width: '100%', background: 'white', border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid var(--primary)' }}>
                        <div className="exercise-icon"><i className="fas fa-dumbbell"></i></div>
                        <div className="exercise-info">
                          <h4 style={{ fontSize: '1.2rem' }}>{workout.name} ({workout.type})</h4>
                          <div className="exercise-details">Nap: {workout.day} | Összesen {workout.exercises.length} gyakorlat</div>
                        </div>
                      </div>
                      
                      {/* Edzésnapon belüli gyakorlatok listázása */}
                      <div style={{ padding: '10px' }}>
                        {workout.exercises.map((ex, exIndex) => (
                          <div key={exIndex} style={{ marginBottom: '15px', padding: '10px', background: 'var(--light)', borderRadius: '8px' }}>
                            <strong style={{ color: 'var(--dark)' }}>{ex.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>({ex.muscle})</span>
                            <div style={{ marginTop: '8px' }}>
                              {ex.sets.map((set, sIndex) => (
                                <div key={sIndex} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '4px 0', fontSize: '0.85rem' }}>
                                  <span>Szett {sIndex + 1}:</span>
                                  <span>{set.weight} kg</span>
                                  <span>{set.reps} ism.</span>
                                  <span>{set.rpe ? `RPE: ${set.rpe}` : '-'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 ))}
               </div>
            ) : (
              <p style={{ color: 'var(--gray)', padding: '20px 0', textAlign: 'center' }}>Még nincs aktív edzésterved betöltve az adatbázisból.</p>
            )}

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button className="btn btn-primary" onClick={showWorkoutModal}>
                <i className="fas fa-plus"></i> Új Edzés és Gyakorlat Felvétele
              </button>
            </div>
          </div>
        </div>

        {/* Workout Mode Section */}
        <div className={`content-section ${currentSection === 'workout-mode' ? 'active' : ''}`}>
          <div className="workout-mode">
            <div className="section-header">
              <h2><i className="fas fa-play-circle"></i> Edzés mód</h2>
              <button className="btn btn-secondary" onClick={stopWorkout}><i className="fas fa-stop"></i> Edzés befejezése</button>
            </div>
            <div className="current-exercise">
              <h3>Nincs aktív gyakorlat</h3>
              <p>Kérlek előbb vegyél fel egy edzéstervet!</p>
            </div>
            <div className="workout-timer">{formatTime(workoutTime)}</div>
            <div className="workout-controls">
              <button className="control-btn" onClick={() => {}}><i className="fas fa-step-backward"></i></button>
              <button className="control-btn" onClick={toggleWorkout}><i className={`fas ${workoutActive ? 'fa-pause' : 'fa-play'}`}></i></button>
              <button className="control-btn" onClick={() => {}}><i className="fas fa-step-forward"></i></button>
            </div>
          </div>
        </div>

        {/* Nutrition Section */}
        <div className={`content-section ${currentSection === 'nutrition' ? 'active' : ''}`}>
          <div className="card">
            <div className="section-header">
              <h2><i className="fas fa-utensils"></i> Napi Táplálkozási Terv</h2>
              <button className="btn btn-primary" onClick={showMealLogModal}><i className="fas fa-plus"></i> Étkezés naplózása</button>
            </div>
            <div className="meal-plan">
              {nutritionData.todayMeals?.map((meal, index) => (
                <div key={index} className="meal-card">
                  <div className="meal-time">{meal.time}</div>
                  <h4 style={{ marginBottom: '10px' }}>{meal.name}</h4>
                  <p style={{ color: 'var(--gray)', marginBottom: '15px' }}>{meal.description}</p>
                  <div className="macros">
                    <div className="macro"><div className="macro-value">{meal.calories}</div><div className="macro-label">Kcal</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className={`content-section ${currentSection === 'profile' ? 'active' : ''}`}>
          <div className="card">
            <div className="section-header">
              <h2><i className="fas fa-user-circle"></i> Profilom</h2>
            </div>
            <div className="profile-form">
              <div className="form-group">
                <label>Név</label>
                <input type="text" className="form-control" defaultValue={`${userData.personalInfo?.lastName || ''} ${userData.personalInfo?.firstName || ''}`.trim()} readOnly />
              </div>
              <div className="form-group">
                <label>Email cím</label>
                <input type="email" className="form-control" defaultValue={userData.email || ''} readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Étkezés naplózása */}
      <div className={`modal ${modalOpen === 'mealLog' ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="section-header">
            <h2><i className="fas fa-plus"></i> Étkezés naplózása</h2>
            <button className="btn btn-secondary" onClick={closeModal}><i className="fas fa-times"></i></button>
          </div>
          <form id="mealLogForm" onSubmit={handleMealSubmit}>
            <div className="form-group">
              <label>Étkezés típusa</label>
              <select className="form-control" id="mealType" defaultValue="" required>
                <option value="" disabled>Válasszon...</option>
                <option value="breakfast">Reggeli</option>
                <option value="lunch">Ebéd</option>
                <option value="dinner">Vacsora</option>
                <option value="snack">Nassolás</option>
              </select>
            </div>
            <div className="form-group"><label>Étel neve</label><input type="text" className="form-control" id="mealName" required /></div>
            <div className="form-group"><label>Kalória (kcal)</label><input type="number" className="form-control" id="mealCalories" required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Naplózás</button>
          </form>
        </div>
      </div>

      {/* DINAMIKUS MODAL: Edzésterv Hozzáadása */}
      <div className={`modal ${modalOpen === 'workoutLog' ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '700px' }}>
          <div className="section-header">
            <h2><i className="fas fa-dumbbell"></i> Komplex Edzésterv Felvétele</h2>
            <button className="btn btn-secondary" onClick={closeModal}><i className="fas fa-times"></i></button>
          </div>
          
          <form id="workoutForm" onSubmit={handleWorkoutSubmit}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Edzésnap (pl. Felsőtest Nap)</label>
                <input type="text" className="form-control" value={workoutFormDetails.name} onChange={(e) => setWorkoutFormDetails({...workoutFormDetails, name: e.target.value})} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Melyik nap?</label>
                <select className="form-control" value={workoutFormDetails.day} onChange={(e) => setWorkoutFormDetails({...workoutFormDetails, day: e.target.value})} required>
                  <option value="" disabled>Válasszon...</option>
                  <option value="monday">Hétfő</option>
                  <option value="tuesday">Kedd</option>
                  <option value="wednesday">Szerda</option>
                  <option value="thursday">Csütörtök</option>
                  <option value="friday">Péntek</option>
                  <option value="saturday">Szombat</option>
                  <option value="sunday">Vasárnap</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Edzés Típusa (Ez szűri az izomcsoportokat!)</label>
              <select className="form-control" value={workoutFormDetails.type} onChange={(e) => {
                setWorkoutFormDetails({...workoutFormDetails, type: e.target.value});
                // Reseteljük az eddigi gyakorlatokat, ha átállítja a típust
                setExercisesList([{ id: Date.now(), muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
              }} required>
                <option value="" disabled>Válasszon...</option>
                <option value="push">Push (Csak Nyomó izmok)</option>
                <option value="pull">Pull (Csak Húzó izmok)</option>
                <option value="legs">Legs (Láb)</option>
                <option value="full_body">Teljes Test (Minden izom)</option>
              </select>
            </div>
            
            <hr style={{ margin: '30px 0', border: '1px solid var(--primary)' }} />

            {/* VÉGTELEN GYAKORLAT HOZZÁADÁS CIKLUS */}
            {exercisesList.map((exercise, exIndex) => {
              // Megnézzük a kiválasztott típus alapján, mik az engedélyezett izmok
              const allowedMuscles = workoutFormDetails.type ? MUSCLE_FILTER[workoutFormDetails.type] : Object.keys(EXERCISE_DB);

              return (
                <div key={exercise.id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ color: 'var(--dark)' }}>{exIndex + 1}. Gyakorlat</h4>
                    {exercisesList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveExerciseBlock(exercise.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fas fa-times"></i> Gyakorlat törlése
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Izomcsoport</label>
                      <select className="form-control" value={exercise.muscleGroup} onChange={(e) => handleExerciseChange(exercise.id, 'muscleGroup', e.target.value)} required>
                        <option value="" disabled>Válasszon...</option>
                        {allowedMuscles.map(muscle => (
                          <option key={muscle} value={muscle}>{muscle}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Gyakorlat Listából</label>
                      <select className="form-control" value={exercise.name} onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)} required disabled={!exercise.muscleGroup}>
                        <option value="" disabled>Válasszon...</option>
                        {exercise.muscleGroup && EXERCISE_DB[exercise.muscleGroup].map(exName => (
                          <option key={exName} value={exName}>{exName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Szettek a gyakorlaton belül */}
                  <div style={{ padding: '15px', background: 'white', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    {exIndex === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--info)', marginBottom: '15px' }}>
                        <i className="fas fa-info-circle"></i> <strong>Mi az az RPE?</strong> 1-10 skála a nehézségről. 10 = bukás, 9 = 1 ismétlés maradt. (Opcionális)
                      </div>
                    )}

                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem' }}>{setIndex + 1}. Szett Súly (kg)</label>
                          <input type="number" className="form-control" value={set.weight} onChange={(e) => handleSetChange(exercise.id, setIndex, 'weight', e.target.value)} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem' }}>Ismétlés</label>
                          <input type="number" className="form-control" value={set.reps} onChange={(e) => handleSetChange(exercise.id, setIndex, 'reps', e.target.value)} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem' }}>RPE (1-10)</label>
                          <input type="number" className="form-control" min="1" max="10" value={set.rpe} onChange={(e) => handleSetChange(exercise.id, setIndex, 'rpe', e.target.value)} />
                        </div>
                        {exercise.sets.length > 1 && (
                          <button type="button" className="btn btn-secondary" style={{ padding: '12px 15px', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleRemoveSet(exercise.id, setIndex)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px', fontSize: '0.85rem' }} onClick={() => handleAddSet(exercise.id)}>
                      + Új szett ehhez a gyakorlathoz
                    </button>
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={handleAddExerciseBlock} style={{ width: '100%', padding: '15px', background: 'transparent', border: '2px dashed var(--primary)', color: 'var(--primary)', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
              <i className="fas fa-plus-circle"></i> Még egy gyakorlat hozzáadása az edzésnaphoz
            </button>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>
              <i className="fas fa-save"></i> Teljes Edzésterv Mentése
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;