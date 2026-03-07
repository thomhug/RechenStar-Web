/* ========================================
   RechenStar Web — Aufgaben-Generator
   Logik aus der iOS-App übernommen
   ======================================== */

const Categories = {
  addition_10:       { id: 'addition_10',       name: 'Plus bis 10',      group: 'Addition',       op: '+', icon: '+',  cssClass: 'addition' },
  addition_100:      { id: 'addition_100',      name: 'Plus bis 100',     group: 'Addition',       op: '+', icon: '+',  cssClass: 'addition' },
  subtraction_10:    { id: 'subtraction_10',    name: 'Minus bis 10',     group: 'Subtraktion',    op: '−', icon: '−',  cssClass: 'subtraction' },
  subtraction_100:   { id: 'subtraction_100',   name: 'Minus bis 100',    group: 'Subtraktion',    op: '−', icon: '−',  cssClass: 'subtraction' },
  multiplication_10: { id: 'multiplication_10', name: 'Kleines 1x1',      group: 'Multiplikation', op: '×', icon: '×',  cssClass: 'multiplication' },
  multiplication_100:{ id: 'multiplication_100',name: 'Grosses 1x1',      group: 'Multiplikation', op: '×', icon: '×',  cssClass: 'multiplication' },
};

// Formate: standard = "3 + 4 = ?", firstGap = "? + 4 = 7", secondGap = "3 + ? = 7"
const ExerciseFormat = {
  STANDARD: 'standard',
  FIRST_GAP: 'firstGap',
  SECOND_GAP: 'secondGap',
};

const GAP_FILL_CHANCE = 0.3;
const WEAK_EXERCISE_CHANCE = 0.3;
const MIN_MULT_FACTOR = 2;

