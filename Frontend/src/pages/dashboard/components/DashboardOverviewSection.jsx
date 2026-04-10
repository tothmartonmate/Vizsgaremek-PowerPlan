import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

const DashboardOverviewSection = ({
  currentSection,
  greetingName,
  workoutData,
  totalCaloriesToday,
  calorieGoal,
  calorieProgress,
  userData,
  weightChartData,
  weightChartOptions,
  workoutChartData,
  workoutChartOptions
}) => (
  <div className={`content-section ${currentSection === 'dashboard' ? 'active' : ''}`}>
    <div className="card">
      <h2>Üdvözöljük, <span>{greetingName}</span>!</h2>
      <div className="ai-box">
        <h3><i className="fas fa-robot"></i> Ajánlás:</h3>
        <p>{workoutData.aiRecommendation || 'Töltsd ki a kérdőívet a személyre szabott tippekért!'}</p>
      </div>
    </div>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-dumbbell"></i></div>
        <div className="stat-info">
          <h3>EDZÉSEK</h3>
          <div className="stat-number">{workoutData.stats?.totalWorkouts || 0}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-fire"></i></div>
        <div className="stat-info">
          <h3>KALÓRIA</h3>
          <div className="stat-number">{totalCaloriesToday}/{calorieGoal} kcal</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(calorieProgress, 100)}%` }}></div>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-weight"></i></div>
        <div className="stat-info">
          <h3>TESTSÚLY</h3>
          <div className="stat-number">{userData.personalInfo?.weight || '-'} kg</div>
        </div>
      </div>
    </div>
    <div className="charts-grid">
      <div className="chart-container"><h3>Súlyfejlődés</h3><Line data={weightChartData} options={weightChartOptions} /></div>
      <div className="chart-container"><h3>Edzési gyakoriság</h3><Bar data={workoutChartData} options={workoutChartOptions} /></div>
    </div>
  </div>
);

export default DashboardOverviewSection;