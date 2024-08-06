import { useStravaAuth } from "./providers/StravaAuth.tsx";

import "./App.css";
import { useSessionStorage } from "usehooks-ts";
import { calculateAltitudeGain, calculateCaloriesBurned } from "./util.ts";
function App() {
  const { accesToken, refreshToken, expiresA, loggedInName } = useStravaAuth();

  const [distance, setDistance] = useSessionStorage("last_distance", 2.6);
  const [duration, setDuration] = useSessionStorage("last_duration", 30);
  const [inclinePercentage, setInclinePercentage] = useSessionStorage(
    "last_incline",
    13.37
  );
  const [weight, setWeight] = useSessionStorage("last_weight", 72);

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
        <>
          <a
            className="inline-block w-auto bg-orange-600 hover:bg-orange-700 text-white hover:text-white font-bold p-2 mt-4 w-full rounded mb-2"
            href={`http://www.strava.com/oauth/authorize?client_id=${
              import.meta.env.VITE_CLIENT_ID
            }&response_type=code&redirect_uri=${
              window.location
            }exchange_token&approval_prompt=force&scope=read`}
          >
            Connect strava
          </a>
        </>
      )}
      {loggedInName && <p>Logged in as {loggedInName}</p>}
      <form className="flex flex-col gap-4 p-4 items-start">
        {parameters.map(({ label, value, setValue, unit }, index) => (
          <div className="flex flex-col gap-2" key={index}>
            <label htmlFor={`${index}`} className="flex justify-between w-full">
              <p>{label}</p>
              <i className="text-gray-400">{unit}</i>
            </label>
            <input
              id={`${index}`}
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="border-2 border-black rounded-md p-2"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 mt-4 w-full rounded"
        >
          Upload activity
        </button>
      </form>

      <div>
        <h1>Statistics</h1>
        <p>
          Altitude gain:{" "}
          {calculateAltitudeGain(inclinePercentage, distance).toFixed(1)} km
        </p>
        <p>
          Calories burned:{" "}
          {calculateCaloriesBurned(
            duration,
            inclinePercentage,
            distance,
            weight
          ).toFixed(1)}{" "}
          KCal
        </p>
      </div>
    </>
  );
}

export default App;
