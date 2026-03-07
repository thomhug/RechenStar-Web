/* ========================================
   RechenStar Web — App Controller
   ======================================== */

const SESSION_LENGTH = 10;
const MAX_ATTEMPTS = 2;
const MAX_INPUT_DIGITS = 3;

// Adaptive Difficulty
const FAST_TIME = 3;
const SLOW_TIME = 7;
const ADAPTATION_INTERVAL = 2;
const FRUSTRATION_WINDOW = 4;
const FRUSTRATION_THRESHOLD = 0.4;

const App = {
  selectedCategories: new Set(['addition_10']),
  difficulty: 2,

  // Session-State
  session: null,

  init() {
    this.showHome();
    // Keyboard-Support
    document.addEventListener('keydown', (e) => this._handleKeyboard(e));
  },

  showHome() {
    const data = Storage.load();
    UI.renderHome(
      data,
      this.selectedCategories,
      (catId) => this._toggleCategory(catId),
      () => this._startSession()
    );
  },

  _toggleCategory(catId) {
    if (this.selectedCategories.has(catId)) {
      this.selectedCategories.delete(catId);
    } else {
      this.selectedCategories.add(catId);
    }
    this.showHome();
  },

  _startSession() {
    if (this.selectedCategories.size === 0) return;

    const catArray = Array.from(this.selectedCategories);

    this.session = {
      exercises: [],
      results: [],
      currentIndex: 0,
      starsEarned: 0,
      correctCount: 0,
      totalCount: SESSION_LENGTH,
      userAnswer: '',
      attempts: 0,
      startTime: Date.now(),
      exerciseStartTime: Date.now(),
      category: catArray.join(','),
      recentResults: [], // für adaptive Schwierigkeit
    };

    // Aufgaben vorab generieren
    for (let i = 0; i < SESSION_LENGTH; i++) {
      const catId = catArray[Math.floor(Math.random() * catArray.length)];
      // Schwache Aufgabe versuchen
      let exercise = ExerciseGenerator.generateWeak(catId, this.difficulty);
      if (!exercise) {
        exercise = ExerciseGenerator.generate(catId, this.difficulty);
      }
      this.session.exercises.push(exercise);
    }

    this._showCurrentExercise();
  },

  _showCurrentExercise() {
    const s = this.session;
    s.userAnswer = '';
    s.attempts = 0;
    s.exerciseStartTime = Date.now();

    UI.renderExercise({
      exercise: s.exercises[s.currentIndex],
      currentIndex: s.currentIndex,
      totalExercises: s.totalCount,
      sessionStars: s.starsEarned,
      userAnswer: '',
    });

    this._bindExerciseEvents();
  },

  _bindExerciseEvents() {
    // Numpad
    document.querySelectorAll('.numpad-btn[data-num]').forEach(btn => {
      btn.addEventListener('click', () => {
        Sounds.tap();
        this._appendDigit(btn.dataset.num);
      });
    });

    // Delete
    const delBtn = document.getElementById('btn-delete');
    if (delBtn) delBtn.addEventListener('click', () => this._deleteDigit());

    // Submit
    const subBtn = document.getElementById('btn-submit');
    if (subBtn) subBtn.addEventListener('click', () => this._submitAnswer());

    // Skip
    const skipBtn = document.getElementById('btn-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => this._skipExercise());

    // Close
    const closeBtn = document.getElementById('btn-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.showHome());
  },

  _appendDigit(digit) {
    const s = this.session;
    if (s.userAnswer.length >= MAX_INPUT_DIGITS) return;
    s.userAnswer += digit;
    UI.updateAnswer(s.userAnswer, s.exercises[s.currentIndex]);
  },

  _deleteDigit() {
    const s = this.session;
    s.userAnswer = s.userAnswer.slice(0, -1);
    UI.updateAnswer(s.userAnswer, s.exercises[s.currentIndex]);
  },

  _submitAnswer() {
    const s = this.session;
    if (!s.userAnswer) return;

    const exercise = s.exercises[s.currentIndex];
    const userNum = parseInt(s.userAnswer, 10);

    // Richtige Antwort bestimmen je nach Format
    let correctAnswer;
    if (exercise.format === ExerciseFormat.FIRST_GAP) {
      correctAnswer = exercise.a;
    } else if (exercise.format === ExerciseFormat.SECOND_GAP) {
      correctAnswer = exercise.b;
    } else {
      correctAnswer = exercise.answer;
    }

    const isCorrect = userNum === correctAnswer;
    s.attempts += 1;

    if (isCorrect) {
      const stars = s.attempts === 1 ? 2 : 1;
      s.starsEarned += stars;
      s.correctCount += 1;

      const timeSpent = Math.min(10, (Date.now() - s.exerciseStartTime) / 1000);

      s.results.push({
        exercise,
        isCorrect: true,
        attempts: s.attempts,
        timeSpent,
        stars,
      });

      // Adaptive Schwierigkeit tracken
      s.recentResults.push({ correct: true, time: timeSpent });
      this._checkAdaptiveDifficulty();

      // Weak-Exercise-Tracking
      Storage.trackWeakExercise(exercise.key, true);

      UI.setAnswerState('correct');
      Sounds.correct();
      UI.showFeedback(exercise.isRevenge ? 'revenge' : 'correct', { stars });

      UI.setNumpadEnabled(false);
      setTimeout(() => this._nextExercise(), 1000);

    } else {
      // Falsch
      Storage.trackWeakExercise(exercise.key, false);
      UI.setAnswerState('incorrect');
      UI.shakeCard();
      Sounds.incorrect();

      if (s.attempts >= MAX_ATTEMPTS) {
        // Antwort zeigen
        s.results.push({
          exercise,
          isCorrect: false,
          attempts: s.attempts,
          timeSpent: Math.min(10, (Date.now() - s.exerciseStartTime) / 1000),
          stars: 0,
        });

        s.recentResults.push({ correct: false, time: 0 });
        this._checkAdaptiveDifficulty();

        UI.showFeedback('showAnswer', { answer: correctAnswer });
        UI.setNumpadEnabled(false);
        setTimeout(() => this._nextExercise(), 2500);
      } else {
        UI.showFeedback('incorrect');
        setTimeout(() => {
          UI.hideFeedback();
          UI.setAnswerState(null);
          s.userAnswer = '';
          UI.updateAnswer('', exercise);
        }, 1000);
      }
    }
  },

  _skipExercise() {
    const s = this.session;
    const exercise = s.exercises[s.currentIndex];
    s.results.push({
      exercise,
      isCorrect: false,
      attempts: 0,
      timeSpent: Math.min(10, (Date.now() - s.exerciseStartTime) / 1000),
      stars: 0,
      skipped: true,
    });
    s.recentResults.push({ correct: false, time: 0 });

    // Richtige Antwort bestimmen
    let correctAnswer;
    if (exercise.format === ExerciseFormat.FIRST_GAP) {
      correctAnswer = exercise.a;
    } else if (exercise.format === ExerciseFormat.SECOND_GAP) {
      correctAnswer = exercise.b;
    } else {
      correctAnswer = exercise.answer;
    }

    UI.showFeedback('showAnswer', { answer: correctAnswer });
    UI.setNumpadEnabled(false);
    setTimeout(() => this._nextExercise(), 2000);
  },

  _nextExercise() {
    const s = this.session;
    s.currentIndex += 1;

    if (s.currentIndex >= s.totalCount) {
      this._endSession();
    } else {
      this._showCurrentExercise();
    }
  },

  _endSession() {
    const s = this.session;
    const duration = Math.round((Date.now() - s.startTime) / 1000);

    const sessionResult = {
      starsEarned: s.starsEarned,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
      category: s.category,
      duration,
    };

    const updatedData = Storage.addSessionResult(sessionResult);

    UI.renderResults(
      { ...sessionResult, duration },
      updatedData,
      () => this.showHome()
    );
  },

  _checkAdaptiveDifficulty() {
    const results = this.session.recentResults;
    if (results.length % ADAPTATION_INTERVAL !== 0) return;

    // Frustrations-Check (letzte 4)
    const window = results.slice(-FRUSTRATION_WINDOW);
    const windowAccuracy = window.filter(r => r.correct).length / window.length;
    if (windowAccuracy < FRUSTRATION_THRESHOLD && this.difficulty > 1) {
      this.difficulty -= 1;
      this._regenerateUpcoming();
      return;
    }

    // Letzte 2 prüfen
    const recent = results.slice(-ADAPTATION_INTERVAL);
    const allCorrect = recent.every(r => r.correct);
    const avgTime = recent.reduce((sum, r) => sum + r.time, 0) / recent.length;

    if (allCorrect && avgTime < FAST_TIME && this.difficulty < 4) {
      this.difficulty += 1;
      this._regenerateUpcoming();
    } else if (avgTime > SLOW_TIME && this.difficulty > 1) {
      this.difficulty -= 1;
      this._regenerateUpcoming();
    }
  },

  /** Noch nicht gespielte Aufgaben neu generieren bei Schwierigkeitsänderung */
  _regenerateUpcoming() {
    const s = this.session;
    const catArray = Array.from(this.selectedCategories);
    for (let i = s.currentIndex + 1; i < s.exercises.length; i++) {
      const catId = catArray[Math.floor(Math.random() * catArray.length)];
      s.exercises[i] = ExerciseGenerator.generate(catId, this.difficulty);
    }
  },

  _handleKeyboard(e) {
    // Nur im Exercise-Screen
    if (!this.session || !document.getElementById('screen-exercise')) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      Sounds.tap();
      this._appendDigit(e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this._deleteDigit();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this._submitAnswer();
    }
  },
};

// App starten
document.addEventListener('DOMContentLoaded', () => App.init());
