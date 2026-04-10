import React from 'react';

const WorkoutModeSection = ({ currentSection, stopWorkout, formatTime, workoutTime, toggleWorkout, workoutActive, setWorkoutTime }) => (
  <div className={`content-section ${currentSection === 'workout-mode' ? 'active' : ''}`}>
    <div className="workout-mode">
      <div className="section-header section-header-actions-only">
        <button className="btn btn-secondary" onClick={stopWorkout}><i className="fas fa-stop"></i> Befejezés</button>
      </div>
      <div className="workout-timer">{formatTime(workoutTime)}</div>
      <div className="workout-controls">
        <button className="control-btn" onClick={toggleWorkout}>
          <i className={`fas ${workoutActive ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button className="control-btn" onClick={() => setWorkoutTime(0)}>
          <i className="fas fa-redo-alt"></i>
        </button>
      </div>
    </div>
  </div>
);

export default WorkoutModeSection;