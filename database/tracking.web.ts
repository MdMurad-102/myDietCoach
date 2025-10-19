// Web-safe tracking stub - PostgreSQL cannot run in browser

export interface WaterTracking {
    id: number;
    user_id: number;
    date: string;
    water_consumed: number;
    glasses?: any;
    last_updated?: Date;
}

export interface WeightTracking {
    id: number;
    user_id: number;
    weight: number;
    date: string;
    created_at?: Date;
}

export interface CalorieTracking {
    id: number;
    user_id: number;
    date: string;
    calories_consumed: number;
    calories_goal: number;
    protein_consumed: number;
    protein_goal: number;
    last_updated?: Date;
}

export interface ActivityLog {
    id: number;
    user_id: number;
    activity_type: string;
    duration_minutes: number;
    calories_burned: number;
    date: string;
    notes?: string;
    created_at?: Date;
}

// Stub functions that throw errors on web
const notAvailableOnWeb = () => {
    throw new Error('Database operations are not available on web. This app requires native mobile platform.');
};

export const trackWater = notAvailableOnWeb;
export const getWaterTracking = notAvailableOnWeb;
export const getTodayWaterTracking = notAvailableOnWeb;
export const getWaterHistory = notAvailableOnWeb;
export const trackWeight = notAvailableOnWeb;
export const getWeightHistory = notAvailableOnWeb;
export const getLatestWeight = notAvailableOnWeb;
export const trackCalories = notAvailableOnWeb;
export const getCalorieTracking = notAvailableOnWeb;
export const getTodayCalorieTracking = notAvailableOnWeb;
export const getCalorieHistory = notAvailableOnWeb;
export const updateCalorieConsumption = notAvailableOnWeb;
export const logActivity = notAvailableOnWeb;
export const getActivityLogs = notAvailableOnWeb;
export const getTodayActivityLogs = notAvailableOnWeb;
export const deleteActivityLog = notAvailableOnWeb;
export const getWeeklyProgress = notAvailableOnWeb;
