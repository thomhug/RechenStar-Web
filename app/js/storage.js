/* ========================================
   RechenStar Web — Storage (localStorage)
   ======================================== */

const Storage = {
  _key: 'rechenstar',

  _defaults: {
    username: 'Noah',
    totalStars: 0,
    totalCorrect: 0,
    totalExercises: 0,
    streak: 1,
    longestStreak: 1,
    lastPlayedDate: null,
    sessions: [],
    // Schwache Aufgaben: { "3+4": { wrong: 2, right: 1 }, ... }
    weakExercises: {},
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) {
        return { ...this._defaults, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }
    return { ...this._defaults };
  },

  save(data) {
    try {
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  addSessionResult(session) {
    const data = this.load();
    data.totalStars += session.starsEarned;
    data.totalCorrect += session.correctCount;
    data.totalExercises += session.totalCount;

    // Streak-Logik
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastPlayedDate === today) {
      // Heute schon gespielt — kein Streak-Update
    } else if (data.lastPlayedDate === yesterday) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }
    data.lastPlayedDate = today;
    if (data.streak > data.longestStreak) {
      data.longestStreak = data.streak;
    }

    // Session speichern (letzte 50)
    data.sessions.push({
      date: new Date().toISOString(),
      starsEarned: session.starsEarned,
      correctCount: session.correctCount,
      totalCount: session.totalCount,
      category: session.category,
      duration: session.duration,
    });
    if (data.sessions.length > 50) {
      data.sessions = data.sessions.slice(-50);
    }

    this.save(data);
    return data;
  },

  trackWeakExercise(key, isCorrect) {
    const data = this.load();
    if (!data.weakExercises[key]) {
      data.weakExercises[key] = { wrong: 0, right: 0 };
    }
    if (isCorrect) {
      data.weakExercises[key].right += 1;
    } else {
      data.weakExercises[key].wrong += 1;
    }
    this.save(data);
  },

  getWeakExercises() {
    const data = this.load();
    const weak = [];
    for (const [key, val] of Object.entries(data.weakExercises)) {
      if (val.wrong > val.right) {
        weak.push(key);
      }
    }
    return weak;
  },
};
