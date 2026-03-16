USE powerplan;

-- 1. users table (Core user data)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fitness_goal VARCHAR(50), -- Coming from the registration form
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. user_settings table (App preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    notifications_enabled TINYINT(1) DEFAULT 1,
    dark_mode_enabled TINYINT(1) DEFAULT 1,
    measurement_unit ENUM('metric', 'imperial') DEFAULT 'metric',
    workout_reminder_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. user_subscriptions table (Matches App.jsx pricing plans)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_type ENUM('basic', 'premium', 'pro') NOT NULL DEFAULT 'basic',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. user_questionnaires table (Perfectly matches questionnaire.jsx state)
CREATE TABLE IF NOT EXISTS user_questionnaires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    -- Section 1: Personal Info
    gender ENUM('male', 'female', 'other') NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    birth_date DATE NOT NULL,
    activity_level ENUM('sedentary', 'light', 'moderate', 'very') NOT NULL,
    -- Section 2: Training Experience
    experience_level ENUM('never', 'beginner', 'intermediate', 'advanced') NOT NULL,
    weekly_training_days ENUM('0', '1-2', '3-4', '5+') NOT NULL,
    training_types JSON, -- Array of selected types (weight, cardio, etc.)
    -- Section 3: Health Info
    current_injury VARCHAR(50) DEFAULT 'no',
    chronic_conditions JSON, -- Array of conditions
    medications TEXT,
    -- Section 4: Goals
    main_goal VARCHAR(50) NOT NULL,
    goal_timeframe VARCHAR(50) NOT NULL,
    specific_goal TEXT,
    motivations JSON, -- Array of motivations
    -- Section 5: Lifestyle
    sleep_hours DECIMAL(4,1) DEFAULT 7.0,
    stress_level INT DEFAULT 5,
    sitting_time ENUM('low', 'medium', 'high') NOT NULL,
    -- Section 6: Nutrition
    diet_types JSON, -- Array of diet types
    allergies TEXT,
    diet_control_level INT DEFAULT 5,
    wants_diet_recommendations ENUM('yes', 'no', 'maybe') NOT NULL,
    -- Section 7: Preferences
    training_location ENUM('gym', 'home', 'outdoor') NOT NULL,
    preferred_workout_duration_mins INT NOT NULL,
    preferred_weekly_frequency VARCHAR(10) NOT NULL,
    -- Section 8: Self Assessment
    physique_satisfaction INT DEFAULT 5,
    energy_level INT DEFAULT 5,
    obstacles JSON, -- Array of obstacles
    additional_comments TEXT,
    -- Metadata
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. workouts table (Training plans assigned to user)
CREATE TABLE IF NOT EXISTS workouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- Link the workout to the user!
    name VARCHAR(100) NOT NULL,
    workout_type ENUM('push', 'pull', 'legs', 'full_body', 'cardio', 'hiit') NOT NULL,
    scheduled_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    duration_mins INT,
    is_completed TINYINT(1) DEFAULT 0,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. workout_exercises table (Specific exercises inside a workout)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workout_id INT NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps_per_set VARCHAR(20) NOT NULL,
    target_weight_kg DECIMAL(5,2),
    sort_order INT DEFAULT 0, -- To keep exercises in specific order
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- 7. notifications table (System and user alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
