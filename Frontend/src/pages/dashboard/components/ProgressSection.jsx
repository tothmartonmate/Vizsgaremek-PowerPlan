import React from 'react';
import { Line } from 'react-chartjs-2';

const ProgressSection = ({ currentSection, weightChartData, weightChartOptions }) => (
  <div className={`content-section ${currentSection === 'progress' ? 'active' : ''}`}>
    <div className="card">
      <h2><i className="fas fa-chart-line"></i> Haladás</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Testsúly alakulása</h3>
          <Line data={weightChartData} options={weightChartOptions} />
        </div>
      </div>
    </div>
  </div>
);

export default ProgressSection;