import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Radar } from 'react-chartjs-2';

import { FLAT_FOOD_OPTIONS } from '../../utils/foodDatabase';
import '../dashboard.css';
import GymMap from './components/GymMap';
import AdminSection from './components/AdminSection';
import BadgesSection from './components/BadgesSection';
import DashboardOverviewSection from './components/DashboardOverviewSection';
import ExercisesSection from './components/ExercisesSection';
import MessagesSection from './components/MessagesSection';
import ProgressPhotosSection from './components/ProgressPhotosSection';
import ProgressSection from './components/ProgressSection';
import ProfileSection from './components/ProfileSection';
import Toast from './components/Toast';
import WeekCalendar from './components/WeekCalendar';
import WorkoutModeSection from './components/WorkoutModeSection';
import WorkoutPlanSection from './components/WorkoutPlanSection';
import {
  EXERCISE_DB_WITH_VIDEOS,
  FOOD_CATEGORY_OPTIONS,
  MAX_REALISTIC_WEIGHT_KG,
  MIN_REALISTIC_WEIGHT_KG,
  MUSCLE_FILTER,
  RPE_TOOLTIP_TEXT,
  WEIGHT_CHART_STEP_KG,
  WORKOUT_DAY_KEYS,
  buildNutritionRecommendationDay,
  clampProfileEditorOffsets,
  findNutritionRecommendationWeek,
  formatHungarianLongDate,
  formatLocalDate,
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
  getTodayWorkoutDayKey,
  getUserMessageSeenIdStorageKey,
  getUserMessageSeenStorageKey,
  getAdminMessageSeenIdStorageKey,
  getAdminMessageSeenStorageKey,
  getTimestampValue,
  getWeightAxisBounds,
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
  stripRecommendedWorkoutSuffix
} from './dashboardShared';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = ({ navigateTo, handleLogout, requestLogout, darkMode, setDarkMode }) => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [sidebarActive, setSidebarActive] = useState(false);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [modalOpen, setModalOpen] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [mealGrams, setMealGrams] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('');
  const [mealToDelete, setMealToDelete] = useState(null);
  const [showDeleteMealModal, setShowDeleteMealModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [showDeleteWorkoutModal, setShowDeleteWorkoutModal] = useState(false);
  const [progressPhotoToDelete, setProgressPhotoToDelete] = useState(null);
  const [showDeleteProgressPhotoModal, setShowDeleteProgressPhotoModal] = useState(false);
  const [adminUserToDelete, setAdminUserToDelete] = useState(null);
  const [showDeleteAdminUserModal, setShowDeleteAdminUserModal] = useState(false);
  
  // Edzés részletek modalhoz
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetailsModal, setShowWorkoutDetailsModal] = useState(false);
  
  // Szerkesztéshez
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  
  // Fejlődés fotók
  const [progressPhotos, setProgressPhotos] = useState([]);
  
  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2100);
  };
  
  // Profil adatok
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageEditorOpen, setProfileImageEditorOpen] = useState(false);
  const [profileImageDraft, setProfileImageDraft] = useState('');
  const [profileImageDraftDimensions, setProfileImageDraftDimensions] = useState(null);
  const [profileImageScale, setProfileImageScale] = useState(1);
  const [profileImageOffset, setProfileImageOffset] = useState({ x: 0, y: 0 });
  const [profileImageSaving, setProfileImageSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    height: '',
    weight: '',
    birthDate: ''
  });
  const [startingWeight, setStartingWeight] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [savingPasswordChange, setSavingPasswordChange] = useState(false);
  
  // Jelvények és rekordok
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({
    benchPress: 0,
    squat: 0,
    deadlift: 0
  });
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminActivePanel, setAdminActivePanel] = useState('messages');
  const [adminMessageTab, setAdminMessageTab] = useState('incoming');
  const [savedAdminUserIds, setSavedAdminUserIds] = useState({});
  const [deletingAdminUserId, setDeletingAdminUserId] = useState(null);
  const [deletingAdminMessageId, setDeletingAdminMessageId] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [userMessagesLoading, setUserMessagesLoading] = useState(false);
  const [sendingUserMessage, setSendingUserMessage] = useState(false);
  const [deletingUserMessageId, setDeletingUserMessageId] = useState(null);
  const [userMessageTab, setUserMessageTab] = useState('incoming');
  const [userMessageForm, setUserMessageForm] = useState({ subject: '', message: '' });
  const [userMessagesSeenAt, setUserMessagesSeenAt] = useState(() => {
    const storedUser = getStoredCurrentUser();
    return storedUser?.id ? readStoredTimestamp(getUserMessageSeenStorageKey(storedUser.id)) : '';
  });
  const [userMessagesSeenId, setUserMessagesSeenId] = useState(() => {
    const storedUser = getStoredCurrentUser();
    return storedUser?.id ? readStoredNumber(getUserMessageSeenIdStorageKey(storedUser.id)) : 0;
  });
  const [adminMessagesSeenAt, setAdminMessagesSeenAt] = useState(() => {
    const storedUser = getStoredCurrentUser();
    return storedUser?.id ? readStoredTimestamp(getAdminMessageSeenStorageKey(storedUser.id)) : '';
  });
  const [adminMessagesSeenId, setAdminMessagesSeenId] = useState(() => {
    const storedUser = getStoredCurrentUser();
    return storedUser?.id ? readStoredNumber(getAdminMessageSeenIdStorageKey(storedUser.id)) : 0;
  });

  const getUserRole = (user) => (String(user?.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user');
  const hasAdminAccess = (user) => getUserRole(user) === 'admin' || Boolean(user?.is_admin);
  const isUnreadForAdmin = (message) => {
    if (message?.origin === 'admin') return false;

    const activityAt = getTimestampValue(message?.createdAt);
    const seenAt = getTimestampValue(adminMessagesSeenAt);
    const backendReadAt = getTimestampValue(message?.adminReadAt);
    const seenId = Number(adminMessagesSeenId) || 0;
    const messageId = Number(message?.id) || 0;
    const backendUnread = Boolean(message?.isUnreadForAdmin);

    if (backendReadAt >= activityAt && activityAt > 0) return false;
    if (messageId > 0 && seenId >= messageId) return false;
    if (seenAt > 0 && activityAt > 0 && seenAt >= activityAt) return false;
    if (messageId > seenId) return true;
    return backendUnread || activityAt > seenAt;
  };
  const isUnreadForUser = (message) => {
    const seenAt = getTimestampValue(userMessagesSeenAt);
    const backendReadAt = getTimestampValue(message?.userReadAt);
    const seenId = Number(userMessagesSeenId) || 0;
    const messageId = Number(message?.id) || 0;
    const backendUnread = Boolean(message?.isUnreadForUser);

    if (message?.origin === 'admin') {
      const activityAt = getTimestampValue(message?.createdAt);
      if (backendReadAt >= activityAt && activityAt > 0) return false;
      if (messageId > 0 && seenId >= messageId) return false;
      if (seenAt > 0 && activityAt > 0 && seenAt >= activityAt) return false;
      if (messageId > seenId) return true;
      return backendUnread || activityAt > seenAt;
    }

    if (!message?.adminReply) return false;

    const activityAt = getTimestampValue(message?.repliedAt || message?.createdAt);
    if (backendReadAt >= activityAt && activityAt > 0) return false;
    if (messageId > 0 && seenId >= messageId) return false;
    if (seenAt > 0 && activityAt > 0 && seenAt >= activityAt) return false;
    return backendUnread || activityAt > seenAt;
  };
  const incomingAdminMessages = adminMessages.filter((message) => message.origin !== 'admin');
  const sentAdminMessages = adminMessages.filter((message) => message.origin === 'admin');
  const incomingUserMessages = userMessages.filter((message) => message.origin === 'admin' || Boolean(message.adminReply));
  const sentUserMessages = userMessages.filter((message) => message.origin !== 'admin');
  const unreadAdminMessagesCount = incomingAdminMessages.filter(isUnreadForAdmin).length;
  const unreadUserMessagesCount = incomingUserMessages.filter(isUnreadForUser).length;
  
  const [userData, setUserData] = useState({});
  const [workoutData, setWorkoutData] = useState({ weeklyPlan: [], stats: {}, aiRecommendation: '', recommendedPlan: [], recommendationNote: '' });
  const [nutritionData, setNutritionData] = useState({ todayMeals: [], dailyCalories: 0, recommendations: [], weeklyRecommendations: [], calorieTarget: 2500, recommendationDate: '', recommendationNote: '' });
  const [nutritionRecommendationWeeks, setNutritionRecommendationWeeks] = useState({});
  const [nutritionWeekData, setNutritionWeekData] = useState({ dailyTotals: [], meals: [] });
  const [weightHistory, setWeightHistory] = useState([]);
  const [nutritionSelectedDate, setNutritionSelectedDate] = useState(new Date());
  const [nutritionRecommendationLoading, setNutritionRecommendationLoading] = useState(false);
  const [currentDayKey, setCurrentDayKey] = useState(formatLocalDate(new Date()));
  const [savingRecommendedMealKey, setSavingRecommendedMealKey] = useState('');
  const [savingRecommendedWorkoutKey, setSavingRecommendedWorkoutKey] = useState('');

  const normalizedMealSearch = normalizeSearchText(mealSearchQuery.trim());
  const availableCategoryOptions = FOOD_CATEGORY_OPTIONS;
  const activeCategoryOption = FOOD_CATEGORY_OPTIONS.find((option) => option.key === selectedFoodCategory) || null;
  const parsedMealGrams = mealGrams === '' ? null : Number(mealGrams);
  const filteredFoodOptions = FLAT_FOOD_OPTIONS.filter((food) => {
    if (activeCategoryOption && !activeCategoryOption.matches(food)) {
      return false;
    }

    if (!normalizedMealSearch) {
      return true;
    }

    return normalizeSearchText(food.name).includes(normalizedMealSearch);
  }).slice(0, 40);
  const calculatedMealCalories = selectedFood && parsedMealGrams !== null && parsedMealGrams > 0
    ? Math.round((selectedFood.calories * parsedMealGrams) / (selectedFood.calorieBasisGrams || 100))
    : '';
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const profileImageInputRef = useRef(null);
  const profileImageDragStartRef = useRef(null);

  const [workoutFormDetails, setWorkoutFormDetails] = useState({ name: '', type: '', day: '' });
  const [exercisesList, setExercisesList] = useState([
    { id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }
  ]);

  const hydrateProfileFromQuestionnaire = (questionnaire) => {
    if (!questionnaire) return;

    const resolvedStartingWeight = questionnaire.personalInfo?.startingWeight ?? '';

    if (resolvedStartingWeight !== '') {
      setStartingWeight(resolvedStartingWeight);
    }

    setUserData((prev) => ({
      ...prev,
      ...questionnaire,
      email: questionnaire.email || prev.email || '',
      personalInfo: {
        ...prev.personalInfo,
        ...questionnaire.personalInfo,
        startingWeight: prev.personalInfo?.startingWeight || resolvedStartingWeight
      },
      goals: {
        ...prev.goals,
        ...questionnaire.goals
      },
      preferences: {
        ...prev.preferences,
        ...questionnaire.preferences
      },
      nutrition: {
        ...prev.nutrition,
        ...questionnaire.nutrition
      }
    }));

    setEditFormData((prev) => ({
      ...prev,
      fullName: `${questionnaire.personalInfo?.lastName || prev.fullName.split(' ')[0] || ''} ${questionnaire.personalInfo?.firstName || prev.fullName.split(' ').slice(1).join(' ') || ''}`.trim() || prev.fullName,
      email: questionnaire.email || prev.email,
      height: questionnaire.personalInfo?.height || '',
      weight: questionnaire.personalInfo?.weight || '',
      birthDate: formatDateForInput(questionnaire.personalInfo?.birthDate || '')
    }));
  };

  // Adatok betöltése
  useEffect(() => {
    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (currentUser) {
      setIsAdmin(hasAdminAccess(currentUser));
      const parsedCurrentUserName = parseFullNameParts(currentUser.full_name);
      setUserData({
        email: currentUser.email || '',
        personalInfo: { firstName: parsedCurrentUserName.firstName, lastName: parsedCurrentUserName.lastName }
      });
      
      setEditFormData(prev => ({
        ...prev,
        fullName: currentUser.full_name || '',
        email: currentUser.email || ''
      }));

      const savedQuestionnaire = localStorage.getItem('powerplan_questionnaire');
      if (savedQuestionnaire) {
        try {
          hydrateProfileFromQuestionnaire(JSON.parse(savedQuestionnaire));
        } catch (error) {
          console.warn('Nem sikerült beolvasni a helyi kérdőívet:', error);
        }
      }

      const cachedProfileImage = localStorage.getItem(getProfileImageStorageKey(currentUser.id));
      setProfileImage(cachedProfileImage || null);

      if (currentUser.id && currentUser.id !== 'demo-999') {
        loadUserData(currentUser.id, token);
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
        loadNutritionWeek(new Date());
        loadProfileImage(currentUser.id, token);
        loadProgressPhotos(currentUser.id, token);
        loadUserMessages(currentUser.id, token);
        if (hasAdminAccess(currentUser)) {
          loadAdminData(currentUser.id, token);
        }
      }
    } else {
      if (navigateTo) navigateTo('home');
    }
  }, []);

  const formatDateForInput = (date) => {
    if (!date) return '';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeNumberInput = (value) => {
    if (value === undefined || value === null || value === '') return '';
    const normalized = typeof value === 'string' ? value.replace(',', '.') : value;
    const number = parseFloat(normalized);
    return Number.isNaN(number) ? '' : number;
  };

  const loadUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5001/api/questionnaire/${userId}`, { 
        headers: getAuthHeaders(token)
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.questionnaire) {
          hydrateProfileFromQuestionnaire(data.questionnaire);
          localStorage.setItem('powerplan_questionnaire', JSON.stringify(data.questionnaire));
        }
      }
    } catch (error) { console.error(error); }
  };

  const loadDashboardData = async (userId, token, referenceDate = new Date()) => {
    setNutritionRecommendationLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/dashboard/${userId}?date=${encodeURIComponent(formatLocalDate(referenceDate) || formatLocalDate(new Date()))}`, { 
        headers: getAuthHeaders(token)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNutritionData(data.nutrition);
          const recommendationWeekKey = getNutritionRecommendationWeekKey(
            data.nutrition?.weeklyRecommendations,
            data.nutrition?.recommendationDate || referenceDate
          );
          if (recommendationWeekKey && Array.isArray(data.nutrition?.weeklyRecommendations)) {
            setNutritionRecommendationWeeks((prev) => ({
              ...prev,
              [recommendationWeekKey]: data.nutrition.weeklyRecommendations
            }));
          }
          setWorkoutData(data.workout);
          setWeightHistory(data.weightHistory || []);
          if ((data.weightHistory || []).length > 0) {
            setStartingWeight(String(data.weightHistory[0].weight));
          }
          return data;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setNutritionRecommendationLoading(false);
    }

    return null;
  };

  const loadProfileImage = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5001/api/user-profile/${userId}`, {
        headers: getAuthHeaders(token)
      });
      if (response.ok) {
        const data = await response.json();
        const imageValue = data.profileImage || null;
        setProfileImage(imageValue);
        setIsAdmin(data.role === 'admin' || Boolean(data.isAdmin));

        const savedUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
        if (savedUser.id === userId) {
          localStorage.setItem('powerplan_current_user', JSON.stringify({
            ...savedUser,
            profile_image: imageValue,
            role: data.role || savedUser.role || 'user',
            is_admin: data.role === 'admin' || Boolean(data.isAdmin)
          }));
        }

        if (imageValue) {
          localStorage.setItem(getProfileImageStorageKey(userId), imageValue);
        } else {
          localStorage.removeItem(getProfileImageStorageKey(userId));
        }
      }
    } catch (error) { console.error(error); }
  };

  const persistProfileImage = async (base64Image) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem módosíthatod a profilképet!', 'error');
      return false;
    }

    setProfileImage(base64Image);
    setIsProfileSaved(false);
    localStorage.setItem(getProfileImageStorageKey(currentUser.id), base64Image);

    try {
      const response = await fetch('http://localhost:5001/api/upload-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: currentUser.id, imageBase64: base64Image })
      });

      if (!response.ok) {
        showToast('Hiba a kép mentésekor!', 'error');
        return false;
      }

      showToast('Profilkép sikeresen frissítve!', 'success');
      return true;
    } catch (error) {
      console.error('Profilkép mentési hiba:', error);
      showToast('Hálózati hiba!', 'error');
      return false;
    }
  };

  const closeProfileImageEditor = () => {
    setProfileImageEditorOpen(false);
    setProfileImageDraft('');
    setProfileImageDraftDimensions(null);
    setProfileImageScale(1);
    setProfileImageOffset({ x: 0, y: 0 });
    setProfileImageSaving(false);
    profileImageDragStartRef.current = null;
  };

  const openProfileImageEditor = async (imageSource) => {
    if (!imageSource) return;

    try {
      const dimensions = await loadImageDimensions(imageSource);
      setProfileImageDraft(imageSource);
      setProfileImageDraftDimensions(dimensions);
      setProfileImageScale(1);
      setProfileImageOffset({ x: 0, y: 0 });
      setProfileImageEditorOpen(true);
    } catch (error) {
      console.error('Profilkép előnézeti hiba:', error);
      showToast('A kép megnyitása nem sikerült.', 'error');
    }
  };

  const updateProfileImageTransform = (nextScale, nextOffset) => {
    const clamped = clampProfileEditorOffsets(
      nextOffset?.x ?? profileImageOffset.x,
      nextOffset?.y ?? profileImageOffset.y,
      profileImageDraftDimensions,
      nextScale
    );

    setProfileImageScale(nextScale);
    setProfileImageOffset({ x: clamped.offsetX, y: clamped.offsetY });
  };

  useEffect(() => {
    if (!profileImageEditorOpen) return undefined;

    const handlePointerMove = (event) => {
      const dragStart = profileImageDragStartRef.current;
      if (!dragStart) return;

      updateProfileImageTransform(profileImageScale, {
        x: dragStart.originX + (event.clientX - dragStart.startX),
        y: dragStart.originY + (event.clientY - dragStart.startY)
      });
    };

    const handlePointerUp = () => {
      profileImageDragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [profileImageEditorOpen, profileImageScale, profileImageDraftDimensions, profileImageOffset.x, profileImageOffset.y]);

  const loadNutritionWeek = async (date) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/nutrition/${currentUser.id}/week?date=${formatLocalDate(date)}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.ok) {
        const data = await response.json();
        setNutritionWeekData({
          dailyTotals: data.dailyTotals || [],
          meals: data.meals || []
        });
      }
    } catch (error) {
      console.error('Hiba heti táplálkozás betöltésekor:', error);
    }
  };

  const loadProgressPhotos = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5001/api/progress/${userId}`, {
        headers: getAuthHeaders(token)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.progress) {
          const formattedPhotos = data.progress.map(photo => ({
            id: photo.id,
            image: photo.imageBase64,
            date: new Date(photo.recordDate).toLocaleDateString('hu-HU'),
            note: photo.note || '',
            isPhotoSaved: true,
            isNoteSaved: true
          }));
          setProgressPhotos(formattedPhotos);
        }
      }
    } catch (error) { console.error('Hiba progress fotók betöltésekor:', error); }
  };

  const loadWeekWorkouts = async (date) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') return;
    
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    startOfWeek.setDate(date.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];
    
    setLoadingWorkouts(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/workouts/${currentUser.id}/week?startDate=${startStr}&endDate=${endStr}`, 
        { headers: getAuthHeaders(token) }
      );
      if (response.ok) {
        const data = await response.json();
        setWeekWorkouts(data.workouts || []);
      }
    } catch (error) { console.error(error); } 
    finally { setLoadingWorkouts(false); }
  };

  const loadAdminData = async (userId, token, options = {}) => {
    setAdminLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/admin/overview/${userId}`, {
        headers: getAuthHeaders(token)
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.users || []);
        setAdminMessages(data.messages || []);
      } else if (!options.silent) {
        showToast('Nem sikerült betölteni az admin adatokat.', 'error');
      }
    } catch (error) {
      console.error('Admin adatok betöltési hiba:', error);
      if (!options.silent) {
        showToast('Hálózati hiba az admin adatok betöltésekor.', 'error');
      }
    } finally {
      setAdminLoading(false);
    }
  };

  const loadUserMessages = async (userId, token, options = {}) => {
    setUserMessagesLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/messages/${userId}`, {
        headers: getAuthHeaders(token)
      });

      if (response.ok) {
        const data = await response.json();
        setUserMessages(data.messages || []);
      } else if (!options.silent) {
        showToast('Nem sikerült betölteni az üzeneteidet.', 'error');
      }
    } catch (error) {
      console.error('Felhasználói üzenetek betöltési hiba:', error);
      if (!options.silent) {
        showToast('Hálózati hiba az üzenetek betöltésekor.', 'error');
      }
    } finally {
      setUserMessagesLoading(false);
    }
  };

  const markUserMessagesAsRead = async (userId, token) => {
    if (!userId || !token) return;
    const seenAt = new Date().toISOString();
    const seenId = incomingUserMessages.reduce((maxId, message) => (
      message?.origin === 'admin' ? Math.max(maxId, Number(message.id) || 0) : maxId
    ), userMessagesSeenId || 0);

    persistStoredTimestamp(getUserMessageSeenStorageKey(userId), seenAt);
    persistStoredNumber(getUserMessageSeenIdStorageKey(userId), seenId);
    setUserMessagesSeenAt(seenAt);
    setUserMessagesSeenId(seenId);
    setUserMessages((prev) => prev.map((message) => (
      isUnreadForUser(message)
        ? { ...message, isUnreadForUser: false, userReadAt: seenAt }
        : message
    )));

    try {
      const response = await fetch(`http://localhost:5001/api/messages/${userId}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        }
      });

      if (!response.ok) return;
      loadUserMessages(userId, token, { silent: true });
    } catch (error) {
      console.error('Felhasználói üzenetek olvasottra jelölési hiba:', error);
    }
  };

  const markAdminMessagesAsRead = async (adminUserId, token) => {
    if (!adminUserId || !token) return;
    const seenAt = new Date().toISOString();
    const seenId = incomingAdminMessages.reduce((maxId, message) => Math.max(maxId, Number(message.id) || 0), adminMessagesSeenId || 0);

    persistStoredTimestamp(getAdminMessageSeenStorageKey(adminUserId), seenAt);
    persistStoredNumber(getAdminMessageSeenIdStorageKey(adminUserId), seenId);
    setAdminMessagesSeenAt(seenAt);
    setAdminMessagesSeenId(seenId);
    setAdminMessages((prev) => prev.map((message) => (
      isUnreadForAdmin(message)
        ? { ...message, isUnreadForAdmin: false, adminReadAt: seenAt }
        : message
    )));

    try {
      const response = await fetch('http://localhost:5001/api/admin/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({ adminUserId })
      });

      if (!response.ok) return;
      loadAdminData(adminUserId, token, { silent: true });
    } catch (error) {
      console.error('Admin üzenetek olvasottra jelölési hiba:', error);
    }
  };

  const handleAdminUserFieldChange = (userId, field, value) => {
    setSavedAdminUserIds((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
    setAdminUsers((prev) => prev.map((user) => (
      user.id === userId ? { ...user, [field]: value } : user
    )));
  };

  const handleAdminMessageReplyChange = (messageId, value) => {
    setAdminMessages((prev) => prev.map((message) => (
      message.id === messageId ? { ...message, adminReply: value } : message
    )));
  };

  const saveAdminUser = async (targetUserId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const selectedUser = adminUsers.find((user) => user.id === targetUserId);

    if (!currentUser.id || !selectedUser) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          fitnessGoal: selectedUser.fitnessGoal,
          role: selectedUser.role
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült menteni a felhasználót.', 'error');
        return;
      }

      if (currentUser.id === targetUserId) {
        const updatedCurrentUser = {
          ...currentUser,
          full_name: selectedUser.fullName,
          email: selectedUser.email,
          role: selectedUser.role,
          is_admin: selectedUser.role === 'admin'
        };
        localStorage.setItem('powerplan_current_user', JSON.stringify(updatedCurrentUser));
        setIsAdmin(selectedUser.role === 'admin');
      }

      setSavedAdminUserIds((prev) => ({ ...prev, [targetUserId]: true }));
      showToast('Felhasználó adatai elmentve.', 'success');
    } catch (error) {
      console.error('Admin user mentési hiba:', error);
      showToast('Hálózati hiba a felhasználó mentésekor.', 'error');
    }
  };

  const deleteAdminUser = async (targetUserId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const selectedUser = adminUsers.find((user) => user.id === targetUserId);

    if (!currentUser.id || !selectedUser) return;
    if ((selectedUser.role || 'user') === 'admin') {
      showToast('Admin felhasználó nem törölhető.', 'warning');
      return;
    }

    setDeletingAdminUserId(targetUserId);

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${targetUserId}?adminUserId=${currentUser.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült törölni a felhasználót.', 'error');
        return;
      }

      setAdminUsers((prev) => prev.filter((user) => user.id !== targetUserId));
      closeDeleteAdminUserModal();
      showToast('Felhasználó törölve.', 'success');
    } catch (error) {
      console.error('Admin user törlési hiba:', error);
      showToast('Hálózati hiba a felhasználó törlésekor.', 'error');
    } finally {
      setDeletingAdminUserId(null);
    }
  };

  const saveAdminReply = async (messageId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const selectedMessage = adminMessages.find((message) => message.id === messageId);

    if (!currentUser.id || !selectedMessage?.adminReply?.trim()) {
      showToast('Adj meg egy választ az üzenethez.', 'warning');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/messages/${messageId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          replyMessage: selectedMessage.adminReply
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült elmenteni a választ.', 'error');
        return;
      }

      setAdminMessages((prev) => prev.map((message) => (
        message.id === messageId
          ? { ...message, status: 'replied', repliedAt: new Date().toISOString() }
          : message
      )));
      showToast('Válasz elmentve.', 'success');
    } catch (error) {
      console.error('Admin reply mentési hiba:', error);
      showToast('Hálózati hiba a válasz mentésekor.', 'error');
    }
  };

  const sendAdminDirectMessage = async (targetUserId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const selectedUser = adminUsers.find((user) => user.id === targetUserId);
    const subject = String(selectedUser?.adminMessageSubject || '').trim();
    const message = String(selectedUser?.adminMessageDraft || '').trim();

    if (!currentUser.id || !selectedUser) return;

    if (!subject || !message) {
      showToast('Az admin üzenethez tárgy és szöveg is szükséges.', 'warning');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${targetUserId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          subject,
          message
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült elküldeni az admin üzenetet.', 'error');
        return;
      }

      setAdminUsers((prev) => prev.map((user) => (
        user.id === targetUserId
          ? { ...user, adminMessageSubject: '', adminMessageDraft: '' }
          : user
      )));
      setAdminActivePanel('messages');
      setAdminMessageTab('sent');
      showToast('Admin üzenet elküldve.', 'success');
      loadAdminData(currentUser.id, token);
    } catch (error) {
      console.error('Admin direct message hiba:', error);
      showToast('Hálózati hiba az admin üzenet küldésekor.', 'error');
    }
  };

  const sendUserMessage = async () => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const subject = String(userMessageForm.subject || '').trim();
    const message = String(userMessageForm.message || '').trim();

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban az üzenetküldés nem elérhető.', 'error');
      return;
    }

    if (!subject || !message) {
      showToast('A tárgy és az üzenet megadása kötelező.', 'warning');
      return;
    }

    setSendingUserMessage(true);

    try {
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({
          userId: currentUser.id,
          subject,
          message
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült elküldeni az üzenetet.', 'error');
        return;
      }

      setUserMessageForm({ subject: '', message: '' });
      showToast('Üzenet elküldve az adminnak.', 'success');
      loadUserMessages(currentUser.id, token);
      if (hasAdminAccess(currentUser)) {
        loadAdminData(currentUser.id, token);
      }
    } catch (error) {
      console.error('Felhasználói üzenetküldési hiba:', error);
      showToast('Hálózati hiba az üzenetküldéskor.', 'error');
    } finally {
      setSendingUserMessage(false);
    }
  };

  const deleteAdminMessage = async (messageId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id) return;

    setDeletingAdminMessageId(messageId);

    try {
      const response = await fetch(`http://localhost:5001/api/admin/messages/${messageId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({ adminUserId: currentUser.id })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült törölni az üzenetet.', 'error');
        return;
      }

      setAdminMessages((prev) => prev.filter((message) => message.id !== messageId));
      setUserMessages((prev) => prev.filter((message) => message.id !== messageId));
      showToast('Üzenet törölve.', 'success');
    } catch (error) {
      console.error('Admin üzenet törlési hiba:', error);
      showToast('Hálózati hiba az üzenet törlésekor.', 'error');
    } finally {
      setDeletingAdminMessageId(null);
    }
  };

  const deleteUserMessage = async (messageId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban az üzenettörlés nem elérhető.', 'error');
      return;
    }

    setDeletingUserMessageId(messageId);

    try {
      const response = await fetch(`http://localhost:5001/api/messages/${messageId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Nem sikerült törölni az üzenetet.', 'error');
        return;
      }

      setUserMessages((prev) => prev.filter((message) => message.id !== messageId));
      if (hasAdminAccess(currentUser)) {
        setAdminMessages((prev) => prev.filter((message) => message.id !== messageId));
      }
      showToast('Üzenet törölve.', 'success');
    } catch (error) {
      console.error('Felhasználói üzenet törlési hiba:', error);
      showToast('Hálózati hiba az üzenet törlésekor.', 'error');
    } finally {
      setDeletingUserMessageId(null);
    }
  };

  const calculateBadgesAndRecords = (workouts) => {
    const newBadges = [];
    const newAchievements = [];
    
    const weeklyWorkoutCount = workouts.length;
    if (weeklyWorkoutCount >= 5) {
      newBadges.push({ name: 'Edzésőrült', icon: 'fa-fire', color: '#e63946', description: 'Heti 5+ edzés teljesítve!' });
      newAchievements.push('🏆 Jelvény megszerezve: Edzésőrült (Heti 5+ edzés)');
    } else if (weeklyWorkoutCount >= 3) {
      newBadges.push({ name: 'Kitartó', emoji: '💪', color: '#2a9d8f', description: 'Heti 3+ edzés teljesítve!' });
      newAchievements.push('⭐ Jelvény megszerezve: Kitartó (Heti 3+ edzés)');
    }
    
    let maxBench = 0;
    let maxSquat = 0;
    let maxDeadlift = 0;
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        const maxWeight = Math.max(...(ex.sets?.map(s => parseFloat(s.weight) || 0) || [0]));
        
        if (ex.name?.includes('Fekvenyomás') && maxWeight > maxBench) {
          maxBench = maxWeight;
        }
        if (ex.name?.includes('Guggolás') && maxWeight > maxSquat) {
          maxSquat = maxWeight;
        }
        if (ex.name?.includes('Felhúzás') && maxWeight > maxDeadlift) {
          maxDeadlift = maxWeight;
        }
      });
    });

    if (maxBench > 0 || maxSquat > 0 || maxDeadlift > 0) {
      newBadges.push({ name: 'Rekorddöntő', icon: 'fa-chart-line', color: '#f4a261', description: 'Új rekord beállítva!' });
    }

    if (maxBench > 0) newAchievements.push(`🎉 Fekvenyomás rekord: ${maxBench} kg`);
    if (maxSquat > 0) newAchievements.push(`🎉 Guggolás rekord: ${maxSquat} kg`);
    if (maxDeadlift > 0) newAchievements.push(`🎉 Felhúzás rekord: ${maxDeadlift} kg`);
    
    setPersonalRecords({ benchPress: maxBench, squat: maxSquat, deadlift: maxDeadlift });
    setBadges(newBadges);
    setAchievements(newAchievements);
    
    const dayToIndex = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6
    };

    const scheduledWorkoutDays = new Set(
      workouts
        .map((workout) => dayToIndex[workout.day || workout.scheduled_day])
        .filter((dayIndex) => dayIndex !== undefined)
    );

    const now = new Date();
    const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

    let streak = 0;
    for (let dayIndex = todayIndex; dayIndex >= 0; dayIndex--) {
      if (!scheduledWorkoutDays.has(dayIndex)) {
        break;
      }
      streak++;
    }

    setWorkoutStreak(streak);
  };

  useEffect(() => {
    calculateBadgesAndRecords(workoutData.weeklyPlan || []);
  }, [workoutData.weeklyPlan]);

  useEffect(() => {
    if (currentSection === 'workout-plan') {
      loadWeekWorkouts(selectedDate);
    }
  }, [selectedDate, currentSection]);

  useEffect(() => {
    if (currentSection === 'nutrition' && nutritionWeekData.dailyTotals.length === 0) {
      loadNutritionWeek(nutritionSelectedDate);
    }
  }, [currentSection, nutritionSelectedDate, nutritionWeekData.dailyTotals.length]);

  useEffect(() => {
    if (currentSection !== 'nutrition') return;

    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (!currentUser?.id || currentUser.id === 'demo-999') {
      return;
    }

    const selectedDateKey = formatLocalDate(nutritionSelectedDate);
    const selectedWeekKey = formatLocalDate(getStartOfWeek(nutritionSelectedDate));
    if (findNutritionRecommendationWeek(nutritionRecommendationWeeks, selectedDateKey, selectedWeekKey).length > 0) {
      return;
    }

    loadDashboardData(currentUser.id, token, nutritionSelectedDate);
  }, [currentSection, nutritionSelectedDate, nutritionRecommendationWeeks]);

  // Profilkép feltöltés (adatbázisba)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await openProfileImageEditor(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleProfileImagePointerDown = (event) => {
    if (!profileImageDraft) return;

    profileImageDragStartRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: profileImageOffset.x,
      originY: profileImageOffset.y
    };
  };

  const handleProfileImageSave = async () => {
    if (!profileImageDraft || !profileImageDraftDimensions) return;

    setProfileImageSaving(true);
    try {
      const renderedImage = await renderProfileImageDataUrl(
        profileImageDraft,
        profileImageDraftDimensions,
        profileImageScale,
        profileImageOffset.x,
        profileImageOffset.y
      );

      const wasSaved = await persistProfileImage(renderedImage);
      if (wasSaved) {
        closeProfileImageEditor();
      }
    } catch (error) {
      console.error('Profilkép renderelési hiba:', error);
      showToast('Nem sikerült elmenteni a képet.', 'error');
    } finally {
      setProfileImageSaving(false);
    }
  };

  // Fejlődés fotó feltöltés
  const handleProgressPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto = {
        id: Date.now(),
        image: reader.result,
        date: new Date().toLocaleDateString('hu-HU'),
        note: '',
        isPhotoSaved: false,
        isNoteSaved: false
      };
      setProgressPhotos(prev => [newPhoto, ...prev]);
      showToast('Fotó feltöltve, mentsd külön a mentés gombbal!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Fotó mentése külön gombbal
  const saveProgressPhoto = async (photoId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem menthető!', 'error');
      return;
    }

    const photo = progressPhotos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      const response = await fetch('http://localhost:5001/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          imageBase64: photo.image,
          note: photo.note || null,
          recordDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Frissítjük a fotót, hogy mentett legyen és új ID-t kapjon
        const updatedPhotos = progressPhotos.map(p =>
          p.id === photoId ? { ...p, id: data.id, isPhotoSaved: true, isNoteSaved: true } : p
        );
        setProgressPhotos(updatedPhotos);
        showToast('Fotó sikeresen mentve az adatbázisba!', 'success');
      } else {
        showToast('Hiba a fotó mentésekor!', 'error');
      }
    } catch (error) {
      console.error('API hiba:', error);
      showToast('Hálózati hiba!', 'error');
    }
  };

  // Megjegyzés módosítása (késői mentéshez)
  const updateProgressNote = (photoId, note) => {
    const updatedPhotos = progressPhotos.map(photo =>
      photo.id === photoId ? { ...photo, note, isNoteSaved: false } : photo
    );
    setProgressPhotos(updatedPhotos);
  };

  // Megjegyzés mentése külön gombbal
  const saveProgressNote = async (photoId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem menthető!', 'error');
      return;
    }

    const photo = progressPhotos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      const response = await fetch(`http://localhost:5001/api/progress/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: photo.note || null
        })
      });

      if (response.ok) {
        const updatedPhotos = progressPhotos.map(p =>
          p.id === photoId ? { ...p, isNoteSaved: true } : p
        );
        setProgressPhotos(updatedPhotos);
        showToast('Megjegyzés elmentve!', 'success');
      } else {
        showToast('Hiba a megjegyzés mentésekor!', 'error');
      }
    } catch (error) {
      console.error('API hiba:', error);
      showToast('Hálózati hiba!', 'error');
    }
  };

  // Fejlődés fotó törlése
  const openDeleteProgressPhotoModal = (photo) => {
    setProgressPhotoToDelete(photo);
    setShowDeleteProgressPhotoModal(true);
  };

  const closeDeleteProgressPhotoModal = () => {
    setProgressPhotoToDelete(null);
    setShowDeleteProgressPhotoModal(false);
  };

  const deleteProgressPhoto = async (photoId) => {
    const token = localStorage.getItem('powerplan_token');

    if (progressPhotos.find(p => p.id === photoId)?.isPhotoSaved) {
      try {
        const response = await fetch(`http://localhost:5001/api/progress/${photoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          showToast('Hiba a fotó törlésekor!', 'error');
          return;
        }
      } catch (error) {
        console.error('API hiba:', error);
        showToast('Hálózati hiba!', 'error');
        return;
      }
    }

    const updatedPhotos = progressPhotos.filter(photo => photo.id !== photoId);
    setProgressPhotos(updatedPhotos);
    closeDeleteProgressPhotoModal();
    showToast('Fotó sikeresen törölve!', 'success');
  };

  // Profil mentés (backend)
  const handleProfileSave = async () => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem menthető!', 'error');
      return;
    }
    try {
      const formattedHeight = normalizeNumberInput(editFormData.height);
      const formattedWeight = normalizeNumberInput(editFormData.weight);
      const formattedBirthDate = formatDateForInput(editFormData.birthDate);

      if (!Number.isFinite(formattedWeight) || formattedWeight < MIN_REALISTIC_WEIGHT_KG || formattedWeight > MAX_REALISTIC_WEIGHT_KG) {
        showToast(`A testsúlynak ${MIN_REALISTIC_WEIGHT_KG} és ${MAX_REALISTIC_WEIGHT_KG} kg között kell lennie.`, 'warning');
        return;
      }

      const response = await fetch('http://localhost:5001/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName: editFormData.fullName,
          email: editFormData.email,
          height: formattedHeight,
          weight: formattedWeight,
          birthDate: formattedBirthDate
        })
      });
      if (response.ok) {
        const parsedEditedName = parseFullNameParts(editFormData.fullName);
        showToast('Profil frissítve!', 'success');
        setIsProfileSaved(true);
        setEditingProfile(false);
        const savedUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
        savedUser.full_name = editFormData.fullName;
        savedUser.email = editFormData.email;
        localStorage.setItem('powerplan_current_user', JSON.stringify(savedUser));
        setUserData(prev => ({
          ...prev,
          email: editFormData.email,
          personalInfo: {
            ...prev.personalInfo,
            firstName: parsedEditedName.firstName,
            lastName: parsedEditedName.lastName,
            height: editFormData.height,
            weight: editFormData.weight,
            birthDate: editFormData.birthDate
          }
        }));
        const savedQuestionnaire = JSON.parse(localStorage.getItem('powerplan_questionnaire') || '{}');
        const updatedQuestionnaire = {
          ...savedQuestionnaire,
          email: editFormData.email,
          personalInfo: {
            ...(savedQuestionnaire.personalInfo || {}),
            firstName: parsedEditedName.firstName,
            lastName: parsedEditedName.lastName,
            height: editFormData.height,
            weight: editFormData.weight,
            startingWeight: savedQuestionnaire.personalInfo?.startingWeight ?? savedQuestionnaire.personalInfo?.weight ?? '',
            birthDate: editFormData.birthDate
          }
        };
        localStorage.setItem('powerplan_questionnaire', JSON.stringify(updatedQuestionnaire));
        // Frissítjük a dashboard adatokat, hogy az új súlynapló megjelenjen a grafikonon
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
      } else {
        showToast('Hiba a mentéskor!', 'error');
      }
    } catch (error) {
      showToast('Hálózati hiba!', 'error');
    }
  };

  const handlePasswordChange = async () => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem módosítható a jelszó!', 'error');
      return;
    }

    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      showToast('Minden jelszó mező kitöltése kötelező!', 'warning');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      showToast('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!', 'warning');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showToast('Az új jelszó és a megerősítés nem egyezik!', 'warning');
      return;
    }

    setSavingPasswordChange(true);
    try {
      const response = await fetch('http://localhost:5001/api/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showToast(data.error || 'Nem sikerült módosítani a jelszót.', 'error');
        return;
      }

      showToast(data.message || 'Jelszó sikeresen frissítve!', 'success');
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast('Hálózati hiba a jelszó módosításakor!', 'error');
    } finally {
      setSavingPasswordChange(false);
    }
  };

  const handleProfileFieldChange = (field, value) => {
    setIsProfileSaved(false);
    setEditFormData((previousValue) => ({
      ...previousValue,
      [field]: value
    }));
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordFormData((previousValue) => ({
      ...previousValue,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((previousValue) => ({
      ...previousValue,
      [field]: !previousValue[field]
    }));
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return '-';
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleFoodSelection = (value) => {
    if (!value) {
      setSelectedFood(null);
      return;
    }

    const selectedOption = FLAT_FOOD_OPTIONS.find((food) => food.value === value);
    if (!selectedOption) {
      setSelectedFood(null);
      return;
    }

    setSelectedFood(selectedOption);
    setMealGrams(String(selectedOption.calorieBasisGrams || 100));
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban az adat mentése nem elérhető.', 'error');
      return;
    }

    if (!selectedFood) {
      showToast('Válassz ki egy ételt a listából.', 'warning');
      return;
    }

    if (parsedMealGrams === null || Number.isNaN(parsedMealGrams) || parsedMealGrams <= 0) {
      showToast('Adj meg egy ervenyes gramm mennyiseget.', 'warning');
      return;
    }

    const mealData = {
      userId: currentUser.id, 
      mealType: selectedMealType,
      foodName: selectedFood.name,
      description: '',
      calories: calculatedMealCalories,
      consumedDate: formatLocalDate(nutritionSelectedDate)
    };

    try {
      const response = await fetch('http://localhost:5001/api/meals', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(mealData) 
      });
      if (response.ok) {
        showToast('Étkezés naplózva!', 'success');
        closeModal(); 
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
        loadNutritionWeek(nutritionSelectedDate);
        setSelectedFood(null);
        setMealSearchQuery('');
        setMealGrams('100');
        setSelectedMealType('');
        setSelectedFoodCategory('');
        document.getElementById('mealLogForm')?.reset();
      }
    } catch (error) { 
      showToast('Hiba a mentéskor!', 'error');
    }
  };

  const handleAddRecommendedMeal = async (meal) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban az adat mentése nem elérhető.', 'error');
      return;
    }

    const mealType = String(meal?.meal_type || '').trim();
    const foodName = String(meal?.name || '').trim();
    const calories = Number(meal?.calories || 0);

    if (!mealType || !foodName || calories <= 0) {
      showToast('Az ajánlott étel adatai hiányosak, nem menthető.', 'error');
      return;
    }

    const targetDate = meal?.recommendationDate
      ? new Date(`${meal.recommendationDate}T12:00:00`)
      : new Date(nutritionSelectedDate);
    const requestKey = `${meal?.recommendationDate || nutritionData.recommendationDate}-${mealType}-${foodName}`;

    setSavingRecommendedMealKey(requestKey);

    try {
      const response = await fetch('http://localhost:5001/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: currentUser.id,
          mealType,
          foodName,
          description: meal.description || 'Ajánlott napi étrendből hozzáadva.',
          calories,
          consumedDate: formatLocalDate(targetDate)
        })
      });

      if (!response.ok) {
        let errorMessage = 'Nem sikerült az ajánlott ételt hozzáadni.';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
        }
        showToast(errorMessage, 'error');
        return;
      }

      setNutritionSelectedDate(targetDate);
      showToast(`${foodName} hozzáadva az étkezéseidhez.`, 'success');
      loadDashboardData(currentUser.id, token, targetDate);
      loadNutritionWeek(targetDate);
    } catch (error) {
      console.error('Recommended meal save error:', error);
      showToast('Hálózati hiba az ajánlott étel mentésekor.', 'error');
    } finally {
      setSavingRecommendedMealKey('');
    }
  };

  const setNutritionRecommendationDate = async (nextDateInput) => {
    const nextDate = nextDateInput instanceof Date ? new Date(nextDateInput) : new Date(nextDateInput);
    if (Number.isNaN(nextDate.getTime())) {
      return;
    }

    const token = localStorage.getItem('powerplan_token');
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const nextDateKey = formatLocalDate(nextDate);
    const nextWeekKey = formatLocalDate(getStartOfWeek(nextDate));
    const hasCachedWeek = findNutritionRecommendationWeek(nutritionRecommendationWeeks, nextDateKey, nextWeekKey).length > 0;

    if (!hasCachedWeek && currentSection === 'nutrition' && currentUser?.id && currentUser.id !== 'demo-999') {
      await loadDashboardData(currentUser.id, token, nextDate);
    }

    await loadNutritionWeek(nextDate);
    flushSync(() => {
      setNutritionSelectedDate(nextDate);
    });
  };

  const shiftNutritionRecommendationWeek = (weekOffset) => {
    const currentWeekStart = getStartOfWeek(nutritionSelectedDate);
    const currentDay = new Date(nutritionSelectedDate);
    const weekdayIndex = currentDay.getDay() === 0 ? 6 : currentDay.getDay() - 1;
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(currentWeekStart.getDate() + (weekOffset * 7) + weekdayIndex);
    nextDate.setHours(12, 0, 0, 0);
    setNutritionRecommendationDate(nextDate);
  };

  const goToCurrentNutritionRecommendationWeek = () => {
    setNutritionRecommendationDate(new Date());
  };

  const openDeleteMealModal = (meal) => {
    setMealToDelete(meal);
    setShowDeleteMealModal(true);
  };

  const openDeleteAdminUserModal = (user) => {
    setAdminUserToDelete(user);
    setShowDeleteAdminUserModal(true);
  };

  const closeDeleteAdminUserModal = () => {
    setAdminUserToDelete(null);
    setShowDeleteAdminUserModal(false);
  };

  const closeDeleteMealModal = () => {
    setMealToDelete(null);
    setShowDeleteMealModal(false);
  };

  const openDeleteWorkoutModal = (workout) => {
    setWorkoutToDelete(workout);
    setShowDeleteWorkoutModal(true);
  };

  const closeDeleteWorkoutModal = () => {
    setWorkoutToDelete(null);
    setShowDeleteWorkoutModal(false);
  };

  const deleteMeal = async (mealId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem törölhetsz!', 'error');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/meals/${mealId}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Étkezés törölve!', 'success');
        closeDeleteMealModal();
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
        loadNutritionWeek(nutritionSelectedDate);
      } else {
        showToast('Hiba a törléskor!', 'error');
      }
    } catch (error) {
      showToast('Hálózati hiba!', 'error');
    }
  };

  const deleteWorkout = async (workoutId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem törölhetsz!', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/workouts/${workoutId}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('Edzés törölve!', 'success');
        closeDeleteWorkoutModal();
        closeModal();
        closeWorkoutDetailsModal();
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
        loadWeekWorkouts(selectedDate);
      } else {
        showToast('Hiba a törlés során.', 'error');
      }
    } catch (error) {
      showToast('Hálózati hiba!', 'error');
    }
  };

  const undoRecommendedWorkoutForToday = async (workoutId) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban nem módosíthatod ezt az edzést.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/workouts/${workoutId}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        showToast('Nem sikerült visszavonni a generált edzést.', 'error');
        return;
      }

      showToast('A generált edzés visszavonva.', 'success');
      loadDashboardData(currentUser.id, token, nutritionSelectedDate);
      loadWeekWorkouts(selectedDate);
    } catch (error) {
      console.error('Recommended workout undo error:', error);
      showToast('Hálózati hiba a visszavonáskor.', 'error');
    }
  };

  // GYAKORLATKEZELŐ FÜGGVÉNYEK (ezek hiányoztak korábban!)
  const handleAddExerciseBlock = () => {
    setExercisesList([...exercisesList, { id: Date.now(), muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
  };

  const handleRemoveExerciseBlock = (id) => {
    setExercisesList(exercisesList.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id, field, value) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === id) {
        if (field === 'muscleGroup') return { ...ex, muscleGroup: value, name: '' };
        return { ...ex, [field]: value };
      }
      return ex;
    }));
  };

  const handleAddSet = (exerciseId) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) { 
        return { ...ex, sets: [...ex.sets, { weight: '', reps: '', rpe: '' }] }; 
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId, setIndex) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) { 
        return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }; 
      }
      return ex;
    }));
  };

  const handleSetChange = (exerciseId, setIndex, field, value) => {
    setExercisesList(exercisesList.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex][field] = value;
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const saveRecommendedWorkoutForToday = async (workout) => {
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    const requestKey = `${workout.day}-${workout.title}`;

    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban a mintaedzésterv nem menthető.', 'error');
      return;
    }

    setSavingRecommendedWorkoutKey(requestKey);

    try {
      const today = new Date();
      const payload = {
        userId: currentUser.id,
        name: `${workout.title} (minta)`,
        workoutType: serializeWorkoutTypeValue(workout.workoutType),
        scheduledDay: getTodayWorkoutDayKey(today),
        exercises: (workout.exercises || []).map((exercise, index) => {
          const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
          const prescription = typeof exercise === 'string' ? '' : exercise.prescription;

          return {
            id: Date.now() + index,
            muscleGroup: getRecommendedExerciseMuscleGroup(exerciseName, workout.workoutType),
            name: exerciseName,
            sortOrder: index,
            sets: getSetsFromPrescription(prescription, workout.workoutType)
          };
        })
      };

      const response = await fetch('http://localhost:5001/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Nem sikerült a mintaedzéstervet a mai napra menteni.';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
        }
        showToast(errorMessage, 'error');
        return;
      }

      setSelectedDate(today);
      showToast('A mintaedzésterv a mai napra bekerült az edzéseid közé.', 'success');
      loadDashboardData(currentUser.id, token, nutritionSelectedDate);
      loadWeekWorkouts(today);
    } catch (error) {
      console.error('Recommended workout save error:', error);
      showToast('Hálózati hiba az ajánlott edzés mentésekor.', 'error');
    } finally {
      setSavingRecommendedWorkoutKey('');
    }
  };

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
    const token = localStorage.getItem('powerplan_token');
    
    if (!currentUser.id || currentUser.id === 'demo-999') {
      showToast('Demó módban a mentés nem elérhető!', 'error');
      return;
    }
    if (!workoutFormDetails.type) {
      showToast('Kérlek válassz edzés típust!', 'warning');
      return;
    }
    
    const isValid = exercisesList.every(ex => ex.muscleGroup && ex.name && ex.sets.length > 0);
    if (!isValid) {
      showToast('Kérlek válassz izomcsoportot és gyakorlatot minden blokkban!', 'warning');
      return;
    }

    const payload = {
      userId: currentUser.id,
      name: workoutFormDetails.name,
      workoutType: serializeWorkoutTypeValue(workoutFormDetails.type),
      scheduledDay: workoutFormDetails.day,
      exercises: exercisesList
    };

    try {
      let url = 'http://localhost:5001/api/workouts';
      let method = 'POST';
      if (editingWorkoutId) {
        url = `http://localhost:5001/api/workouts/${editingWorkoutId}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method: method, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast(editingWorkoutId ? 'Edzés frissítve!' : 'Edzésterv elmentve!', 'success');
        closeModal();
        setEditingWorkoutId(null);
        loadDashboardData(currentUser.id, token, nutritionSelectedDate);
        loadWeekWorkouts(selectedDate);
        setWorkoutFormDetails({ name: '', type: '', day: '' });
        setExercisesList([{ id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
      } else {
        let errorMessage = 'Hiba a mentés során.';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
        }
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Workout save network error:', error);
      showToast('Hálózati hiba a mentéskor. Ellenőrizd, hogy fut-e a backend a 5001-es porton.', 'error');
    }
  };

  const getWorkoutsForDay = (dayOfWeek) => {
    const targetDay = WORKOUT_DAY_KEYS[dayOfWeek];
    return weekWorkouts.filter(w => w.scheduled_day === targetDay);
  };

  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetailsModal(true);
  };

  const closeWorkoutDetailsModal = () => {
    setShowWorkoutDetailsModal(false);
    setSelectedWorkout(null);
  };

  const startEditWorkout = () => {
    if (!selectedWorkout) return;
    setWorkoutFormDetails({
      name: selectedWorkout.name,
      type: normalizeWorkoutTypeValue(selectedWorkout.workout_type),
      day: selectedWorkout.scheduled_day
    });
    const exercises = selectedWorkout.exercises.map((ex, idx) => ({
      id: idx + 1,
      muscleGroup: ex.muscleGroup || ex.muscle || '',
      name: ex.name,
      sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, rpe: s.rpe || '' }))
    }));
    setExercisesList(exercises);
    setEditingWorkoutId(selectedWorkout.id);
    setShowWorkoutDetailsModal(false);
    setModalOpen('workoutLog');
  };

  const navigateToSection = (section) => { 
    setCurrentSection(section); 
    if (window.innerWidth <= 992) setSidebarActive(false);
    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (section === 'profile') {
      if (currentUser && currentUser.id && token && currentUser.id !== 'demo-999') {
        loadUserData(currentUser.id, token);
        loadProfileImage(currentUser.id, token);
      }
    }
    if (section === 'messages') {
      if (currentUser && currentUser.id && token && currentUser.id !== 'demo-999') {
        loadUserMessages(currentUser.id, token);
      }
    }
    if (section === 'admin') {
      if (currentUser && currentUser.id && token && currentUser.id !== 'demo-999' && hasAdminAccess(currentUser)) {
        loadAdminData(currentUser.id, token);
      }
    }
  };
  
  const updateDateTime = () => {
    const now = new Date();
    const el = document.getElementById('currentDateTime');
    if (el) el.textContent = now.toLocaleDateString('hu-HU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(() => {
      updateDateTime();

      const nextDayKey = formatLocalDate(new Date());
      if (nextDayKey !== currentDayKey) {
        const previousDayKey = currentDayKey;
        setCurrentDayKey(nextDayKey);

        const token = localStorage.getItem('powerplan_token');
        const savedUser = localStorage.getItem('powerplan_current_user');
        const currentUser = savedUser ? JSON.parse(savedUser) : null;

        if (currentUser && currentUser.id && token && currentUser.id !== 'demo-999') {
          loadDashboardData(currentUser.id, token);
          loadNutritionWeek(new Date());
        }

        setNutritionSelectedDate((previousDate) => (
          formatLocalDate(previousDate) === previousDayKey ? new Date() : previousDate
        ));
      }
    }, 1000);
    let timer;
    if (workoutActive) timer = setInterval(() => setWorkoutTime(prev => prev + 1), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [workoutActive, currentDayKey]);

  useEffect(() => {
    const storedUser = getStoredCurrentUser();

    if (!storedUser?.id) return;

    setUserMessagesSeenAt(readStoredTimestamp(getUserMessageSeenStorageKey(storedUser.id)));
    setAdminMessagesSeenAt(readStoredTimestamp(getAdminMessageSeenStorageKey(storedUser.id)));
    setUserMessagesSeenId(readStoredNumber(getUserMessageSeenIdStorageKey(storedUser.id)));
    setAdminMessagesSeenId(readStoredNumber(getAdminMessageSeenIdStorageKey(storedUser.id)));
  }, [isAdmin]);

  useEffect(() => {
    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (!currentUser?.id || !token || currentUser.id === 'demo-999') {
      return undefined;
    }

    const interval = setInterval(() => {
      const isUserMessagesOpen = currentSection === 'messages';
      const isAdminMessagesOpen = currentSection === 'admin' && adminActivePanel === 'messages';

      if (isUserMessagesOpen || isAdminMessagesOpen) {
        return;
      }

      loadUserMessages(currentUser.id, token, { silent: true });
      if (hasAdminAccess(currentUser)) {
        loadAdminData(currentUser.id, token, { silent: true });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isAdmin, currentSection, adminActivePanel]);

  useEffect(() => {
    if (currentSection !== 'messages' || userMessageTab !== 'incoming' || unreadUserMessagesCount === 0) {
      return undefined;
    }

    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (!currentUser?.id || !token) {
      return undefined;
    }

    markUserMessagesAsRead(currentUser.id, token);
    return undefined;
  }, [currentSection, userMessageTab, unreadUserMessagesCount]);

  useEffect(() => {
    if (currentSection !== 'admin' || adminActivePanel !== 'messages' || adminMessageTab !== 'incoming' || unreadAdminMessagesCount === 0) {
      return undefined;
    }

    const token = localStorage.getItem('powerplan_token');
    const savedUser = localStorage.getItem('powerplan_current_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (!currentUser?.id || !token || !hasAdminAccess(currentUser)) {
      return undefined;
    }

    markAdminMessagesAsRead(currentUser.id, token);
    return undefined;
  }, [currentSection, adminActivePanel, adminMessageTab, unreadAdminMessagesCount]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60); 
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleWorkout = () => setWorkoutActive(!workoutActive);
  const stopWorkout = () => { 
    setWorkoutActive(false); 
    setWorkoutTime(0); 
    showToast('Edzés befejezve!', 'success');
  };
  const toggleSidebar = () => setSidebarActive(!sidebarActive);
  const closeModal = () => { 
    setModalOpen(null); 
    setSelectedFood(null);
    setMealSearchQuery('');
    setMealGrams('100');
    setSelectedMealType('');
    setSelectedFoodCategory('');
    setEditingWorkoutId(null);
    setWorkoutFormDetails({ name: '', type: '', day: '' });
    setExercisesList([{ id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
  };
  const showMealLogModal = () => {
    setSelectedFood(null);
    setMealSearchQuery('');
    setMealGrams('100');
    setSelectedMealType('');
    setSelectedFoodCategory('');
    setModalOpen('mealLog');
  };
  const showWorkoutModal = () => {
    setEditingWorkoutId(null);
    setWorkoutFormDetails({ name: '', type: '', day: '' });
    setExercisesList([{ id: 1, muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
    setModalOpen('workoutLog');
  };
  const logout = () => { 
    if (requestLogout) requestLogout();
    else if (handleLogout) handleLogout();
    else if (navigateTo) navigateTo('home');
  };

  const initialQuestionnaireWeight = startingWeight ? parseFloat(startingWeight) : 0;
  const weightHistoryData = weightHistory.length > 0 ? weightHistory : [];
  const sanitizedWeightHistory = weightHistoryData
    .map((item) => ({
      dateKey: formatLocalDate(item.date),
      timestamp: new Date(item.date).getTime(),
      label: new Date(item.date).toLocaleDateString('hu-HU'),
      value: parseFloat(item.weight)
    }))
    .filter((item) => Number.isFinite(item.value) && Number.isFinite(item.timestamp))
    .sort((left, right) => left.timestamp - right.timestamp);

  const historicalWeightEntries = [...sanitizedWeightHistory];
  if (
    historicalWeightEntries.length > 0 &&
    Number.isFinite(initialQuestionnaireWeight) &&
    historicalWeightEntries[0].value === initialQuestionnaireWeight
  ) {
    historicalWeightEntries.shift();
  }

  const weightChartEntries = [
    ...(Number.isFinite(initialQuestionnaireWeight) && initialQuestionnaireWeight > 0
      ? [{ label: 'Indulás', value: initialQuestionnaireWeight }]
      : []),
    ...historicalWeightEntries.map((item) => ({ label: item.label, value: item.value }))
  ];
  const chartStartingWeight = Number.isFinite(initialQuestionnaireWeight) && initialQuestionnaireWeight > 0
    ? initialQuestionnaireWeight
    : historicalWeightEntries[0]?.value;
  const weightChartLabels = weightChartEntries.map((item) => item.label);
  const weightChartValues = weightChartEntries.map((item) => item.value);
  const latestChartWeight = weightChartValues[weightChartValues.length - 1] || chartStartingWeight || initialQuestionnaireWeight;
  const weightAxisBounds = getWeightAxisBounds(weightChartValues, latestChartWeight);

  const weightChartData = {
    labels: weightChartLabels,
    datasets: [{ 
      label: 'Testsúly (kg)', 
      data: weightChartValues,
      borderColor: '#e63946', 
      backgroundColor: 'rgba(230, 57, 70, 0.1)', 
      fill: true, 
      tension: 0.4 
    }]
  };

  const workoutDayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const workoutsByDay = workoutDayOrder.map((day) =>
    (workoutData.weeklyPlan || []).filter((workout) => (workout.day || workout.scheduled_day) === day)
  );
  const workoutFrequency = workoutDayOrder.map((day) =>
    (workoutData.weeklyPlan || []).filter((workout) => (workout.day || workout.scheduled_day) === day).length
  );

  const workoutChartData = {
    labels: ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'],
    datasets: [{ 
      label: 'Edzések száma',
      data: workoutFrequency,
      backgroundColor: '#e63946',
      borderRadius: 10,
      maxBarThickness: 38
    }]
  };
  
  const chartOptions = { 
    responsive: true, 
    plugins: { legend: { display: false } }, 
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1
        }
      }
    }
  };

  const weightChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: false,
        min: weightAxisBounds.min,
        max: weightAxisBounds.max,
        ticks: {
          stepSize: WEIGHT_CHART_STEP_KG
        }
      }
    }
  };

  const workoutChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            const dayWorkouts = workoutsByDay[context.dataIndex] || [];
            if (dayWorkouts.length === 0) {
              return 'Nincs edzés';
            }
            return dayWorkouts.map((workout) => workout.name || 'Névtelen edzés');
          }
        }
      }
    }
  };

  const localTodayKey = formatLocalDate(new Date());
  const normalizedExerciseSearchQuery = normalizeSearchText(exerciseSearchQuery.trim());
  const filteredExerciseCategories = Object.entries(EXERCISE_DB_WITH_VIDEOS)
    .map(([categoryName, exercises]) => ({
      categoryName,
      exercises: normalizedExerciseSearchQuery
        ? exercises.filter((exercise) => (
            normalizeSearchText(categoryName).includes(normalizedExerciseSearchQuery)
            || normalizeSearchText(exercise.name).includes(normalizedExerciseSearchQuery)
          ))
        : exercises
    }))
    .filter(({ exercises }) => exercises.length > 0);

  const localTodayMeals = (nutritionWeekData.meals || []).filter((meal) => meal.consumedDate === localTodayKey);
  const totalCaloriesToday = localTodayMeals.length > 0
    ? localTodayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
    : (nutritionData.todayMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0);
  const calorieGoal = nutritionData.calorieTarget || 2500;
  const calorieProgress = (totalCaloriesToday / calorieGoal) * 100;
  const isViewingTodayNutrition = isSameDay(nutritionSelectedDate, new Date());
  const selectedNutritionDateKey = formatLocalDate(nutritionSelectedDate);
  const weeklyNutritionRecommendations = nutritionData.weeklyRecommendations || [];
  const completedRecommendedWorkoutMap = weekWorkouts
    .filter((workout) => (workout.name || '').includes('(minta)'))
    .reduce((accumulator, workout) => {
      const key = `${serializeWorkoutTypeValue(workout.workout_type)}::${normalizeSearchText(stripRecommendedWorkoutSuffix(workout.name))}`;
      accumulator[key] = workout;
      return accumulator;
    }, {});
  const selectedNutritionMeals = (nutritionWeekData.meals || []).filter((meal) => meal.consumedDate === selectedNutritionDateKey);
  const selectedNutritionCalories = selectedNutritionMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const displayedCalories = isViewingTodayNutrition ? totalCaloriesToday : selectedNutritionCalories;
  const displayedCalorieProgress = (displayedCalories / calorieGoal) * 100;
  const nutritionWeekStart = getStartOfWeek(nutritionSelectedDate);
  const selectedNutritionWeekKey = formatLocalDate(nutritionWeekStart);
  const cachedSelectedWeekRecommendations = findNutritionRecommendationWeek(
    nutritionRecommendationWeeks,
    selectedNutritionDateKey,
    selectedNutritionWeekKey
  );
  const selectedWeekRecommendations = cachedSelectedWeekRecommendations.length > 0
    ? cachedSelectedWeekRecommendations
    : (selectedNutritionWeekKey === formatLocalDate(getStartOfWeek(nutritionData.recommendationDate))
      ? (weeklyNutritionRecommendations || [])
      : []);
  const nutritionRecommendationPreviewDays = Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(nutritionWeekStart);
    currentDate.setDate(nutritionWeekStart.getDate() + index);
    const currentDateKey = formatLocalDate(currentDate);
    const matchingRecommendation = selectedWeekRecommendations.find((day) => day.recommendationDate === currentDateKey);
    const shouldUseSelectedDayFallback = nutritionData.recommendationDate === currentDateKey;

    return buildNutritionRecommendationDay({
      date: currentDate,
      dayPlan: matchingRecommendation,
      fallbackRecommendations: shouldUseSelectedDayFallback ? normalizeRecommendationMeals(nutritionData.recommendations || []) : [],
      fallbackCalorieTarget: shouldUseSelectedDayFallback ? (nutritionData.calorieTarget || 0) : 0,
      fallbackNote: shouldUseSelectedDayFallback ? (nutritionData.recommendationNote || '') : '',
      isLoading: nutritionRecommendationLoading
    });
  });
  const activeRecommendationDay = nutritionRecommendationPreviewDays.find((day) => day.recommendationDate === selectedNutritionDateKey)
    || nutritionRecommendationPreviewDays[0]
    || buildNutritionRecommendationDay({
      date: nutritionSelectedDate,
      fallbackRecommendations: normalizeRecommendationMeals(nutritionData.recommendations || []),
      fallbackCalorieTarget: nutritionData.calorieTarget || 0,
      fallbackNote: nutritionData.recommendationNote || '',
      isLoading: nutritionRecommendationLoading
    });
  const nutritionDailyTotals = Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(nutritionWeekStart);
    currentDate.setDate(nutritionWeekStart.getDate() + index);
    const currentDateKey = formatLocalDate(currentDate);
    const existingEntry = (nutritionWeekData.dailyTotals || []).find((day) => day.date === currentDateKey);
    const mealsForDay = (nutritionWeekData.meals || []).filter((meal) => meal.consumedDate === currentDateKey);
    const totalForDay = currentDateKey === localTodayKey
      ? totalCaloriesToday
      : (existingEntry?.totalCalories || mealsForDay.reduce((sum, meal) => sum + (meal.calories || 0), 0));

    return {
      date: currentDateKey,
      totalCalories: totalForDay,
      label: currentDate.toLocaleDateString('hu-HU', { weekday: 'short', day: 'numeric' }),
      fullDateLabel: formatHungarianLongDate(currentDate),
      meals: mealsForDay
    };
  });

  const weeklyCalories = nutritionDailyTotals.reduce((sum, day) => sum + day.totalCalories, 0);
  const averageDailyCalories = Math.round(weeklyCalories / nutritionDailyTotals.length);
  const highestCalorieDay = nutritionDailyTotals.reduce(
    (bestDay, currentDay) => currentDay.totalCalories > bestDay.totalCalories ? currentDay : bestDay,
    nutritionDailyTotals[0] || { label: '-', totalCalories: 0 }
  );
  const remainingCalories = Math.max(calorieGoal - displayedCalories, 0);
  const radarMaxCalories = Math.max(calorieGoal, ...nutritionDailyTotals.map((day) => day.totalCalories), 500);
  const profileImageEditorMetrics = profileImageDraftDimensions ? getProfileEditorMetrics(profileImageDraftDimensions, profileImageScale) : null;
  const profileImageOffsetLimits = {
    x: Math.ceil(profileImageEditorMetrics?.maxOffsetX || 0),
    y: Math.ceil(profileImageEditorMetrics?.maxOffsetY || 0)
  };

  const nutritionChartData = {
    labels: nutritionDailyTotals.map((day) => day.label),
    datasets: [{
      label: 'Heti kalóriabevitel (kcal)',
      data: nutritionDailyTotals.map((day) => day.totalCalories),
      borderColor: '#e63946',
      backgroundColor: 'rgba(230, 57, 70, 0.22)',
      fill: true,
      pointBackgroundColor: '#e63946',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    }]
  };

  const nutritionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const dayData = nutritionDailyTotals[tooltipItems[0]?.dataIndex] || null;
            return dayData?.fullDateLabel || tooltipItems[0]?.label || '';
          },
          label: (context) => `Összesen: ${context.raw || 0} kcal`,
          afterLabel: (context) => {
            const dayData = nutritionDailyTotals[context.dataIndex] || null;
            if (!dayData || !dayData.meals || dayData.meals.length === 0) {
              return 'Nincs naplózott étkezés';
            }

            return dayData.meals.map((meal) => `${meal.name}: ${meal.calories} kcal`);
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: radarMaxCalories,
        ticks: {
          display: false,
          stepSize: Math.max(100, Math.ceil(radarMaxCalories / 5 / 50) * 50)
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        pointLabels: {
          color: '#b8b8c9',
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    }
  };

  const sectionTitles = {
    'dashboard': { icon: 'fa-home', text: 'Dashboard', subtitle: 'Üdvözöljük!' },
    'workout-plan': { icon: 'fa-dumbbell', text: 'Edzésterv', subtitle: 'Heti edzésterv' },
    'fejlodes': { icon: 'fa-camera', text: 'Fejlődés', subtitle: 'Testfotók és megjegyzések' },
    'nutrition': { icon: 'fa-utensils', text: 'Táplálkozás', subtitle: 'Kalóriakövetés' },
    'gyms': { icon: 'fa-map-marker-alt', text: 'Edzőtermek', subtitle: 'Közeli termek' },
    'exercises': { icon: 'fa-video', text: 'Gyakorlatok', subtitle: 'Oktatóvideók' },
    'badges': { icon: 'fa-trophy', text: 'Jelvények' },
    'workout-mode': { icon: 'fa-play-circle', text: 'Stopper', subtitle: 'Aktív edzés' },
    'messages': { icon: 'fa-envelope', text: 'Üzeneteim', subtitle: 'Admin válaszok és üzenetküldés' },
    'profile': { icon: 'fa-user-circle', text: 'Profil', subtitle: 'Személyes adatok' }
  };
  const navigationSections = ['dashboard', 'workout-plan', 'exercises', 'gyms', 'nutrition', 'fejlodes', 'badges', 'workout-mode', 'messages', 'profile'];
  const greetingName = getDisplayFirstName(userData.personalInfo, editFormData.fullName);

  if (isAdmin) {
    sectionTitles.admin = { icon: 'fa-user-shield', text: 'Admin', subtitle: 'Üzenetek és felhasználók' };
    navigationSections.push('admin');
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <button className="menu-toggle" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
        <div className="logo"><i className="fas fa-dumbbell" style={{marginRight: '8px'}}></i>Power<span>Plan</span></div>
        <div className="user-profile">
          <div className="profile-pic" onClick={() => navigateToSection('profile')}>
            {profileImage ? (
              <img src={profileImage} alt="Profil" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div className="user-name">{greetingName}</div>
          <div className="user-goal">{userData.goals?.mainGoal || 'Cél nincs megadva'}</div>
        </div>
        <div className="nav-menu">
          {navigationSections.map(section => {
            const unreadCount = section === 'messages'
              ? unreadUserMessagesCount
              : section === 'admin'
                ? unreadAdminMessagesCount
                : 0;

            return (
            <div key={section} className={`nav-item ${currentSection === section ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => navigateToSection(section)}>
              <i className={`fas ${sectionTitles[section].icon}`}></i>
              <span>{sectionTitles[section].text}</span>
              {unreadCount > 0 && <span className="nav-item-badge">{unreadCount}</span>}
            </div>
          );})}
        </div>
        <button className="logout-btn" onClick={logout}><i className="fas fa-sign-out-alt"></i><span>Kijelentkezés</span></button>
      </div>

      <div className={`main-content ${sidebarActive ? 'full-width' : ''}`}>
        <div className="top-bar">
          <div className="page-title">
            <h1><i className={`fas ${sectionTitles[currentSection]?.icon}`}></i><span>{sectionTitles[currentSection]?.text}</span></h1>
            {sectionTitles[currentSection]?.subtitle && (
              <p>
                {sectionTitles[currentSection]?.subtitleIcon && <i className={`fas ${sectionTitles[currentSection].subtitleIcon}`}></i>}
                <span>{sectionTitles[currentSection]?.subtitle}</span>
              </p>
            )}
          </div>
          <div className="top-actions">
            <div className="date-time" id="currentDateTime"></div>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Világos mód' : 'Sötét mód'}>
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
        </div>

        <DashboardOverviewSection
          currentSection={currentSection}
          greetingName={greetingName}
          workoutData={workoutData}
          totalCaloriesToday={totalCaloriesToday}
          calorieGoal={calorieGoal}
          calorieProgress={calorieProgress}
          userData={userData}
          weightChartData={weightChartData}
          weightChartOptions={weightChartOptions}
          workoutChartData={workoutChartData}
          workoutChartOptions={workoutChartOptions}
        />

        <WorkoutPlanSection
          currentSection={currentSection}
          workoutData={workoutData}
          completedRecommendedWorkoutMap={completedRecommendedWorkoutMap}
          serializeWorkoutTypeValue={serializeWorkoutTypeValue}
          normalizeSearchText={normalizeSearchText}
          stripRecommendedWorkoutSuffix={stripRecommendedWorkoutSuffix}
          formatWorkoutTypeLabel={formatWorkoutTypeLabel}
          undoRecommendedWorkoutForToday={undoRecommendedWorkoutForToday}
          saveRecommendedWorkoutForToday={saveRecommendedWorkoutForToday}
          savingRecommendedWorkoutKey={savingRecommendedWorkoutKey}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          loadWeekWorkouts={loadWeekWorkouts}
          loadingWorkouts={loadingWorkouts}
          getWorkoutsForDay={getWorkoutsForDay}
          handleWorkoutClick={handleWorkoutClick}
          showWorkoutModal={showWorkoutModal}
        />

        <WorkoutModeSection
          currentSection={currentSection}
          stopWorkout={stopWorkout}
          formatTime={formatTime}
          workoutTime={workoutTime}
          toggleWorkout={toggleWorkout}
          workoutActive={workoutActive}
          setWorkoutTime={setWorkoutTime}
        />

        <ProgressSection
          currentSection={currentSection}
          weightChartData={weightChartData}
          weightChartOptions={weightChartOptions}
        />

        <ProgressPhotosSection
          currentSection={currentSection}
          handleProgressPhotoUpload={handleProgressPhotoUpload}
          progressPhotos={progressPhotos}
          openDeleteProgressPhotoModal={openDeleteProgressPhotoModal}
          saveProgressPhoto={saveProgressPhoto}
          updateProgressNote={updateProgressNote}
          saveProgressNote={saveProgressNote}
        />

        {/* NUTRITION SECTION */}
        <div className={`content-section ${currentSection === 'nutrition' ? 'active' : ''}`}>
          <div className="card">
            <div className="nutrition-recommendations-panel">
              <div className="nutrition-top-row nutrition-recommendation-row">
                <h3>Ajánlott napi étrend</h3>
                <span className="nutrition-recommendation-date">{formatHungarianLongDate(nutritionSelectedDate)}</span>
              </div>
              {activeRecommendationDay.recommendationNote && (
                <p className="nutrition-recommendation-note">{activeRecommendationDay.recommendationNote}</p>
              )}
              <div className="week-nav nutrition-week-nav">
                <button type="button" className="nav-btn" onClick={() => shiftNutritionRecommendationWeek(-1)}><i className="fas fa-chevron-left"></i> Előző hét</button>
                <button type="button" className="nav-btn today-btn" onClick={goToCurrentNutritionRecommendationWeek}><i className="fas fa-calendar-day"></i> Ma</button>
                <button type="button" className="nav-btn" onClick={() => shiftNutritionRecommendationWeek(1)}>Következő hét <i className="fas fa-chevron-right"></i></button>
              </div>
              <div className="nutrition-week-preview-row">
                {nutritionRecommendationPreviewDays.map((dayPlan) => (
                  <button
                    key={dayPlan.recommendationDate}
                    type="button"
                    className={`nutrition-week-preview-card ${selectedNutritionDateKey === dayPlan.recommendationDate ? 'active' : ''}`}
                    onClick={() => setNutritionRecommendationDate(new Date(`${dayPlan.recommendationDate}T12:00:00`))}
                  >
                    <strong>{dayPlan.recommendationDateLabel}</strong>
                    <span>{dayPlan.calorieTarget || 0} kcal</span>
                  </button>
                ))}
              </div>
              <div className="nutrition-summary-grid nutrition-recommendation-summary">
                <div className="nutrition-summary-card">
                  <span className="nutrition-summary-label">Ajánlott napi keret</span>
                  <strong>{activeRecommendationDay.calorieTarget || 0} kcal</strong>
                </div>
                <div className="nutrition-summary-card">
                  <span className="nutrition-summary-label">Ajánlott étkezések</span>
                  <strong>{activeRecommendationDay.recommendations?.length || 0} db</strong>
                </div>
              </div>
              <div className="meal-plan nutrition-meal-plan nutrition-recommendation-plan">
                {(activeRecommendationDay.recommendations || []).map((meal, i) => (
                  <div key={`${meal.meal_type}-${i}`} className="meal-card">
                    <div className="meal-card-header">
                      <span className="meal-time">{meal.mealTypeLabel || meal.meal_type}</span>
                    </div>
                    <div className="meal-card-title">
                      <h4>{meal.name}</h4>
                    </div>
                    <p className="meal-description">{meal.description}</p>
                    <div className="macros">
                      <div className="macro">
                        <div className="macro-value">{meal.calories}</div>
                        <div className="macro-label">Kcal</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm recommended-meal-action"
                      onClick={() => handleAddRecommendedMeal({ ...meal, recommendationDate: activeRecommendationDay.recommendationDate })}
                      disabled={savingRecommendedMealKey === `${activeRecommendationDay.recommendationDate}-${meal.meal_type}-${meal.name}`}
                    >
                      {savingRecommendedMealKey === `${activeRecommendationDay.recommendationDate}-${meal.meal_type}-${meal.name}` ? 'Mentés...' : 'Beírás étkezésként'}
                    </button>
                  </div>
                ))}
                {(activeRecommendationDay.recommendations || []).length === 0 && (
                  <p className="no-data">Nincs elérhető étrendi ajánlás ehhez a profilhoz.</p>
                )}
              </div>
            </div>
            <div className="nutrition-top-row">
              <h3>Napi étkezések</h3>
              <button className="btn btn-primary" onClick={showMealLogModal}><i className="fas fa-plus"></i> Étkezés</button>
            </div>
            <div className="nutrition-date-row">
              <span>{formatHungarianLongDate(nutritionSelectedDate)}</span>
            </div>
            <div className="meal-plan nutrition-meal-plan">
              {selectedNutritionMeals.map((meal, i) => (
                <div key={i} className="meal-card">
                  <div className="meal-card-header">
                    <span className="meal-time">{meal.meal_type === 'breakfast' ? 'Reggeli' : meal.meal_type === 'lunch' ? 'Ebéd' : meal.meal_type === 'dinner' ? 'Vacsora' : 'Snack'}</span>
                  </div>
                  <div className="meal-card-title">
                    <h4>{meal.name}</h4>
                    <button className="delete-meal-btn" onClick={() => openDeleteMealModal(meal)} title="Törlés">🗑️</button>
                  </div>
                  <div className="macros">
                    <div className="macro">
                      <div className="macro-value">{meal.calories}</div>
                      <div className="macro-label">Kcal</div>
                    </div>
                  </div>
                </div>
              ))}
              {selectedNutritionMeals.length === 0 && (
                <p className="no-data">Még nincs naplózott étkezés.</p>
              )}
            </div>
            <WeekCalendar
              selectedDate={nutritionSelectedDate}
              onDateChange={setNutritionSelectedDate}
              onWeekChange={loadNutritionWeek}
            />
            <div className="nutrition-layout">
              <div className="nutrition-chart-card nutrition-radar-panel">
                <div className="nutrition-chart-header">
                  <div>
                    <h3>Heti kalóriatérkép</h3>
                    <p>A hét minden napja egyetlen nézetben.</p>
                  </div>
                  <span>{new Date(nutritionSelectedDate).toLocaleDateString('hu-HU')}</span>
                </div>
                <div className="nutrition-radar-wrap">
                  <Radar data={nutritionChartData} options={nutritionChartOptions} />
                </div>
              </div>
              <div className="nutrition-side-panel">
                <div className="nutrition-summary-card nutrition-summary-card-main">
                  <span className="nutrition-summary-label">Kiválasztott nap</span>
                  <div className="calorie-summary">
                    <div className="calorie-circle">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" strokeWidth="12"/>
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e63946" strokeWidth="12" 
                          strokeDasharray={`${2 * Math.PI * 54 * displayedCalorieProgress / 100} ${2 * Math.PI * 54}`} 
                          transform="rotate(-90 60 60)"/>
                      </svg>
                      <div className="calorie-text">
                        <span className="calorie-value">{displayedCalories}</span>
                        <span className="calorie-label">/ {calorieGoal}</span>
                      </div>
                    </div>
                  </div>
                  <span className="nutrition-summary-date">{formatHungarianLongDate(nutritionSelectedDate)}</span>
                </div>
                <div className="nutrition-summary-grid">
                  <div className="nutrition-summary-card">
                    <span className="nutrition-summary-label">Heti összesen</span>
                    <strong>{weeklyCalories} kcal</strong>
                  </div>
                  <div className="nutrition-summary-card">
                    <span className="nutrition-summary-label">Napi átlag</span>
                    <strong>{averageDailyCalories} kcal</strong>
                  </div>
                  <div className="nutrition-summary-card">
                    <span className="nutrition-summary-label">Legtöbb bevitel</span>
                    <strong>{highestCalorieDay.fullDateLabel || '-'}</strong>
                    <small>{highestCalorieDay.totalCalories} kcal</small>
                  </div>
                  <div className="nutrition-summary-card">
                    <span className="nutrition-summary-label">Hátralévő keret</span>
                    <strong>{remainingCalories} kcal</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GYMS SECTION */}
        <div className={`content-section ${currentSection === 'gyms' ? 'active' : ''}`}>
          <div className="card">
            <GymMap isActive={currentSection === 'gyms'} />
          </div>
        </div>

        {/* EXERCISES SECTION */}
        <div className={`content-section ${currentSection === 'exercises' ? 'active' : ''}`}>
          <ExercisesSection
            currentSection={currentSection}
            exerciseSearchQuery={exerciseSearchQuery}
            setExerciseSearchQuery={setExerciseSearchQuery}
            filteredExerciseCategories={filteredExerciseCategories}
          />
        </div>

        {/* BADGES SECTION */}
        <div className={`content-section ${currentSection === 'badges' ? 'active' : ''}`}>
          <BadgesSection
            personalRecords={personalRecords}
            workoutStreak={workoutStreak}
            achievements={achievements}
            badges={badges}
          />
        </div>

        {/* PROFILE SECTION */}
        <div className={`content-section ${currentSection === 'admin' ? 'active' : ''}`}>
          <AdminSection
            adminLoading={adminLoading}
            adminActivePanel={adminActivePanel}
            setAdminActivePanel={setAdminActivePanel}
            unreadAdminMessagesCount={unreadAdminMessagesCount}
            adminMessages={adminMessages}
            adminMessageTab={adminMessageTab}
            setAdminMessageTab={setAdminMessageTab}
            incomingAdminMessages={incomingAdminMessages}
            sentAdminMessages={sentAdminMessages}
            isUnreadForAdmin={isUnreadForAdmin}
            handleAdminMessageReplyChange={handleAdminMessageReplyChange}
            saveAdminReply={saveAdminReply}
            deleteAdminMessage={deleteAdminMessage}
            deletingAdminMessageId={deletingAdminMessageId}
            adminUsers={adminUsers}
            handleAdminUserFieldChange={handleAdminUserFieldChange}
            sendAdminDirectMessage={sendAdminDirectMessage}
            openDeleteAdminUserModal={openDeleteAdminUserModal}
            deletingAdminUserId={deletingAdminUserId}
            savedAdminUserIds={savedAdminUserIds}
            saveAdminUser={saveAdminUser}
            onRefreshAdmin={() => {
              const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
              const token = localStorage.getItem('powerplan_token');
              if (currentUser.id) {
                loadAdminData(currentUser.id, token);
              }
            }}
          />
        </div>

        <div className={`content-section ${currentSection === 'messages' ? 'active' : ''}`}>
          <MessagesSection
            onRefreshMessages={() => {
              const currentUser = JSON.parse(localStorage.getItem('powerplan_current_user') || '{}');
              const token = localStorage.getItem('powerplan_token');
              if (currentUser.id) {
                loadUserMessages(currentUser.id, token);
              }
            }}
            userMessageForm={userMessageForm}
            setUserMessageForm={setUserMessageForm}
            sendUserMessage={sendUserMessage}
            sendingUserMessage={sendingUserMessage}
            unreadUserMessagesCount={unreadUserMessagesCount}
            userMessagesLoading={userMessagesLoading}
            userMessageTab={userMessageTab}
            setUserMessageTab={setUserMessageTab}
            incomingUserMessages={incomingUserMessages}
            sentUserMessages={sentUserMessages}
            isUnreadForUser={isUnreadForUser}
            deleteUserMessage={deleteUserMessage}
            deletingUserMessageId={deletingUserMessageId}
          />
        </div>

        {/* PROFILE SECTION */}
        <div className={`content-section ${currentSection === 'profile' ? 'active' : ''}`}>
          <ProfileSection
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            setIsProfileSaved={setIsProfileSaved}
            profileImage={profileImage}
            profileImageInputRef={profileImageInputRef}
            handleImageUpload={handleImageUpload}
            openProfileImageEditor={openProfileImageEditor}
            editFormData={editFormData}
            handleProfileFieldChange={handleProfileFieldChange}
            minRealisticWeightKg={MIN_REALISTIC_WEIGHT_KG}
            maxRealisticWeightKg={MAX_REALISTIC_WEIGHT_KG}
            preventNumberInputWheel={preventNumberInputWheel}
            passwordVisibility={passwordVisibility}
            passwordFormData={passwordFormData}
            handlePasswordFieldChange={handlePasswordFieldChange}
            togglePasswordVisibility={togglePasswordVisibility}
            handlePasswordChange={handlePasswordChange}
            savingPasswordChange={savingPasswordChange}
            isProfileSaved={isProfileSaved}
            handleProfileSave={handleProfileSave}
            calculateAge={calculateAge}
          />
        </div>
      </div>

      {/* MODAL: Étkezés */}
      <div className={`modal ${modalOpen === 'mealLog' ? 'active' : ''}`} onClick={(e) => {
        if (e.target.className === 'modal active') closeModal();
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2><i className="fas fa-plus"></i> Étkezés naplózása</h2>
            <button className="modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
          </div>
          <form id="mealLogForm" onSubmit={handleMealSubmit}>
            <div className="form-group">
              <label>Étkezés típusa</label>
              <select
                className="form-control"
                id="mealType"
                required
                value={selectedMealType}
                onChange={(e) => {
                  setSelectedMealType(e.target.value);
                }}
              >
                <option value="">Válasszon...</option>
                <option value="breakfast">Reggeli</option>
                <option value="lunch">Ebéd</option>
                <option value="dinner">Vacsora</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Kategória</label>
              <select
                className="form-control"
                value={selectedFoodCategory}
                onChange={(e) => {
                  setSelectedFoodCategory(e.target.value);
                  setSelectedFood(null);
                }}
              >
                <option value="">Összes kategória</option>
                {availableCategoryOptions.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Étel neve</label>
              <div className="food-search-wrap">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  className="form-control food-search-input"
                  placeholder="Keresés étel neve alapján..."
                  value={mealSearchQuery}
                  onChange={(e) => setMealSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Találatok</label>
              <div className="food-search-results">
                {filteredFoodOptions.length === 0 && <div className="food-search-empty">Nincs találat a keresésre.</div>}
                {filteredFoodOptions.map((food) => (
                  <button
                    key={food.value}
                    type="button"
                    className={`food-search-result-item ${selectedFood?.value === food.value ? 'active' : ''}`}
                    onClick={() => handleFoodSelection(food.value)}
                  >
                    <span className="food-search-result-name">{food.name}</span>
                    <span className="food-search-result-meta">{food.category} • {food.calories} kcal / {food.calorieBasisLabel || '100 g'}</span>
                  </button>
                ))}
              </div>
              <small className="food-picker-help">Az értékek az itt jelzett alapmennyiségre vonatkoznak. Ha az ételnél adag vagy kanál szerepel, a kalkuláció azt veszi alapul.</small>
            </div>

            <div className="form-group">
              <label>Elfogyasztott mennyiség (gramm)</label>
              <input
                type="number"
                className="form-control"
                id="mealGrams"
                min="1"
                step="1"
                required
                value={mealGrams}
                inputMode="numeric"
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setMealGrams(e.target.value)}
              />
              {selectedFood && (
                <small className="food-picker-help">Kalóriaalap: {selectedFood.calorieBasisLabel || '100 g'}.</small>
              )}
            </div>

            <div className="form-group">
              <label>Számolt kalória</label>
              <div className="food-calorie-preview">
                {selectedFood ? `${calculatedMealCalories} kcal` : 'Válassz ételt a kalóriaszámításhoz.'}
              </div>
            </div>

            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Mégse</button>
              <button type="submit" className="btn btn-primary">Naplózás</button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: Étkezés törlés megerősítés */}
      <div className={`modal ${showDeleteMealModal ? 'active' : ''}`} onClick={(e) => {
        if (e.target.className === 'modal active') closeDeleteMealModal();
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2><i className="fas fa-trash-alt"></i> Étkezés törlése</h2>
            <button className="modal-close" onClick={closeDeleteMealModal}><i className="fas fa-times"></i></button>
          </div>
          <p>Biztosan törölni szeretnéd ezt az étkezést?</p>
          <p><strong>{mealToDelete?.name || 'Ismeretlen étel'}</strong> - {mealToDelete?.calories || ''} kcal</p>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeDeleteMealModal}>Mégse</button>
            <button type="button" className="btn btn-primary" onClick={() => deleteMeal(mealToDelete?.id)}>Törlés</button>
          </div>
        </div>
      </div>

      <div className={`modal modal-front ${showDeleteAdminUserModal ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) closeDeleteAdminUserModal();
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2><i className="fas fa-trash-alt"></i> Felhasználó törlése</h2>
            <button className="modal-close" onClick={closeDeleteAdminUserModal}><i className="fas fa-times"></i></button>
          </div>
          <p>Biztosan törölni akarod ezt a felhasználót?</p>
          <p><strong>{adminUserToDelete?.fullName || 'Ismeretlen felhasználó'}</strong> - {adminUserToDelete?.email || ''}</p>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeDeleteAdminUserModal}>Mégse</button>
            <button type="button" className="btn btn-primary" onClick={() => deleteAdminUser(adminUserToDelete?.id)} disabled={!adminUserToDelete || deletingAdminUserId === adminUserToDelete.id}>
              {deletingAdminUserId === adminUserToDelete?.id ? 'Törlés...' : 'Törlés'}
            </button>
          </div>
        </div>
      </div>

      <div className={`modal modal-front ${showDeleteProgressPhotoModal ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) closeDeleteProgressPhotoModal();
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2><i className="fas fa-trash-alt"></i> Fotó törlése</h2>
            <button className="modal-close" onClick={closeDeleteProgressPhotoModal}><i className="fas fa-times"></i></button>
          </div>
          <p>Biztosan törölni szeretnéd ezt a fejlődésfotót?</p>
          <p><strong>{progressPhotoToDelete?.date || 'Kiválasztott fotó'}</strong></p>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeDeleteProgressPhotoModal}>Mégse</button>
            <button type="button" className="btn btn-primary" onClick={() => deleteProgressPhoto(progressPhotoToDelete?.id)}>Törlés</button>
          </div>
        </div>
      </div>

      <div className={`modal modal-front ${showDeleteWorkoutModal ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) closeDeleteWorkoutModal();
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2><i className="fas fa-trash-alt"></i> Edzés törlése</h2>
            <button className="modal-close" onClick={closeDeleteWorkoutModal}><i className="fas fa-times"></i></button>
          </div>
          <p>Biztosan törölni szeretnéd ezt az edzést?</p>
          <p><strong>{workoutToDelete?.name || 'Ismeretlen edzés'}</strong> - {formatWorkoutTypeLabel(workoutToDelete?.workout_type || '')}</p>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeDeleteWorkoutModal}>Mégse</button>
            <button type="button" className="btn btn-primary" onClick={() => deleteWorkout(workoutToDelete?.id)}>Törlés</button>
          </div>
        </div>
      </div>

      {/* MODAL: Edzés részletek */}
      {showWorkoutDetailsModal && selectedWorkout && (
        <div className="modal active" onClick={(e) => {
          if (e.target.className === 'modal active') closeWorkoutDetailsModal();
        }}>
          <div className="modal-content workout-details-modal">
            <div className="modal-header">
              <h2><i className="fas fa-dumbbell"></i> {selectedWorkout.name}</h2>
              <button className="modal-close" onClick={closeWorkoutDetailsModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="workout-details">
              <div className="workout-meta">
                <span className="badge">{formatWorkoutTypeLabel(selectedWorkout.workout_type)}</span>
                <span className="date">{new Date(selectedWorkout.created_at).toLocaleDateString('hu-HU')}</span>
              </div>
              <div className="exercises-list">
                <h3>Gyakorlatok:</h3>
                {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                  selectedWorkout.exercises.map((ex, idx) => (
                    <div key={idx} className="exercise-detail-card">
                      <div className="exercise-header">
                        <h4>{ex.name}</h4>
                        <span className="muscle-group">{ex.muscleGroup}</span>
                      </div>
                      <div className="sets-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Súly</th>
                              <th>Ismétlés</th>
                              <th>
                                <span className="table-heading-with-tooltip">
                                  RPE
                                  <span className="info-tooltip" tabIndex="0">
                                    <i className="fas fa-circle-info"></i>
                                    <span className="info-tooltip-bubble">{RPE_TOOLTIP_TEXT}</span>
                                  </span>
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.sets && ex.sets.map((set, setIdx) => (
                              <tr key={setIdx}>
                                <td>{setIdx + 1}</td>
                                <td>{set.weight || '-'}</td>
                                <td>{set.reps || '-'}</td>
                                <td>{set.rpe || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Nincsenek gyakorlatok ehhez az edzéshez.</p>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={closeWorkoutDetailsModal}>Bezárás</button>
              <button className="btn btn-secondary" onClick={() => openDeleteWorkoutModal(selectedWorkout)}>Törlés</button>
              <button className="btn btn-primary" onClick={startEditWorkout}>Szerkesztés</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edzés (új vagy szerkesztés) */}
      <div className={`modal ${modalOpen === 'workoutLog' ? 'active' : ''}`} onClick={(e) => {
        if (e.target.className === 'modal active') closeModal();
      }}>
        <div className="modal-content" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2><i className="fas fa-dumbbell"></i> {editingWorkoutId ? 'Edzés szerkesztése' : 'Új edzés'}</h2>
            <button className="modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleWorkoutSubmit}>
            <div className="form-group">
              <label>Edzés neve</label>
              <input type="text" className="form-control" placeholder="Pl. Mell-nap" 
                value={workoutFormDetails.name} 
                onChange={(e) => setWorkoutFormDetails({...workoutFormDetails, name: e.target.value})} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nap</label>
                <select className="form-control" value={workoutFormDetails.day} 
                  onChange={(e) => setWorkoutFormDetails({...workoutFormDetails, day: e.target.value})} required>
                  <option value="">Válasszon...</option>
                  <option value="monday">Hétfő</option>
                  <option value="tuesday">Kedd</option>
                  <option value="wednesday">Szerda</option>
                  <option value="thursday">Csütörtök</option>
                  <option value="friday">Péntek</option>
                  <option value="saturday">Szombat</option>
                  <option value="sunday">Vasárnap</option>
                </select>
              </div>
              <div className="form-group">
                <label>Típus</label>
                <select className="form-control" value={workoutFormDetails.type} 
                  onChange={(e) => {
                    setWorkoutFormDetails({...workoutFormDetails, type: e.target.value});
                    setExercisesList([{ id: Date.now(), muscleGroup: '', name: '', sets: [{ weight: '', reps: '', rpe: '' }] }]);
                  }} required>
                  <option value="">Válasszon...</option>
                  <option value="push">{formatWorkoutTypeLabel('push')}</option>
                  <option value="pull">{formatWorkoutTypeLabel('pull')}</option>
                  <option value="leg">{formatWorkoutTypeLabel('leg')}</option>
                  <option value="upper">{formatWorkoutTypeLabel('upper')}</option>
                  <option value="lower">{formatWorkoutTypeLabel('lower')}</option>
                  <option value="full body">{formatWorkoutTypeLabel('full body')}</option>
                  <option value="arms">{formatWorkoutTypeLabel('arms')}</option>
                  <option value="cardio">{formatWorkoutTypeLabel('cardio')}</option>
                  <option value="hiit">{formatWorkoutTypeLabel('hiit')}</option>
                </select>
              </div>
            </div>
            
            <hr />
            
            {exercisesList.map((exercise, exIndex) => {
              const allowedMuscles = workoutFormDetails.type
                ? (MUSCLE_FILTER[workoutFormDetails.type] || Object.keys(EXERCISE_DB_WITH_VIDEOS))
                : Object.keys(EXERCISE_DB_WITH_VIDEOS);
              return (
                <div key={exercise.id} className="exercise-block">
                  <div className="exercise-block-header">
                    <h4>{exIndex + 1}. gyakorlat</h4>
                    {exercisesList.length > 1 && (
                      <button type="button" className="btn-icon" onClick={() => handleRemoveExerciseBlock(exercise.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Izomcsoport</label>
                      <select className="form-control" value={exercise.muscleGroup} 
                        onChange={(e) => handleExerciseChange(exercise.id, 'muscleGroup', e.target.value)} required>
                        <option value="">Válasszon...</option>
                        {allowedMuscles.map(muscle => (
                          <option key={muscle} value={muscle}>{muscle}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gyakorlat</label>
                      <select className="form-control" value={exercise.name} 
                        onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)} 
                        required disabled={!exercise.muscleGroup}>
                        <option value="">Válasszon...</option>
                        {exercise.muscleGroup && EXERCISE_DB_WITH_VIDEOS[exercise.muscleGroup]?.map(exName => (
                          <option key={exName.name} value={exName.name}>{exName.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="rpe-helper-row">
                    <span className="rpe-helper-label">RPE magyarázat</span>
                    <span className="info-tooltip" tabIndex="0">
                      <i className="fas fa-circle-info"></i>
                      <span className="info-tooltip-bubble">{RPE_TOOLTIP_TEXT}</span>
                    </span>
                  </div>
                  <div className="sets-container">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="set-row">
                        <input type="number" placeholder="Súly (kg)" value={set.weight} onWheel={preventNumberInputWheel}
                          onChange={(e) => handleSetChange(exercise.id, setIndex, 'weight', e.target.value)} required />
                        <input type="number" placeholder="Ismétlés" value={set.reps} onWheel={preventNumberInputWheel}
                          onChange={(e) => handleSetChange(exercise.id, setIndex, 'reps', e.target.value)} required />
                        <input type="number" placeholder="RPE (1-10)" min="1" max="10" value={set.rpe} onWheel={preventNumberInputWheel}
                          onChange={(e) => handleSetChange(exercise.id, setIndex, 'rpe', e.target.value)} />
                        {exercise.sets.length > 1 && (
                          <button type="button" className="btn-icon" onClick={() => handleRemoveSet(exercise.id, setIndex)}>
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add-set" onClick={() => handleAddSet(exercise.id)}>
                      + Szett hozzáadása
                    </button>
                  </div>
                </div>
              );
            })}
            
            <button type="button" className="btn-add-exercise" onClick={handleAddExerciseBlock}>
              <i className="fas fa-plus-circle"></i> Még egy gyakorlat
            </button>
            
            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Mégse</button>
              {editingWorkoutId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openDeleteWorkoutModal(selectedWorkout || {
                    id: editingWorkoutId,
                    name: workoutFormDetails.name,
                    workout_type: workoutFormDetails.type
                  })}
                >
                  Törlés
                </button>
              )}
              <button type="submit" className="btn btn-primary">{editingWorkoutId ? 'Mentés' : 'Edzés mentése'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className={`modal ${profileImageEditorOpen ? 'active' : ''}`} onClick={(event) => {
        if (event.target.className === 'modal active') {
          closeProfileImageEditor();
        }
      }}>
        <div className="modal-content profile-image-editor-modal">
          <div className="modal-header">
            <h2><i className="fas fa-image"></i> Profilkép igazítása</h2>
            <button className="modal-close" onClick={closeProfileImageEditor}><i className="fas fa-times"></i></button>
          </div>
          <p className="profile-image-editor-help">Húzd az előnézetet az egérrel, és használd a csúszkákat a nagyításhoz, kicsinyítéshez és finom igazításhoz.</p>
          <div className="profile-image-editor-stage">
            <div className="profile-image-editor-preview" onPointerDown={handleProfileImagePointerDown}>
              {profileImageDraft && profileImageDraftDimensions && (
                <img
                  src={profileImageDraft}
                  alt="Profilkép előnézet"
                  className="profile-image-editor-preview-image"
                  style={getProfileEditorPreviewStyle(profileImageDraftDimensions, profileImageScale, profileImageOffset.x, profileImageOffset.y)}
                  draggable={false}
                />
              )}
            </div>
          </div>
          <div className="profile-image-editor-controls">
            <div className="form-group">
              <label htmlFor="profile-image-scale">Nagyítás: {Math.round(profileImageScale * 100)}%</label>
              <input
                className="profile-image-editor-range"
                id="profile-image-scale"
                type="range"
                min="1"
                max="2.6"
                step="0.05"
                value={profileImageScale}
                onChange={(event) => updateProfileImageTransform(Number(event.target.value), profileImageOffset)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-image-offset-x">Vízszintes mozgatás: {Math.round(profileImageOffset.x)} px</label>
              <input
                className="profile-image-editor-range"
                id="profile-image-offset-x"
                type="range"
                min={-profileImageOffsetLimits.x}
                max={profileImageOffsetLimits.x}
                step="1"
                value={profileImageOffset.x}
                disabled={profileImageOffsetLimits.x === 0}
                onChange={(event) => updateProfileImageTransform(profileImageScale, { x: Number(event.target.value), y: profileImageOffset.y })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-image-offset-y">Függőleges mozgatás: {Math.round(profileImageOffset.y)} px</label>
              <input
                className="profile-image-editor-range"
                id="profile-image-offset-y"
                type="range"
                min={-profileImageOffsetLimits.y}
                max={profileImageOffsetLimits.y}
                step="1"
                value={profileImageOffset.y}
                disabled={profileImageOffsetLimits.y === 0}
                onChange={(event) => updateProfileImageTransform(profileImageScale, { x: profileImageOffset.x, y: Number(event.target.value) })}
              />
            </div>
          </div>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={() => updateProfileImageTransform(1, { x: 0, y: 0 })}>Alaphelyzet</button>
            <button type="button" className="btn btn-secondary" onClick={closeProfileImageEditor}>Mégse</button>
            <button type="button" className="btn btn-primary" onClick={handleProfileImageSave} disabled={profileImageSaving}>
              <i className="fas fa-save"></i> {profileImageSaving ? 'Mentés...' : 'Profilkép mentése'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast értesítő */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;