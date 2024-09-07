import { useStravaAuth } from "./providers/StravaAuth.tsx";

import "./App.css";
import { useSessionStorage } from "usehooks-ts";
import { calculateAltitudeGain, calculateCaloriesBurned } from "./util.ts";
import { saveAs } from "file-saver";
import { createFitFile } from "./fit.ts";
import { useState } from "react";
import { NumberInput } from "./components/NumberInput.tsx";

function App() {
  const { loggedInName, uploadActivity } = useStravaAuth();

  const [distance, setDistance] = useSessionStorage("last_distance", 2.6);
  const [duration, setDuration] = useSessionStorage("last_duration", 30);
  const [inclinePercentage, setInclinePercentage] = useSessionStorage(
    "last_incline",
    13.37
  );
  const [weight, setWeight] = useSessionStorage("last_weight", 72);
  const [activityName, setActivityName] = useSessionStorage(
    "activity_name",
    "Loopband"
  );

  const [uploading, setUploading] = useState(false);

  const altitudeGain = calculateAltitudeGain(inclinePercentage, distance);
  const caloriesBurned = calculateCaloriesBurned(
    duration,
    inclinePercentage,
    distance,
    weight
  );

  const getActivityBlob = async () => {
    const fitData = createFitFile(
      distance * 1000,
      altitudeGain,
      caloriesBurned,
      duration * 60,
      weight
    );
    return new Blob([fitData], { type: "application/fits" });
  };

  const parameters = [
    {
      label: "Distance",
      value: distance,
      setValue: setDistance,
      unit: "km",
    },
    {
      label: "Duration",
      value: duration,
      setValue: setDuration,
      unit: "min",
    },
    {
      label: "Incline",
      value: inclinePercentage,
      setValue: setInclinePercentage,
      unit: "%",
    },
    {
      label: "Weight",
      value: weight,
      setValue: setWeight,
      unit: "kg",
    },
  ] as const;

  return (
    <>
      {!loggedInName && (
        <div className="p-4">
          <a
            className="inline-block w-auto bg-orange-600 hover:bg-orange-700 text-white hover:text-white font-bold p-2 w-full rounded"
            href={`http://www.strava.com/oauth/authorize?client_id=${
              import.meta.env.VITE_CLIENT_ID
            }&response_type=code&redirect_uri=${
              window.location
            }exchange_token&approval_prompt=force&scope=activity:write,read`}
          >
            Connect strava
          </a>
        </div>
      )}
      {loggedInName && <p>Logged in as {loggedInName}</p>}
      <form
        className="flex flex-col gap-4 p-4 items-start"
        onSubmit={async (e) => {
          e.preventDefault();

          if (uploading) return;

          setUploading(true);
          const fitData = createFitFile(
            distance * 1000,
            altitudeGain,
            caloriesBurned,
            duration * 60,
            weight
          );
          const blob = new Blob([fitData], { type: "application/fits" });

          const promptActivityName = prompt(
            "Enter activity name",
            activityName
          );
          if (!promptActivityName) {
            setUploading(false);
            return;
          }
          setActivityName(promptActivityName);

          try {
            const response = await uploadActivity(promptActivityName, blob);
            const json = await response.json();

            console.log("JSON response: ", json);

            if (json.error) {
              alert(`Error: ${json.error}`);
            } else {
              alert(`Status: ${json.status}`);
            }
          } catch (error) {
            alert("Something went wrong: " + error);
            console.error(error);
          }

          setUploading(false);
        }}
      >
        {parameters.map(({ label, value, setValue, unit }, index) => (
          <div className="flex flex-col gap-2" key={index}>
            <label htmlFor={`${index}`} className="flex justify-between w-full">
              <p>{label}</p>
              <i className="text-gray-400">{unit}</i>
            </label>
            <NumberInput
              id={`${index}`}
              value={value}
              onChange={(newValue) => setValue(newValue)}
              className="rounded-md p-2"
              placeHolder={`${value}`}
            ></NumberInput>
          </div>
        ))}

        <div className="flex w-full">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 w-full rounded disabled:opacity-50 disabled:pointer-events-none"
            disabled={uploading || !loggedInName}
          >
            Upload activity
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 p-2 rounded ml-2"
            onClick={async (e) => {
              e.preventDefault();
              saveAs(await getActivityBlob(), "activity.fit");
            }}
          >
            💾
          </button>
        </div>
      </form>

      <div>
        <h1>Statistics</h1>
        <p>Altitude gain: {altitudeGain.toFixed(1)} m</p>
        <p>Calories burned: {caloriesBurned.toFixed(1)} KCal</p>
      </div>
    </>
  );
}

export default App;
