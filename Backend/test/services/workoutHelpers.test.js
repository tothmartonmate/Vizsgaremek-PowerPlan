const mockPool = {
    query: jest.fn(),
    getConnection: jest.fn()
};

jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => mockPool)
}));

const { helpers } = require('../../server');

describe('server.js workout helpers', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getExercisePrescription', () => {
        it('returns a cardio prescription for weight loss cardio work', () => {
            expect(helpers.getExercisePrescription('weightLoss', 'beginner', 'Futópad intervall', 0)).toBe('1 x 25-35 perc');
        });

        it('returns advanced strength compound ranges for heavy main lifts', () => {
            expect(helpers.getExercisePrescription('strength', 'advanced', 'Fekvenyomás', 0)).toBe('5 x 4-6');
        });

        it('returns strength accessory sets for a beginner', () => {
            expect(helpers.getExercisePrescription('strength', 'beginner', 'Bicepsz karhajlítás', 1)).toBe('3 x 10-12');
        });

        it('returns muscle gain compound sets for a beginner', () => {
            expect(helpers.getExercisePrescription('muscleGain', 'beginner', 'Fekvenyomás', 0)).toBe('3 x 8-10');
        });

        it('returns intermediate muscle gain accessory ranges for isolation work', () => {
            expect(helpers.getExercisePrescription('muscleGain', 'intermediate', 'Oldalemelés', 2)).toBe('4 x 10-12');
        });

        it('returns the generic cardio duration for non weight loss cardio work', () => {
            expect(helpers.getExercisePrescription('fitness', 'beginner', 'Kerékpár', 0)).toBe('1 x 20-30 perc');
        });
    });

    describe('withExercisePrescriptions', () => {
        it('maps exercise names into name and prescription objects', () => {
            const result = helpers.withExercisePrescriptions('fitness', 'intermediate', ['Fekvenyomás', 'Plank']);

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('name', 'Fekvenyomás');
            expect(result[0]).toHaveProperty('prescription');
        });

        it('preserves exercise order while generating different prescriptions by position', () => {
            const result = helpers.withExercisePrescriptions('weightLoss', 'beginner', ['Intervall futás', 'Mobilizáció']);

            expect(result.map((exercise) => exercise.name)).toEqual(['Intervall futás', 'Mobilizáció']);
            expect(result[0].prescription).toBe('1 x 25-35 perc');
            expect(result[1].prescription).toBe('1 x 10-15 perc');
        });
    });

    describe('buildWorkoutRecommendation', () => {
        it('creates a three-day plan for a muscle gain user with frequency 3', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'muscleGain',
                experienceLevel: 'beginner',
                weeklyTrainingDays: '3',
                trainingTypes: '["weights"]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '3',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendedPlan).toHaveLength(3);
            expect(result.recommendedPlan[0].dayLabel).toBe('Hétfő');
        });

        it('includes the strength-focused note for strength goal', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'strength',
                experienceLevel: 'intermediate',
                weeklyTrainingDays: '4',
                trainingTypes: '[]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '4',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendationNote).toContain('erőfejlesztő');
        });

        it('includes a cardio day in a weight loss plan', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'weightLoss',
                experienceLevel: 'beginner',
                weeklyTrainingDays: '3-4',
                trainingTypes: '[]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '3-4',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendedPlan.some((day) => day.workoutType === 'cardio')).toBe(true);
        });

        it('replaces gym exercises with home-friendly alternatives', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'muscleGain',
                experienceLevel: 'beginner',
                weeklyTrainingDays: '3',
                trainingTypes: '[]',
                trainingLocation: 'home',
                preferredWeeklyFrequency: '3',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            const exerciseNames = result.recommendedPlan.flatMap((day) => day.exercises.map((exercise) => exercise.name));

            expect(exerciseNames).toContain('Fekvőtámasz');
            expect(exerciseNames).toContain('Gumiszalagos lehúzás');
            expect(exerciseNames).not.toContain('Lábnyomás');
        });

        it('adds an extra cardio block when cardio training is requested', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'fitness',
                experienceLevel: 'intermediate',
                weeklyTrainingDays: '5+',
                trainingTypes: '["cardio"]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '5+',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendedPlan.some((day) => day.workoutType === 'cardio')).toBe(true);
        });

        it('appends the advanced experience suffix when the user is advanced', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'fitness',
                experienceLevel: 'advanced',
                weeklyTrainingDays: '2',
                trainingTypes: '[]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '2',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendationNote).toContain('Haladó bontással');
        });

        it('falls back to a three day recommendation for unknown frequency values', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'fitness',
                experienceLevel: 'beginner',
                weeklyTrainingDays: 'custom',
                trainingTypes: '[]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: 'custom',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendedPlan).toHaveLength(3);
            expect(result.recommendedPlan.map((day) => day.day)).toEqual(['monday', 'wednesday', 'friday']);
        });

        it('appends the intermediate experience suffix when the user is neither beginner nor advanced', () => {
            const result = helpers.buildWorkoutRecommendation({
                goal: 'fitness',
                experienceLevel: 'intermediate',
                weeklyTrainingDays: '3',
                trainingTypes: '[]',
                trainingLocation: 'gym',
                preferredWeeklyFrequency: '3',
                wantsWorkoutPlanRecommendation: 'yes'
            });

            expect(result.recommendationNote).toContain('Közepes terheléssel');
        });
    });
});