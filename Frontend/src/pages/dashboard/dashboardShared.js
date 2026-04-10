const MIN_REALISTIC_WEIGHT_KG = 30;
const MAX_REALISTIC_WEIGHT_KG = 200;
const WEIGHT_CHART_PADDING_KG = 20;
const WEIGHT_CHART_STEP_KG = 5;
const PROFILE_IMAGE_EDITOR_SIZE = 320;
const RPE_TOOLTIP_TEXT = 'Az RPE az erőkifejtés szubjektív skálája 1 és 10 között. Az 1 nagyon könnyű, a 7-8 már nehéz, de még marad 2-3 ismétlés a tartalékban, a 9 majdnem bukás, a 10 pedig teljes kifáradás, amikor már nem tudnál még egy szabályos ismétlést végrehajtani.';
const WORKOUT_DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const formatLocalDate = (dateInput) => {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (dateInput) => {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const start = new Date(safeDate);
  const dayOfWeek = start.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const isSameDay = (firstDate, secondDate) => formatLocalDate(firstDate) === formatLocalDate(secondDate);

const formatHungarianLongDate = (dateInput) => {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  const formatted = date.toLocaleDateString('hu-HU', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return formatted
    .split(', ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(', ');
};

const formatRecommendationCardDateLabel = (dateInput) => {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('hu-HU', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};

const sortByHungarianLabel = (firstValue, secondValue) => String(firstValue || '').localeCompare(String(secondValue || ''), 'hu', { sensitivity: 'base' });

const normalizeSearchText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('hu-HU');

const MEAL_TYPE_CATEGORY_MAP = {
  breakfast: ['breads', 'dairy', 'fruits', 'sweets'],
  lunch: ['meats', 'vegetables', 'dairy', 'breads'],
  dinner: ['meats', 'vegetables', 'dairy', 'breads'],
  snack: ['fruits', 'dairy', 'sweets', 'breads']
};

const isBreadFood = (food) => (
  food.category === 'Reggeli ételek' && /kenyer|kifli|zsemle|kalacs|csiga|taska|pogacsa|croissant|palacsinta|piritos|bagel|langos|melegszendvics|keksz/i.test(normalizeSearchText(food.name))
);

const isSweetFood = (food) => (
  food.category === 'Snackek és Édességek' ||
  (food.category === 'Reggeli ételek' && /mez|lekvar|nutella|csiga|taska|granola|palacsinta/i.test(normalizeSearchText(food.name)))
);

const FOOD_CATEGORY_OPTIONS = [
  { key: 'dairy', label: 'Tejtermékek', matches: (food) => food.category === 'Tejtermékek és Tojás' },
  { key: 'vegetables', label: 'Zöldségek', matches: (food) => food.category === 'Zöldségek' },
  { key: 'fruits', label: 'Gyümölcsök', matches: (food) => food.category === 'Gyümölcsök' },
  { key: 'meats', label: 'Húsok - Halak', matches: (food) => food.category === 'Húsok és Halak' || food.category === 'Ebéd és Vacsora (Készételek)' },
  { key: 'sweets', label: 'Édességek', matches: (food) => isSweetFood(food) },
  { key: 'breads', label: 'Kenyérfélék', matches: (food) => isBreadFood(food) }
];

const DEFAULT_RECOMMENDATION_MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const DEFAULT_RECOMMENDATION_MEAL_LABELS = {
  breakfast: 'Reggeli',
  lunch: 'Ebéd',
  dinner: 'Vacsora',
  snack: 'Snack'
};

const normalizeRecommendationMeals = (meals) => {
  if (!Array.isArray(meals)) return [];

  return meals
    .filter(Boolean)
    .map((meal, index) => {
      const fallbackMealType = DEFAULT_RECOMMENDATION_MEAL_ORDER[index] || `meal-${index}`;
      const mealType = meal.meal_type || fallbackMealType;

      return {
        ...meal,
        meal_type: mealType,
        mealTypeLabel: meal.mealTypeLabel || DEFAULT_RECOMMENDATION_MEAL_LABELS[mealType] || mealType
      };
    });
};

const buildNutritionRecommendationDay = ({
  date,
  dayPlan,
  fallbackRecommendations,
  fallbackCalorieTarget,
  fallbackNote,
  isLoading
}) => {
  const normalizedDate = formatLocalDate(date);
  const normalizedRecommendations = normalizeRecommendationMeals(
    dayPlan?.recommendations?.length ? dayPlan.recommendations : fallbackRecommendations
  );

  return {
    recommendationDate: dayPlan?.recommendationDate || normalizedDate,
    recommendationDateLabel: dayPlan?.recommendationDateLabel || formatRecommendationCardDateLabel(date),
    calorieTarget: dayPlan?.calorieTarget || fallbackCalorieTarget || 0,
    recommendations: normalizedRecommendations,
    recommendationNote: dayPlan?.recommendationNote || fallbackNote || (isLoading ? 'A kivalasztott het ajanlasai betoltes alatt vannak.' : '')
  };
};

const getNutritionRecommendationWeekKey = (weeklyRecommendations, fallbackDate) => {
  if (Array.isArray(weeklyRecommendations) && weeklyRecommendations.length > 0) {
    const firstRecommendationDate = weeklyRecommendations[0]?.recommendationDate;
    if (firstRecommendationDate) {
      return formatLocalDate(getStartOfWeek(firstRecommendationDate));
    }
  }

  return fallbackDate ? formatLocalDate(getStartOfWeek(fallbackDate)) : '';
};

const findNutritionRecommendationWeek = (recommendationWeeks, selectedDateKey, selectedWeekKey) => {
  if (recommendationWeeks[selectedWeekKey]) {
    return recommendationWeeks[selectedWeekKey];
  }

  return Object.values(recommendationWeeks).find((week) => (
    Array.isArray(week) && week.some((day) => day?.recommendationDate === selectedDateKey)
  )) || [];
};

const getAuthHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

const getProfileImageStorageKey = (userId) => `powerplan_profile_image_${userId}`;
const getUserMessageSeenStorageKey = (userId) => `powerplan_seen_user_messages_${userId}`;
const getAdminMessageSeenStorageKey = (userId) => `powerplan_seen_admin_messages_${userId}`;
const getUserMessageSeenIdStorageKey = (userId) => `powerplan_seen_user_message_id_${userId}`;
const getAdminMessageSeenIdStorageKey = (userId) => `powerplan_seen_admin_message_id_${userId}`;

const getStoredCurrentUser = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
  } catch {
    return {};
  }
};

const readStoredTimestamp = (storageKey) => {
  if (typeof window === 'undefined' || !storageKey) return '';
  return localStorage.getItem(storageKey) || '';
};

const persistStoredTimestamp = (storageKey, value) => {
  if (typeof window === 'undefined' || !storageKey) return;
  localStorage.setItem(storageKey, value);
};

const readStoredNumber = (storageKey) => {
  if (typeof window === 'undefined' || !storageKey) return 0;
  const parsed = Number(localStorage.getItem(storageKey) || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const persistStoredNumber = (storageKey, value) => {
  if (typeof window === 'undefined' || !storageKey) return;
  localStorage.setItem(storageKey, String(Number(value) || 0));
};

const getTimestampValue = (value) => {
  const timestamp = new Date(value || '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const preventNumberInputWheel = (event) => {
  event.currentTarget.blur();
};

const getDisplayFirstName = (personalInfo, fullName) => {
  const structuredFirstName = personalInfo?.firstName?.trim();
  if (structuredFirstName) return structuredFirstName;

  const normalizedFullName = String(fullName || '').trim();
  if (!normalizedFullName) return 'Felhasznalo';

  const nameParts = normalizedFullName.split(/\s+/).filter(Boolean);
  return nameParts[0] || 'Felhasznalo';
};

const parseFullNameParts = (fullName) => {
  const nameParts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ')
  };
};

const getWeightAxisBounds = (weightValues, anchorWeight) => {
  const numericWeights = weightValues.filter((value) => Number.isFinite(value));
  const fallbackWeight = Number.isFinite(anchorWeight) ? Math.round(anchorWeight) : 80;
  const minWeight = Math.min(...numericWeights, fallbackWeight - WEIGHT_CHART_PADDING_KG);
  const maxWeight = Math.max(...numericWeights, fallbackWeight + WEIGHT_CHART_PADDING_KG);

  return {
    min: Math.max(0, Math.floor(minWeight / WEIGHT_CHART_STEP_KG) * WEIGHT_CHART_STEP_KG),
    max: Math.ceil(maxWeight / WEIGHT_CHART_STEP_KG) * WEIGHT_CHART_STEP_KG
  };
};

const getTodayWorkoutDayKey = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'monday';
  const weekdayIndex = date.getDay();
  return WORKOUT_DAY_KEYS[weekdayIndex === 0 ? 6 : weekdayIndex - 1];
};

const inferDefaultRpeValue = (prescription) => {
  const normalized = normalizeSearchText(String(prescription || ''));
  if (!normalized || normalized.includes('perc')) return '';
  if (/4-6|5-8/.test(normalized)) return '8';
  if (/8-10|10-12/.test(normalized)) return '7';
  if (/12-15/.test(normalized)) return '6';
  return '7';
};

const getRecommendedExerciseMuscleGroup = (exerciseName, workoutType) => {
  const normalizedExerciseName = normalizeSearchText(String(exerciseName || ''));
  const normalizedWorkoutType = normalizeSearchText(workoutType);

  for (const [muscleGroup, exercises] of Object.entries(EXERCISE_DB_WITH_VIDEOS)) {
    const hasExactMatch = exercises.some((exercise) => normalizeSearchText(exercise.name) === normalizedExerciseName);
    if (hasExactMatch) return muscleGroup;
  }

  if (/fut|kocog|bicikli|kerekpar|seta|s[eé]ta|intervall|swing|kit[oö]r[eé]s|guggol|vadli|v[aá]dli|l[aá]b/i.test(normalizedExerciseName)) return 'Láb';
  if (/h[uú]z[oó]dzk|leh[uú]z|evez|felh[uú]z|deadlift|rack pull/i.test(normalizedExerciseName)) return 'Hát';
  if (/fekvenyom|fekv[oő]t[aá]masz|t[aá]rogat|nyom[aá]s|tol[oó]dzkod[aá]s mell/i.test(normalizedExerciseName)) return normalizedWorkoutType === 'push' ? 'Mell' : 'Váll';
  if (/oldalemel|v[aá]ll|arnold|face pull|katonai/i.test(normalizedExerciseName)) return 'Váll';
  if (/bicepsz|curl|karhajl[ií]t/i.test(normalizedExerciseName)) return 'Bicepsz';
  if (/tricepsz|letol[aá]s|koponyaz[uú]z[oó]|sz[uű]k nyom[aá]s|szuk nyomas/i.test(normalizedExerciseName)) return 'Tricepsz';
  if (/plank|has|core|hasker[eé]k|mobilit|ny[uú]jt|nyujt/i.test(normalizedExerciseName)) return 'Has';

  if (normalizedWorkoutType === 'cardio') return 'Láb';
  if (normalizedWorkoutType === 'lower' || normalizedWorkoutType === 'legs' || normalizedWorkoutType === 'leg') return 'Láb';
  if (normalizedWorkoutType === 'pull') return 'Hát';
  if (normalizedWorkoutType === 'push') return 'Mell';

  return 'Has';
};

const getSetsFromPrescription = (prescription, workoutType) => {
  const normalizedPrescription = String(prescription || '').trim();
  const parsedMatch = normalizedPrescription.match(/^(\d+)\s*x\s*(.+)$/i);

  if (!parsedMatch) {
    return [{ weight: '', reps: normalizedPrescription || '8-12', rpe: inferDefaultRpeValue(normalizedPrescription) }];
  }

  const setsCount = Math.max(1, Number(parsedMatch[1]) || 1);
  const repsValue = parsedMatch[2].trim();
  const defaultRpe = normalizeSearchText(workoutType) === 'cardio' ? '' : inferDefaultRpeValue(repsValue);

  return Array.from({ length: setsCount }, () => ({
    weight: '',
    reps: repsValue,
    rpe: defaultRpe
  }));
};

const getProfileEditorMetrics = (dimensions, scale, size = PROFILE_IMAGE_EDITOR_SIZE) => {
  const width = Number(dimensions?.width) || size;
  const height = Number(dimensions?.height) || size;
  const baseScale = Math.max(size / width, size / height);
  const drawWidth = width * baseScale * scale;
  const drawHeight = height * baseScale * scale;

  return {
    drawWidth,
    drawHeight,
    maxOffsetX: Math.max(0, (drawWidth - size) / 2),
    maxOffsetY: Math.max(0, (drawHeight - size) / 2)
  };
};

const clampProfileEditorOffsets = (offsetX, offsetY, dimensions, scale, size = PROFILE_IMAGE_EDITOR_SIZE) => {
  const metrics = getProfileEditorMetrics(dimensions, scale, size);
  return {
    offsetX: Math.min(metrics.maxOffsetX, Math.max(-metrics.maxOffsetX, offsetX)),
    offsetY: Math.min(metrics.maxOffsetY, Math.max(-metrics.maxOffsetY, offsetY))
  };
};

const getProfileEditorPreviewStyle = (dimensions, scale, offsetX, offsetY, size = PROFILE_IMAGE_EDITOR_SIZE) => {
  const metrics = getProfileEditorMetrics(dimensions, scale, size);
  return {
    width: `${metrics.drawWidth}px`,
    height: `${metrics.drawHeight}px`,
    left: `${(size - metrics.drawWidth) / 2 + offsetX}px`,
    top: `${(size - metrics.drawHeight) / 2 + offsetY}px`
  };
};

const loadImageDimensions = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
  image.onerror = () => reject(new Error('Nem sikerult betolteni a kepet.'));
  image.src = src;
});

const renderProfileImageDataUrl = (src, dimensions, scale, offsetX, offsetY, size = PROFILE_IMAGE_EDITOR_SIZE) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    const metrics = getProfileEditorMetrics(dimensions, scale, size);
    const drawX = (size - metrics.drawWidth) / 2 + offsetX;
    const drawY = (size - metrics.drawHeight) / 2 + offsetY;

    context.drawImage(image, drawX, drawY, metrics.drawWidth, metrics.drawHeight);
    resolve(canvas.toDataURL('image/png'));
  };
  image.onerror = () => reject(new Error('Nem sikerult feldolgozni a kepet.'));
  image.src = src;
});