const ExerciseGenerator = {
  /**
   * Generiert eine Aufgabe für die gegebene Kategorie
   * @param {string} categoryId
   * @param {number} difficulty 1-4
   * @returns {{ a: number, b: number, answer: number, op: string, format: string, category: string, key: string }}
   */
  generate(categoryId, difficulty = 2) {
    const cat = Categories[categoryId];
    if (!cat) throw new Error('Unbekannte Kategorie: ' + categoryId);

    let a, b, answer;

    switch (categoryId) {
      case 'addition_10':
        ({ a, b } = this._genAddition(10, difficulty));
        answer = a + b;
        break;
      case 'addition_100':
        ({ a, b } = this._genAddition(100, difficulty));
        answer = a + b;
        break;
      case 'subtraction_10':
        ({ a, b } = this._genSubtraction(10, difficulty));
        answer = a - b;
        break;
      case 'subtraction_100':
        ({ a, b } = this._genSubtraction(100, difficulty));
        answer = a - b;
        break;
      case 'multiplication_10':
        ({ a, b } = this._genMultiplication(10, difficulty));
        answer = a * b;
        break;
      case 'multiplication_100':
        ({ a, b } = this._genMultiplication(100, difficulty));
        answer = a * b;
        break;
    }

    // Format bestimmen
    let format = ExerciseFormat.STANDARD;
    const supportsGapFill = categoryId === 'addition_10' || categoryId === 'subtraction_10';
    if (supportsGapFill && Math.random() < GAP_FILL_CHANCE) {
      format = Math.random() < 0.5 ? ExerciseFormat.FIRST_GAP : ExerciseFormat.SECOND_GAP;
    }

    const key = `${a}${cat.op}${b}`;

    return { a, b, answer, op: cat.op, format, category: categoryId, key };
  },

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  _genAddition(maxSum, difficulty) {
    let rangeMax;
    if (maxSum === 10) {
      switch (difficulty) {
        case 1: rangeMax = 3; break;
        case 2: rangeMax = 5; break;
        case 3: rangeMax = 7; break;
        case 4: rangeMax = 9; break;
        default: rangeMax = 5;
      }
      const a = this._rand(1, rangeMax);
      const bMax = Math.min(rangeMax, maxSum - a);
      const b = this._rand(1, Math.max(1, bMax));
      return { a, b };
    } else {
      // bis 100
      switch (difficulty) {
        case 1: rangeMax = 20; break;
        case 2: rangeMax = 40; break;
        case 3: rangeMax = 70; break;
        case 4: rangeMax = 99; break;
        default: rangeMax = 40;
      }
      const a = this._rand(1, rangeMax);
      const bMax = Math.min(rangeMax, 100 - a);
      const b = this._rand(1, Math.max(1, bMax));
      return { a, b };
    }
  },

  _genSubtraction(maxVal, difficulty) {
    let rangeMax;
    if (maxVal === 10) {
      switch (difficulty) {
        case 1: rangeMax = 5; break;
        case 2: rangeMax = 7; break;
        case 3: rangeMax = 9; break;
        case 4: rangeMax = 10; break;
        default: rangeMax = 7;
      }
      const a = this._rand(2, rangeMax);
      const b = this._rand(1, a - 1 || 1);
      return { a, b };
    } else {
      switch (difficulty) {
        case 1: rangeMax = 20; break;
        case 2: rangeMax = 40; break;
        case 3: rangeMax = 70; break;
        case 4: rangeMax = 99; break;
        default: rangeMax = 40;
      }
      const a = this._rand(2, rangeMax);
      const b = this._rand(1, a - 1);
      return { a, b };
    }
  },

  _genMultiplication(maxFactor, difficulty) {
    let rangeMax;
    if (maxFactor === 10) {
      switch (difficulty) {
        case 1: rangeMax = 5; break;
        case 2: rangeMax = 7; break;
        case 3: rangeMax = 9; break;
        case 4: rangeMax = 10; break;
        default: rangeMax = 7;
      }
      const a = this._rand(MIN_MULT_FACTOR, rangeMax);
      const b = this._rand(MIN_MULT_FACTOR, rangeMax);
      return { a, b };
    } else {
      // Grosses 1x1
      let maxProduct;
      switch (difficulty) {
        case 1: rangeMax = 10; maxProduct = 50; break;
        case 2: rangeMax = 12; maxProduct = 100; break;
        case 3: rangeMax = 15; maxProduct = 200; break;
        case 4: rangeMax = 20; maxProduct = 400; break;
        default: rangeMax = 12; maxProduct = 100;
      }
      let a, b;
      let attempts = 0;
      do {
        a = this._rand(MIN_MULT_FACTOR, rangeMax);
        b = this._rand(MIN_MULT_FACTOR, rangeMax);
        attempts++;
      } while (a * b > maxProduct && attempts < 50);
      return { a, b };
    }
  },

  /**
   * Versucht eine schwache Aufgabe zu liefern
   */
  generateWeak(categoryId, difficulty) {
    const weakKeys = Storage.getWeakExercises();
    const cat = Categories[categoryId];
    const relevant = weakKeys.filter(k => k.includes(cat.op));

    if (relevant.length > 0 && Math.random() < WEAK_EXERCISE_CHANCE) {
      const key = relevant[Math.floor(Math.random() * relevant.length)];
      const parts = key.split(cat.op);
      if (parts.length === 2) {
        const a = parseInt(parts[0]);
        const b = parseInt(parts[1]);
        if (!isNaN(a) && !isNaN(b)) {
          let answer;
          if (cat.op === '+') answer = a + b;
          else if (cat.op === '−') answer = a - b;
          else answer = a * b;
          return { a, b, answer, op: cat.op, format: ExerciseFormat.STANDARD, category: categoryId, key, isRevenge: true };
        }
      }
    }
    return null;
  },
};

/* Levels-System */
const Levels = [
  { name: 'Anfänger',     threshold: 0 },
  { name: 'Rechenkind',   threshold: 25 },
  { name: 'Zahlenfuchs',  threshold: 75 },
  { name: 'Rechenprofi',  threshold: 150 },
  { name: 'Mathe-Held',   threshold: 300 },
  { name: 'Zahlenkönig',  threshold: 500 },
  { name: 'RechenStar',   threshold: 1000 },
  { name: 'RechenStar 2', threshold: 1500 },
  { name: 'RechenStar 3', threshold: 2000 },
  { name: 'RechenStar 4', threshold: 3000 },
  { name: 'RechenStar 5', threshold: 5000 },
];

function getLevel(totalCorrect) {
  let level = Levels[0];
  for (const l of Levels) {
    if (totalCorrect >= l.threshold) level = l;
    else break;
  }
  return level;
}

function getNextLevel(totalCorrect) {
  for (const l of Levels) {
    if (totalCorrect < l.threshold) return l;
  }
  return null;
}
