import React from 'react';
import WeekCalendar from './WeekCalendar';

const WorkoutPlanSection = ({
  currentSection,
  workoutData,
  completedRecommendedWorkoutMap,
  serializeWorkoutTypeValue,
  normalizeSearchText,
  stripRecommendedWorkoutSuffix,
  formatWorkoutTypeLabel,
  undoRecommendedWorkoutForToday,
  saveRecommendedWorkoutForToday,
  savingRecommendedWorkoutKey,
  selectedDate,
  setSelectedDate,
  loadWeekWorkouts,
  loadingWorkouts,
  getWorkoutsForDay,
  handleWorkoutClick,
  showWorkoutModal
}) => (
  <div className={`content-section ${currentSection === 'workout-plan' ? 'active' : ''}`}>
    <div className="card">
      <div className="workout-recommendations-panel">
        <div className="nutrition-top-row workout-recommendation-row">
          <h3>Ajánlott mintaedzésterv</h3>
        </div>
        {workoutData.recommendationNote && (
          <p className="workout-recommendation-note">{workoutData.recommendationNote}</p>
        )}
        <div className="week-workouts workout-recommendation-grid">
          {(workoutData.recommendedPlan || []).map((workout, index) => {
            const workoutKey = `${serializeWorkoutTypeValue(workout.workoutType)}::${normalizeSearchText(stripRecommendedWorkoutSuffix(workout.title))}`;
            const completedWorkout = completedRecommendedWorkoutMap[workoutKey];

            return (
              <div
                key={`${workout.day}-${index}`}
                className={`day-workout-card ${completedWorkout ? 'completed-recommended-workout' : ''}`}
              >
                <div className="day-workout-header">
                  <h3>{workout.dayLabel}</h3>
                  <span className={`workout-count ${completedWorkout ? 'completed' : ''}`}>
                    {completedWorkout ? 'Teljesítve' : 'Minta'}
                  </span>
                </div>
                <div className="workout-item">
                  <div className="workout-name">{workout.title}</div>
                  <div className="workout-type">{formatWorkoutTypeLabel(workout.workoutType)}</div>
                  <div className="workout-preview">
                    {(workout.exercises || []).map((exercise, exerciseIndex) => (
                      <span key={exerciseIndex} className="exercise-preview-tag">
                        {typeof exercise === 'string' ? exercise : exercise.name}
                        {typeof exercise !== 'string' && exercise.prescription && (
                          <strong>{exercise.prescription}</strong>
                        )}
                      </span>
                    ))}
                  </div>
                  {completedWorkout ? (
                    <div className="recommended-workout-complete-state-wrap">
                      <div className="recommended-workout-complete-state">
                        <i className="fas fa-circle-check"></i> Teljesítve
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm recommended-workout-undo"
                        onClick={() => undoRecommendedWorkoutForToday(completedWorkout.id)}
                      >
                        Visszavonás
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary recommended-workout-action"
                      onClick={() => saveRecommendedWorkoutForToday(workout)}
                      disabled={savingRecommendedWorkoutKey === `${workout.day}-${workout.title}`}
                    >
                      <i className="fas fa-check-double"></i>
                      {savingRecommendedWorkoutKey === `${workout.day}-${workout.title}` ? ' Mentés...' : ' Teljesítem ma'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(workoutData.recommendedPlan || []).length === 0 && (
            <p className="no-data">Nincs elérhető edzésterv minta ehhez a profilhoz.</p>
          )}
        </div>
      </div>
      <WeekCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} onWeekChange={loadWeekWorkouts} />
      {loadingWorkouts ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Betöltés...</div>
      ) : (
        <div className="week-workouts">
          {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'].map((dayName, idx) => {
            const dayWorkouts = getWorkoutsForDay(idx);
            return (
              <div key={idx} className="day-workout-card">
                <div className="day-workout-header">
                  <h3>{dayName}</h3>
                  <span className="workout-count">{dayWorkouts.length}</span>
                </div>
                {dayWorkouts.map((workout, workoutIndex) => (
                  <div
                    key={workoutIndex}
                    className="workout-item clickable"
                    onClick={() => handleWorkoutClick(workout)}
                  >
                    <div className="workout-name">{workout.name}</div>
                    <div className="workout-type">{formatWorkoutTypeLabel(workout.workout_type)}</div>
                    <div className="workout-preview">
                      {workout.exercises?.slice(0, 2).map((exercise, exerciseIndex) => (
                        <span key={exerciseIndex} className="exercise-preview-tag">{exercise.name}</span>
                      ))}
                      {workout.exercises?.length > 2 && (
                        <span className="exercise-preview-tag more">+{workout.exercises.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
                {dayWorkouts.length === 0 && <div className="no-workout">Nincs edzés</div>}
              </div>
            );
          })}
        </div>
      )}
      <button className="btn btn-primary" onClick={showWorkoutModal}><i className="fas fa-plus"></i> Új Edzés</button>
    </div>
  </div>
);

export default WorkoutPlanSection;