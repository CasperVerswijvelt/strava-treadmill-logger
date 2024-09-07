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
    const averageSpeedKmh = distanceKm / durationHours;

    // Function to calculate MET dynamically based on speed and incline
    const getMET = (speed: number, incline: number): number => {
        let baseMET: number;

        // Estimate base MET based on speed (values can be fine-tuned)
        if (speed < 4) {
            baseMET = 2.0; // Casual walking
        } else if (speed < 6) {
            baseMET = 3.8; // Brisk walking
        } else if (speed < 8) {
            baseMET = 7.0; // Light jogging
        } else if (speed < 10) {
            baseMET = 9.8; // Running
        } else {
            baseMET = 11.5; // Fast running
        }

        // Adjust MET based on incline percentage
        const inclineFactor = 1 + incline / 10; // 10% incline increases MET by 10%

        return baseMET * inclineFactor;
    };

    // Calculate MET based on speed and incline
    const MET = getMET(averageSpeedKmh, inclinePercentage);

    // Calculate calories burned
    const caloriesBurned = durationHours * MET * weightKg;

    return caloriesBurned;
};
