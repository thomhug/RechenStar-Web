/* ========================================
   RechenStar Web — UI Rendering
   ======================================== */

const UI = {
  /** Rendert den Home-Screen */
  renderHome(data, selectedCategories, onCategoryToggle, onStart) {
    const groups = {};
    for (const cat of Object.values(Categories)) {
      if (!groups[cat.group]) groups[cat.group] = [];
      groups[cat.group].push(cat);
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-home">
        <div class="home-header">
          <div class="home-title">RechenStar</div>
          <div class="home-greeting">Hallo, ${data.username}!</div>
          <div class="home-stars">
            <span class="star-icon">&#11088;</span>
            <span>${data.totalStars}</span>
          </div>
          ${data.streak > 1 ? `
            <div class="home-streak">
              &#128293; ${data.streak} Tage am Stück
            </div>
          ` : ''}
        </div>

        <div class="category-grid" id="category-grid">
          ${Object.entries(groups).map(([groupName, cats]) => `
            <div class="category-group-label">${groupName}</div>
            ${cats.map(cat => `
              <div class="category-card ${selectedCategories.has(cat.id) ? 'selected' : ''}"
                   data-category="${cat.id}">
                <div class="category-icon ${cat.cssClass}">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
              </div>
            `).join('')}
          `).join('')}
        </div>

        <div class="start-section">
          <button class="btn-start" id="btn-start" ${selectedCategories.size === 0 ? 'disabled' : ''}>
            Spielen
          </button>
        </div>
      </div>
    `;

    // Events
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.dataset.category;
        onCategoryToggle(catId);
      });
    });

    document.getElementById('btn-start').addEventListener('click', onStart);
  },

  /** Rendert den Exercise-Screen */
  renderExercise(state) {
    const app = document.getElementById('app');
    const { exercise, currentIndex, totalExercises, sessionStars, userAnswer } = state;
    const cat = Categories[exercise.category];
    const progress = ((currentIndex) / totalExercises) * 100;

    // Aufgabe aufbauen je nach Format
    let displayHTML;
    if (exercise.format === ExerciseFormat.FIRST_GAP) {
      displayHTML = `
        <span class="exercise-gap">${userAnswer || '?'}</span>
        <span class="exercise-operator">${exercise.op}</span>
        <span class="exercise-number">${exercise.b}</span>
        <span class="exercise-equals">=</span>
        <span class="exercise-number">${exercise.answer}</span>
      `;
    } else if (exercise.format === ExerciseFormat.SECOND_GAP) {
      displayHTML = `
        <span class="exercise-number">${exercise.a}</span>
        <span class="exercise-operator">${exercise.op}</span>
        <span class="exercise-gap">${userAnswer || '?'}</span>
        <span class="exercise-equals">=</span>
        <span class="exercise-number">${exercise.answer}</span>
      `;
    } else {
      displayHTML = `
        <span class="exercise-number">${exercise.a}</span>
        <span class="exercise-operator">${exercise.op}</span>
        <span class="exercise-number">${exercise.b}</span>
        <span class="exercise-equals">=</span>
      `;
    }

    app.innerHTML = `
      <div class="screen active" id="screen-exercise">
        <div class="exercise-header">
          <span class="exercise-progress-text">${currentIndex + 1} von ${totalExercises}</span>
          <span class="exercise-stars">&#11088; ${sessionStars}</span>
          <button class="btn-close" id="btn-close">&#10005;</button>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>

        <div class="exercise-card" id="exercise-card">
          <div class="exercise-display">
            ${displayHTML}
          </div>
          <div class="answer-display" ${exercise.format !== ExerciseFormat.STANDARD ? 'style="visibility:hidden"' : ''}>
            <div class="answer-value ${userAnswer ? '' : 'empty'}" id="answer-value">${userAnswer || ''}</div>
          </div>
        </div>

        <div class="feedback-area">
          <div class="feedback-text" id="feedback-text"></div>
        </div>

        <div class="numpad" id="numpad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `
            <button class="numpad-btn" data-num="${n}">${n}</button>
          `).join('')}
          <button class="numpad-btn delete" id="btn-delete">&#9003;</button>
          <button class="numpad-btn" data-num="0">0</button>
          <button class="numpad-btn submit" id="btn-submit">&#10003;</button>
        </div>

        <div class="skip-section">
          <button class="btn-skip" id="btn-skip">Überspringen &#8594;</button>
        </div>
      </div>
    `;
  },

  /** Aktualisiert nur die Antwort-Anzeige (ohne Re-Render) */
  updateAnswer(answer, exercise) {
    if (exercise.format === ExerciseFormat.STANDARD) {
      const el = document.getElementById('answer-value');
      if (el) {
        el.textContent = answer || '';
        el.classList.toggle('empty', !answer);
      }
    } else {
      // Gap-Anzeige
      const gaps = document.querySelectorAll('.exercise-gap');
      gaps.forEach(g => { g.textContent = answer || '?'; });
    }
  },

  /** Zeigt Feedback */
  showFeedback(type, data = {}) {
    const el = document.getElementById('feedback-text');
    if (!el) return;

    el.className = 'feedback-text visible';

    switch (type) {
      case 'correct':
        const starCount = data.stars || 2;
        el.className = 'feedback-text visible correct';
        el.innerHTML = `<span class="feedback-stars">${'&#11088;'.repeat(starCount).split('').map((s, i) =>
          i % 7 === 0 ? `<span>${s}` : (i % 7 === 6 ? `${s}</span>` : s)
        ).join('')}</span>`;
        // Einfachere Sterne
        el.innerHTML = '<span class="feedback-stars">' +
          Array.from({length: starCount}, () => '<span>&#11088;</span>').join('') +
          '</span>';
        break;
      case 'revenge':
        el.className = 'feedback-text visible correct';
        el.innerHTML = '<span class="feedback-stars"><span>&#11088;</span></span> Stark!';
        break;
      case 'incorrect':
        el.className = 'feedback-text visible incorrect';
        el.textContent = 'Versuch es nochmal!';
        break;
      case 'showAnswer':
        el.className = 'feedback-text visible answer';
        el.textContent = `Die Antwort ist ${data.answer}`;
        break;
      case 'wrongOperation':
        el.className = 'feedback-text visible hint';
        el.textContent = `Achtung, ${data.correctOp} nicht ${data.wrongOp}!`;
        break;
    }
  },

  hideFeedback() {
    const el = document.getElementById('feedback-text');
    if (el) {
      el.className = 'feedback-text';
      el.innerHTML = '';
    }
  },

  /** Shake-Animation auf der Karte */
  shakeCard() {
    const card = document.getElementById('exercise-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
    }
  },

  /** Antwort-Farbe setzen */
  setAnswerState(state) {
    const el = document.getElementById('answer-value');
    if (!el) return;
    el.classList.remove('correct', 'incorrect');
    if (state) el.classList.add(state);
  },

  /** Numpad deaktivieren */
  setNumpadEnabled(enabled) {
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.disabled = !enabled;
    });
  },

  /** Rendert den Results-Screen */
  renderResults(session, data, onHome) {
    const app = document.getElementById('app');
    const accuracy = session.totalCount > 0
      ? Math.round((session.correctCount / session.totalCount) * 100)
      : 0;
    const maxStars = session.totalCount * 2;
    const displayStars = Math.min(5, Math.ceil((session.starsEarned / maxStars) * 5));

    const level = getLevel(data.totalCorrect);
    const nextLevel = getNextLevel(data.totalCorrect);

    let levelProgressPercent = 100;
    let nextLevelText = '';
    if (nextLevel) {
      const prevThreshold = level.threshold;
      const range = nextLevel.threshold - prevThreshold;
      const progress = data.totalCorrect - prevThreshold;
      levelProgressPercent = Math.min(100, Math.round((progress / range) * 100));
      nextLevelText = `Noch ${nextLevel.threshold - data.totalCorrect} bis ${nextLevel.name}`;
    }

    const minutes = Math.floor(session.duration / 60);
    const seconds = session.duration % 60;
    const durationText = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;

    app.innerHTML = `
      <div class="screen active results-screen" id="screen-results">
        <div class="results-title">Geschafft!</div>

        <div class="results-stars-display">
          ${Array.from({length: displayStars}, () => '<span>&#11088;</span>').join('')}
        </div>
        <div class="results-star-text">${session.starsEarned} von ${maxStars} Sternen</div>

        <div class="results-stats">
          <div class="stat-card">
            <div class="stat-icon">&#10003;</div>
            <div class="stat-value">${session.correctCount}/${session.totalCount}</div>
            <div class="stat-label">Richtig</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">&#9201;</div>
            <div class="stat-value">${durationText}</div>
            <div class="stat-label">Zeit</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">&#127919;</div>
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">Genauigkeit</div>
          </div>
        </div>

        <div class="results-level">
          <div class="results-level-title">Dein Level</div>
          <div class="results-level-name">${level.name}</div>
          <div class="results-level-progress">
            <div class="results-level-progress-fill" style="width: ${levelProgressPercent}%"></div>
          </div>
          ${nextLevelText ? `<div class="results-level-next">${nextLevelText}</div>` : ''}
        </div>

        ${data.streak > 1 ? `
          <div class="results-streak">&#128293; ${data.streak} Tage am Stück</div>
        ` : ''}

        <button class="btn-home" id="btn-home">Weiter</button>
      </div>
    `;

    // Confetti bei >= 60% Genauigkeit
    if (accuracy >= 60) {
      this.showConfetti();
      Sounds.sessionComplete();
    }

    document.getElementById('btn-home').addEventListener('click', onHome);
  },

  /** Confetti-Animation */
  showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#4A90E2', '#F5D547', '#7ED321', '#FF6B6B', '#9B59B6', '#FFA500'];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  },
};