const stripRecommendedWorkoutSuffix = (name) => String(name || '').replace(/\s*\(minta\)\s*$/i, '').trim();

const WORKOUT_TYPE_LABELS = {
  push: 'Nyomó',
  pull: 'Húzó',
  leg: 'Láb',
  upper: 'Felsőtest',
  lower: 'Alsótest',
  'full body': 'Teljes test',
  arms: 'Kar',
  cardio: 'Kardió',
  hiit: 'HIIT'
};

const WORKOUT_TYPE_ALIASES = {
  push: 'push',
  nyomo: 'push',
  pull: 'pull',
  huzo: 'pull',
  leg: 'leg',
  legs: 'leg',
  lab: 'leg',
  upper: 'upper',
  'felso test': 'upper',
  felsotest: 'upper',
  lower: 'lower',
  'also test': 'lower',
  alsotest: 'lower',
  'full body': 'full body',
  'full-body': 'full body',
  fullbody: 'full body',
  full_body: 'full body',
  'teljes test': 'full body',
  teljestest: 'full body',
  arms: 'arms',
  kar: 'arms',
  cardio: 'cardio',
  kardio: 'cardio',
  hiit: 'hiit'
};

const normalizeWorkoutTypeAliasKey = (type) => normalizeSearchText(String(type || '').replace(/[_-]+/g, ' ')).replace(/\s+/g, ' ').trim();

