import React from 'react';

const QuestionnaireHeader = ({ currentSection, totalSections }) => (
  <div className="header">
    <h1>Személyre Szabott Edzésterv</h1>
    <p>Kérjük, töltse ki a kérdőívet, hogy az Ön igényeihez tudjuk igazítani az edzéstervet</p>

    <div className="progress-bar">
      <div className="progress-fill" id="progressFill"></div>
    </div>
    <div className="progress-text">
      <span id="currentQuestion">{currentSection}</span> / <span id="totalQuestions">{totalSections}</span> rész
    </div>
  </div>
);

export default QuestionnaireHeader;