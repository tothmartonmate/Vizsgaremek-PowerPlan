import React from 'react';

const BadgesSection = ({ personalRecords, workoutStreak, achievements, badges }) => (
  <div className="card">
    <div className="records-section">
      <h3>🏆 Személyes Rekordok</h3>
      <div className="records-grid">
        <div className="record-card"><i className="fas fa-dumbbell"></i><span>Fekvenyomás</span><strong>{personalRecords.benchPress || '-'} kg</strong></div>
        <div className="record-card"><i className="fas fa-dumbbell"></i><span>Guggolás</span><strong>{personalRecords.squat || '-'} kg</strong></div>
        <div className="record-card"><i className="fas fa-dumbbell"></i><span>Felhúzás</span><strong>{personalRecords.deadlift || '-'} kg</strong></div>
        <div className="record-card"><i className="fas fa-calendar-week"></i><span>Edzésstreak</span><strong>{workoutStreak} nap</strong></div>
      </div>
    </div>

    {achievements.length > 0 && (
      <div className="achievements-section">
        <h3>✨ Teljesítmények</h3>
        {achievements.map((ach, i) => (
          <div key={i} className="achievement-item"><i className="fas fa-star"></i> {ach}</div>
        ))}
      </div>
    )}

    <div className="badges-section">
      <h3>🎖️ Kiváltott Jelvények</h3>
      {badges.length > 0 ? (
        <div className="badges-grid">
          {badges.map((badge, i) => (
            <div key={i} className="badge-card" style={{ borderColor: badge.color }}>
              {badge.emoji ? (
                <span style={{ color: badge.color }}>{badge.emoji}</span>
              ) : (
                <i className={`fas ${badge.icon}`} style={{ color: badge.color }}></i>
              )}
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-badges">Még nincs jelvényed. Eddz többet!</p>
      )}
    </div>

    <div className="available-badges">
      <h3>🔓 Elérhető jelvények</h3>
      <div className="badges-grid">
        <div className="badge-card locked"><i className="fas fa-fire"></i><h4>Edzésőrült</h4><p>Heti 5+ edzés</p></div>
        <div className="badge-card locked"><span>💪</span><h4>Kitartó</h4><p>Heti 3+ edzés</p></div>
        <div className="badge-card locked"><i className="fas fa-chart-line"></i><h4>Rekorddöntő</h4><p>Új rekord</p></div>
      </div>
    </div>
  </div>
);

export default BadgesSection;