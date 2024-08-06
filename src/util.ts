export const calculateAltitudeGain = (inclinePercentage:number, distanceKm:number) => {
    // Convert distance from kilometers to meters
    const distanceMeters = distanceKm * 1000;

    // Calculate the altitude gain
    const altitudeGainMeters = distanceMeters * (inclinePercentage / 100);

    return altitudeGainMeters;
}

export const calculateCaloriesBurned = (
    durationMinutes: number,
    inclinePercentage: number,
    distanceKm: number,
    weightKg: number
): number => {
    // Convert duration from minutes to hours
    const durationHours = durationMinutes / 60;

    // Estimate MET value based on incline percentage and speed
    // For simplicity, using an average MET value for walking/running on an incline
    const averageSpeedKmh = distanceKm / durationHours;
    let MET: number;

    if (inclinePercentage >= 10) {
        MET = averageSpeedKmh > 8 ? 11.5 : 9.0; // Running vs brisk walking on a steep incline
    } else {
        MET = averageSpeedKmh > 8 ? 9.8 : 5.0; // Running vs brisk walking on a moderate incline
    }

    // Calculate calories burned
    const caloriesBurned = durationHours * MET * weightKg;

    return caloriesBurned;
};