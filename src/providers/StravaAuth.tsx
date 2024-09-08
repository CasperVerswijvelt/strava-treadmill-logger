import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type StravaAuthType = {
  loggedInName: string;
  uploadActivity: (name: string, activityFile: Blob) => Promise<Response>;
};

export const StravaAuthContext = createContext<StravaAuthType>({
  loggedInName: "",
  uploadActivity: () => Promise.reject("No context"),
});

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
window.history.replaceState({}, "", window.location.origin);

export const StravaAuthProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [accesToken, setAccessToken] = useLocalStorage("access-token", "");
  const [refreshToken, setRefreshToken] = useLocalStorage("refresh-token", "");
  const [expiresAt, setExpiresAt] = useLocalStorage("expires-at", 0);

  const [loggedInName, setLoggedInName] = useState("");

  const syncLoggedInName = async (overrrideAccesToken?: string) => {
    const accessTokenToUse = overrrideAccesToken || accesToken;
    console.log("Syncing logged in name ", accessTokenToUse);
    if (accessTokenToUse) {
      const json = await fetch("https://www.strava.com/api/v3/athlete", {
        headers: {
          Authorization: `Bearer ${accessTokenToUse}`,
        },
      }).then((response) => response.json());
      setLoggedInName(json["firstname"]);
    } else {
      setLoggedInName("");
    }
  };

  const refreshAccessToken = async () => {
    if (refreshToken && expiresAt) {
      let formData = new FormData();
      formData.append("client_id", import.meta.env.VITE_CLIENT_ID);
      formData.append("client_secret", import.meta.env.VITE_CLIENT_SECRET);
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", refreshToken);
      fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        body: formData,
      }).then(handleAuthResponse);
    }
  };

  const handleAuthResponse = async (response: Response) => {
    let newAccessToken = "";
    if (response.status === 200) {
      console.log("ok response");
      const json = await response.json();
      newAccessToken = json["access_token"];
      setAccessToken(newAccessToken);
      setRefreshToken(json["refresh_token"]);
      setExpiresAt(json["expires_at"]);
    } else {
      console.log("bad response: ", response);
      setAccessToken("");
      setRefreshToken("");
      setExpiresAt(0);
    }

    await syncLoggedInName(newAccessToken);
  };

  const uploadActivity = async (name: string, activityFile: Blob) => {
    const formData = new FormData();
    formData.append("file", activityFile);
    formData.append("name", name);
    formData.append("data_type", "fit");
    return await fetch("https://www.strava.com/api/v3/uploads", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accesToken}`,
      },
    });
  };

  useEffect(() => {
    if (code) {
      let formData = new FormData();
      formData.append("client_id", import.meta.env.VITE_CLIENT_ID);
      formData.append("client_secret", import.meta.env.VITE_CLIENT_SECRET);
      formData.append("code", code);
      fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        body: formData,
      }).then(handleAuthResponse);
    } else if (expiresAt) {
      console.log("Refreshing token");
      refreshAccessToken();
    } else if (accesToken) {
      syncLoggedInName();
    }
  }, []);

  return (
    <StravaAuthContext.Provider
      value={{
        loggedInName,
        uploadActivity,
      }}
    >
      {children}
    </StravaAuthContext.Provider>
  );
};

export const useStravaAuth = () => {
  return useContext(StravaAuthContext);
};
