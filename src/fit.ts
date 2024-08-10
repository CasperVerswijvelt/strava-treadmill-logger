import { FitWriter } from '@markw65/fit-file-writer';

export const createFitFile = (
  distance: number,          // in meters
  altitudeGain: number,      // in meters
  caloriesBurned: number,    // in kilocalories
  duration: number           // in seconds
): DataView => {
  const endTime = new Date(); // Current time as the end time
  const startTime = new Date(endTime.getTime() - duration * 1000); // Start time is now minus the duration
  const fitWriter = new FitWriter();
  const start = fitWriter.time(startTime);

  // Calculate the number of data points
  const numDataPoints = Math.max(Math.ceil(duration / 30), 100);

  // Write file_id message
  fitWriter.writeMessage(
    'file_id',
    {
      type: 'activity',
      manufacturer: 'garmin',
      product: 0,
      serial_number: 0xdeadbeef,
      time_created: start,
      product_name: 'TreadmillWalk',
    },
    null,
    true
  );

  // Write activity message
  fitWriter.writeMessage(
    'activity',
    {
      total_timer_time: duration,
      num_sessions: 1,
      type: 'manual',
      timestamp: start,
      local_timestamp: start - startTime.getTimezoneOffset() * 60,
    },
    null,
    true
  );

  // Write session message
  fitWriter.writeMessage(
    'session',
    {
      start_time: start,
      total_elapsed_time: duration,
      total_timer_time: duration,
      total_distance: distance,
      total_ascent: altitudeGain,
      total_calories: caloriesBurned,
      start_position_lat: 0,
      start_position_long: 0,
      sport: 'walking',
    },
    null,
    true
  );

  // Write lap message (one lap for the entire session)
  fitWriter.writeMessage(
    'lap',
    {
      start_time: start,
      total_elapsed_time: duration,
      total_timer_time: duration,
      total_distance: distance,
      total_ascent: altitudeGain,
      total_calories: caloriesBurned,
      start_position_lat: 0,
      start_position_long: 0,
      sport: 'walking',
    },
    null,
    true
  );

  // Generate and write interpolated record messages
  for (let i = 0; i <= numDataPoints; i++) {
    const fraction = i / numDataPoints;
    const interpolatedTime = new Date(startTime.getTime() + fraction * duration * 1000);
    const interpolatedDistance = fraction * distance;
    const interpolatedAltitude = fraction * altitudeGain;
    const interpolatedCalories = fraction * caloriesBurned;
    const speed = distance / duration; // constant speed in m/s

    fitWriter.writeMessage(
      'record',
      {
        timestamp: fitWriter.time(interpolatedTime),
        distance: interpolatedDistance,
        altitude: interpolatedAltitude,
        speed,
        calories: interpolatedCalories,
        position_lat: 0,  // Assuming no lat/lng for treadmill walks
        position_long: 0, // Assuming no lat/lng for treadmill walks
      },
      []
    );
  }

  // Finish and return the FIT file as a DataView
  const fitDataView = fitWriter.finish();
  return fitDataView;
};
