import React from 'react';

const ExercisesSection = ({
  currentSection,
  exerciseSearchQuery,
  setExerciseSearchQuery,
  filteredExerciseCategories
}) => (
  <div className="card">
    {currentSection === 'exercises' && (
      <>
        <div className="exercise-search-row">
          <label className="exercise-search-label" htmlFor="exercise-search">Gyakorlat keresése</label>
          <input
            id="exercise-search"
            type="text"
            className="form-control exercise-search-input"
            placeholder="Például: láb, guggolás, mell..."
            value={exerciseSearchQuery}
            onChange={(event) => setExerciseSearchQuery(event.target.value)}
          />
        </div>
        <div className="exercise-categories">
          {filteredExerciseCategories.map(({ categoryName, exercises }) => (
            <div key={categoryName} className="exercise-category">
              <h3 onClick={() => {
                const content = document.getElementById(`category-${categoryName}`);
                if (content) content.style.display = content.style.display === 'none' ? 'grid' : 'none';
              }}>
                <i className="fas fa-chevron-down"></i> {categoryName} ({exercises.length})
              </h3>
              <div id={`category-${categoryName}`} className="exercise-category-content" style={{ display: 'grid' }}>
                {exercises.map((ex, i) => (
                  <div key={i} className="exercise-video-card">
                    <div className="exercise-video-info">
                      <h4>{ex.name}</h4>
                      <span className={`difficulty ${ex.difficulty}`}>
                        {ex.difficulty === 'beginner' ? 'Kezdő' : ex.difficulty === 'intermediate' ? 'Haladó' : 'Profi'}
                      </span>
                    </div>
                    <div className="video-container">
                      <iframe src={ex.video} title={ex.name} frameBorder="0" allowFullScreen loading="lazy"></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredExerciseCategories.length === 0 && (
            <div className="exercise-empty-state">Nincs találat erre a keresésre.</div>
          )}
        </div>
      </>
    )}
  </div>
);

export default ExercisesSection;