const normalizeWorkoutTypeValue = (type) => {
  const normalizedKey = normalizeWorkoutTypeAliasKey(type);
  return WORKOUT_TYPE_ALIASES[normalizedKey] || String(type || '').trim().toLowerCase();
};

const serializeWorkoutTypeValue = (type) => {
  const normalizedType = normalizeWorkoutTypeValue(type);
  if (normalizedType === 'full body') return 'full_body';
  if (normalizedType === 'leg') return 'legs';
  return normalizedType;
};

const formatWorkoutTypeLabel = (type) => {
  const normalizedType = normalizeWorkoutTypeValue(type);
  return WORKOUT_TYPE_LABELS[normalizedType] || type || '-';
};

const isRecommendedWorkoutCompleted = (recommendedWorkout, loggedWorkout) => {
  const recommendedTitle = normalizeSearchText(stripRecommendedWorkoutSuffix(recommendedWorkout?.title));
  const loggedTitle = normalizeSearchText(stripRecommendedWorkoutSuffix(loggedWorkout?.name));
  if (!recommendedTitle || !loggedTitle || recommendedTitle !== loggedTitle) {
    return false;
  }

  return serializeWorkoutTypeValue(recommendedWorkout?.workoutType) === serializeWorkoutTypeValue(loggedWorkout?.workout_type);
};

