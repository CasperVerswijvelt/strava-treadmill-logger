import { FitWriter } from "@markw65/fit-file-writer";

export const createFitFile = (
  distance: number, // in meters
  altitudeGain: number, // in meters
  caloriesBurned: number, // in kilocalories
  duration: number, // in seconds
  weight: number // in kilograms
): DataView => {
  const endTime = new Date(); // Current time as the end time
  const startTime = new Date(endTime.getTime() - duration * 1000); // Start time is now minus the duration
  const fitWriter = new FitWriter();

  // Define the starting latitude and longitude
  const startLatitude = 10;
  const startLongitude = -40;

  // Calculate the number of data pointss
  const numDataPoints = Math.max(Math.ceil(duration / 10), 100);

  const degreesToSemicircles = (degrees: number) =>
    fitWriter.latlng(degrees * (Math.PI / 180)); // Convert degrees to semi-circles

  // Write file_id message
  fitWriter.writeMessage(
    "file_id",
    {
      type: "activity",
      manufacturer: "garmin",
      product: 0,
      serial_number: 0xdeadbeef,
      time_created: fitWriter.time(startTime),
      product_name: "TreadmillWalk",
    },
    null,
    true
  );

  // Write activity message
  fitWriter.writeMessage(
    "activity",
    {
      total_timer_time: duration,
      num_sessions: 1,
      type: "manual",
      timestamp: fitWriter.time(startTime),
      local_timestamp: fitWriter.time(
        startTime.getTime() - startTime.getTimezoneOffset() * 60 * 1000
      ),
    },
    null,
    true
  );

  // Write weight message
  fitWriter.writeMessage(
    "user_profile",
    {
      weight: weight,
    },
    null,
    true
  );

  // Write session message
  fitWriter.writeMessage(
    "session",
    {
      start_time: fitWriter.time(startTime),
      total_elapsed_time: duration,
      total_timer_time: duration,
      total_distance: distance,
      total_ascent: altitudeGain,
      total_calories: caloriesBurned,
      start_position_lat: degreesToSemicircles(startLatitude),
      start_position_long: degreesToSemicircles(startLongitude),
      sport: "walking",
    },
    null,
    true
  );

  // Write lap message (one lap for the entire session)
  fitWriter.writeMessage(
    "lap",
    {
      start_time: fitWriter.time(startTime),
      total_elapsed_time: duration,
      total_timer_time: duration,
      total_distance: distance,
      total_ascent: altitudeGain,
      total_calories: caloriesBurned,
      start_position_lat: degreesToSemicircles(startLatitude), // Updated starting latitude
      start_position_long: degreesToSemicircles(startLongitude), // Updated starting longitude
      sport: "walking",
    },
    null,
    true
  );

  // Generate and write interpolated record messages
  for (let i = 0; i <= numDataPoints; i++) {
    const fraction = i / numDataPoints;
    const interpolatedTime = new Date(
      startTime.getTime() + fraction * duration * 1000
    );
    const interpolatedDistance = fraction * distance;
    const interpolatedAltitude = fraction * altitudeGain;
    const interpolatedCalories = fraction * caloriesBurned;
    const speed = distance / duration; // constant speed in m/s

    fitWriter.writeMessage(
      "record",
      {
        timestamp: fitWriter.time(interpolatedTime),
        distance: interpolatedDistance,
        altitude: interpolatedAltitude,
        speed,
        calories: interpolatedCalories,
        position_lat: degreesToSemicircles(startLatitude), // Updated starting latitude
        position_long: degreesToSemicircles(startLongitude), // Change longitude slightly to create a line effect
      },
      []
    );
  }

  // Finish and return the FIT file as a DataView
  const fitDataView = fitWriter.finish();
  return fitDataView;
};