const EXERCISE_DB_WITH_VIDEOS = {
  Mell: [
    { name: 'Fekvenyomás (Rúd)', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', difficulty: 'intermediate' },
    { name: 'Fekvenyomás (Kézisúlyzó)', video: 'https://www.youtube.com/embed/VmB1G1K7v94', difficulty: 'beginner' },
    { name: 'Ferde pados nyomás', video: 'https://www.youtube.com/embed/JChVKM4ga4Y', difficulty: 'intermediate' },
    { name: 'Tárogatás', video: 'https://www.youtube.com/embed/kIpagzRxFPo', difficulty: 'beginner' },
    { name: 'Kábelkereszt', video: 'https://www.youtube.com/embed/taI4XduLpTk', difficulty: 'advanced' },
    { name: 'Ferde pados kézisúlyzós nyomás', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', difficulty: 'intermediate' },
    { name: 'Tolódzkodás mellre döntve', video: 'https://www.youtube.com/embed/2z8JmcrW-As', difficulty: 'advanced' },
    { name: 'Hammer Strength mellnyomás', video: 'https://www.youtube.com/embed/sqNwDkUU_Ps', difficulty: 'beginner' },
    { name: 'Pec deck', video: 'https://www.youtube.com/embed/eozdVDA78K0', difficulty: 'beginner' },
    { name: 'Fekvőtámasz', video: 'https://www.youtube.com/embed/IODxDxX7oi4', difficulty: 'beginner' }
  ],
  'Hát': [
    { name: 'Húzódzkodás', video: 'https://www.youtube.com/embed/eGo4IYlbE5g', difficulty: 'intermediate' },
    { name: 'Lehúzás csigán', video: 'https://www.youtube.com/embed/CAwf7n6Luuc', difficulty: 'beginner' },
    { name: 'Felhúzás (Deadlift)', video: 'https://www.youtube.com/embed/op9kVnSso6Q', difficulty: 'advanced' },
    { name: 'Döntött törzsű evezés rúddal', video: 'https://www.youtube.com/embed/vT2GjY_Umpw', difficulty: 'intermediate' },
    { name: 'Evezés csigán', video: 'https://www.youtube.com/embed/GZbfZ033f74', difficulty: 'beginner' },
    { name: 'Egykezes evezés kézisúlyzóval', video: 'https://www.youtube.com/embed/pYcpY20QaE8', difficulty: 'beginner' },
    { name: 'T-rudas evezés', video: 'https://www.youtube.com/embed/j3Igk5nyZE4', difficulty: 'advanced' },
    { name: 'Straight-arm lehúzás', video: 'https://www.youtube.com/embed/hAMcfubonDc', difficulty: 'beginner' },
    { name: 'Fordított pec deck', video: 'https://www.youtube.com/embed/EA7u4Q_8HQ0', difficulty: 'beginner' },
    { name: 'Rack pull', video: 'https://www.youtube.com/embed/ZlRrIsoDpKg', difficulty: 'advanced' },
    { name: 'Gumiszalagos lehúzás', video: 'https://www.youtube.com/embed/K59OGC4aeQ4', difficulty: 'beginner' }
  ],
  'Láb': [
    { name: 'Guggolás', video: 'https://www.youtube.com/embed/lRYBbchqxtI', difficulty: 'intermediate' },
    { name: 'Lábnyomás', video: 'https://www.youtube.com/embed/nDh_BlnLCGc', difficulty: 'beginner' },
    { name: 'Bolgár guggolás', video: 'https://www.youtube.com/embed/2C-uNgKwPLE', difficulty: 'intermediate' },
    { name: 'Combfeszítő', video: 'https://www.youtube.com/embed/YyvSfVjQeL0', difficulty: 'beginner' },
    { name: 'Combhajlító gép', video: 'https://www.youtube.com/embed/1Tq3QdYUuHs', difficulty: 'beginner' },
    { name: 'Román felhúzás', video: 'https://www.youtube.com/embed/2SHsk9AzdjA', difficulty: 'intermediate' },
    { name: 'Kitörés', video: 'https://www.youtube.com/embed/QOVaHwm-Q6U', difficulty: 'beginner' },
    { name: 'Hack guggolás', video: 'https://www.youtube.com/embed/0tn5K9NlCfo', difficulty: 'intermediate' },
    { name: 'Csípőemelés rúddal', video: 'https://www.youtube.com/embed/LM8XHLYJoYs', difficulty: 'intermediate' },
    { name: 'Álló vádliemelés', video: 'https://www.youtube.com/embed/-M4-G8p8fmc', difficulty: 'beginner' },
    { name: 'Sissy guggolás', video: 'https://www.youtube.com/embed/6L-nXAUD7zQ', difficulty: 'advanced' }
  ],
  'Váll': [
    { name: 'Vállból nyomás', video: 'https://www.youtube.com/embed/2yjwXTZQDDI', difficulty: 'intermediate' },
    { name: 'Oldalemelés', video: 'https://www.youtube.com/embed/3VcKaXpzqRo', difficulty: 'beginner' },
    { name: 'Arnold nyomás', video: 'https://www.youtube.com/embed/6Z15_WdXmVw', difficulty: 'intermediate' },
    { name: 'Előreemelés tárcsával', video: 'https://www.youtube.com/embed/-t7fuZ0KhDA', difficulty: 'beginner' },
    { name: 'Hátsóváll döntött oldalemelés', video: 'https://www.youtube.com/embed/ttvfGg9d76c', difficulty: 'beginner' },
    { name: 'Face pull', video: 'https://www.youtube.com/embed/rep-qVOkqgk', difficulty: 'beginner' },
    { name: 'Katonai nyomás', video: 'https://www.youtube.com/embed/B-aVuyhvLHU', difficulty: 'advanced' },
    { name: 'Upright row', video: 'https://www.youtube.com/embed/jaAV-rD45I0', difficulty: 'intermediate' },
    { name: 'Kábel oldalemelés', video: 'https://www.youtube.com/embed/XPPfnSEATJA', difficulty: 'beginner' },
    { name: 'Gépi vállnyomás', video: 'https://www.youtube.com/embed/WvLMauqrnK8', difficulty: 'beginner' },
    { name: 'Fordított tárogatás', video: 'https://www.youtube.com/embed/xvEkgGUrGPM', difficulty: 'beginner' }
  ],
  Bicepsz: [
    { name: 'Bicepsz karhajlítás rúddal', video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo', difficulty: 'beginner' },
    { name: 'Kalapács bicepsz', video: 'https://www.youtube.com/embed/zC3nLlEvin4', difficulty: 'beginner' },
    { name: 'Koncentrált bicepsz', video: 'https://www.youtube.com/embed/0AUGkch3tzc', difficulty: 'intermediate' },
    { name: 'Scott pad bicepsz', video: 'https://www.youtube.com/embed/fIWP-FRFNU0', difficulty: 'intermediate' },
    { name: 'Kábeles bicepsz hajlítás', video: 'https://www.youtube.com/embed/NFzTWp2qpiE', difficulty: 'beginner' },
    { name: 'Váltott karos bicepsz kézisúlyzóval', video: 'https://www.youtube.com/embed/sAq_ocpRh_I', difficulty: 'beginner' },
    { name: 'Fordított fogású bicepsz', video: 'https://www.youtube.com/embed/nRgxYX2Ve9w', difficulty: 'intermediate' },
    { name: 'Ferde padon bicepsz', video: 'https://www.youtube.com/embed/soxrZlIl35U', difficulty: 'intermediate' },
    { name: 'Spider curl', video: 'https://www.youtube.com/embed/ivS3G35bapw', difficulty: 'advanced' },
    { name: 'Preacher machine bicepsz', video: 'https://www.youtube.com/embed/Htw-s61mOw0', difficulty: 'beginner' }
  ],
  Tricepsz: [
    { name: 'Tricepsz letolás csigán', video: 'https://www.youtube.com/embed/1FjkhpZsaxc', difficulty: 'beginner' },
    { name: 'Letolás francia rúddal', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', difficulty: 'intermediate' },
    { name: 'Koponyazúzó', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', difficulty: 'intermediate' },
    { name: 'Tricepsz nyújtás fej fölött kötéllel', video: 'https://www.youtube.com/embed/_gsUck-7M74', difficulty: 'beginner' },
    { name: 'Szűk fekvenyomás', video: 'https://www.youtube.com/embed/nEF0bv2FW94', difficulty: 'advanced' },
    { name: 'Tolódzkodás tricepszre', video: 'https://www.youtube.com/embed/0326dy_-CzM', difficulty: 'intermediate' },
    { name: 'Lórúgás', video: 'https://www.youtube.com/embed/6SS6K3lAwZ8', difficulty: 'beginner' },
    { name: 'Egykezes fej fölötti tricepsz nyújtás', video: 'https://www.youtube.com/embed/-Vyt2QdsR7E', difficulty: 'beginner' },
    { name: 'Fordított fogású letolás', video: 'https://www.youtube.com/embed/kiuVA0gs3EI', difficulty: 'beginner' },
    { name: 'Padon tolódzkodás', video: 'https://www.youtube.com/embed/6kALZikXxLc', difficulty: 'beginner' }
  ],
  Has: [
    { name: 'Hasprés', video: 'https://www.youtube.com/embed/eeJ_CYqSoT4', difficulty: 'beginner' },
    { name: 'Plank', video: 'https://www.youtube.com/embed/pSHjTRCQxIw', difficulty: 'beginner' },
    { name: 'Lábemelés fekve', video: 'https://www.youtube.com/embed/JB2oyawG9KI', difficulty: 'beginner' },
    { name: 'Függeszkedéses lábemelés', video: 'https://www.youtube.com/embed/Pr1ieGZ5atk', difficulty: 'intermediate' },
    { name: 'Orosz twist', video: 'https://www.youtube.com/embed/wkD8rjkodUI', difficulty: 'beginner' },
    { name: 'Biciklis hasprés', video: 'https://www.youtube.com/embed/9FGilxCbdz8', difficulty: 'beginner' },
    { name: 'Haskerék', video: 'https://www.youtube.com/embed/A3uK5TPzHq8', difficulty: 'advanced' },
    { name: 'Dead bug', video: 'https://www.youtube.com/embed/g_BYB0R-4Ws', difficulty: 'beginner' },
    { name: 'Mountain climber', video: 'https://www.youtube.com/embed/nmwgirgXLYM', difficulty: 'beginner' },
    { name: 'Fordított hasprés', video: 'https://www.youtube.com/embed/hyv14e2QDq0', difficulty: 'beginner' },
    { name: 'Oldalsó plank', video: 'https://www.youtube.com/embed/K2VljzCC16g', difficulty: 'beginner' }
  ]
};

const MUSCLE_FILTER = {
  push: ['Mell', 'Váll', 'Tricepsz'],
  pull: ['Hát', 'Bicepsz'],
  leg: ['Láb', 'Has'],
  upper: ['Mell', 'Hát', 'Váll', 'Bicepsz', 'Tricepsz'],
  lower: ['Láb', 'Has'],
  'full body': Object.keys(EXERCISE_DB_WITH_VIDEOS),
  arms: ['Bicepsz', 'Tricepsz'],
  legs: ['Láb', 'Has'],
  full_body: Object.keys(EXERCISE_DB_WITH_VIDEOS),
  cardio: ['Láb', 'Has'],
  hiit: Object.keys(EXERCISE_DB_WITH_VIDEOS)
};

export {
  DEFAULT_RECOMMENDATION_MEAL_ORDER,
  DEFAULT_RECOMMENDATION_MEAL_LABELS,
  EXERCISE_DB_WITH_VIDEOS,
  FOOD_CATEGORY_OPTIONS,
  MAX_REALISTIC_WEIGHT_KG,
  MEAL_TYPE_CATEGORY_MAP,
  MIN_REALISTIC_WEIGHT_KG,
  MUSCLE_FILTER,
  PROFILE_IMAGE_EDITOR_SIZE,
  RPE_TOOLTIP_TEXT,
  WEIGHT_CHART_PADDING_KG,
  WEIGHT_CHART_STEP_KG,
  WORKOUT_DAY_KEYS,
  WORKOUT_TYPE_LABELS,
  buildNutritionRecommendationDay,
  clampProfileEditorOffsets,
  findNutritionRecommendationWeek,
  formatHungarianLongDate,
  formatLocalDate,
  formatRecommendationCardDateLabel,
  formatWorkoutTypeLabel,
  getAuthHeaders,
  getDisplayFirstName,
  getNutritionRecommendationWeekKey,
  getProfileEditorMetrics,
  getProfileEditorPreviewStyle,
  getProfileImageStorageKey,
  getRecommendedExerciseMuscleGroup,
  getSetsFromPrescription,
  getStartOfWeek,
  getStoredCurrentUser,
  getTimestampValue,
  getTodayWorkoutDayKey,
  getUserMessageSeenIdStorageKey,
  getUserMessageSeenStorageKey,
  getAdminMessageSeenIdStorageKey,
  getAdminMessageSeenStorageKey,
  getWeightAxisBounds,
  inferDefaultRpeValue,
  isRecommendedWorkoutCompleted,
  isSameDay,
  loadImageDimensions,
  normalizeRecommendationMeals,
  normalizeSearchText,
  normalizeWorkoutTypeValue,
  parseFullNameParts,
  persistStoredNumber,
  persistStoredTimestamp,
  preventNumberInputWheel,
  readStoredNumber,
  readStoredTimestamp,
  renderProfileImageDataUrl,
  serializeWorkoutTypeValue,
  sortByHungarianLabel,
  stripRecommendedWorkoutSuffix
};