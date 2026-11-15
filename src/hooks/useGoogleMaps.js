import { useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (API_KEY) {
  setOptions({ key: API_KEY, v: "weekly" });
}

export function useGoogleMaps() {
  const [maps, setMaps] = useState(null);
  const [error, setError] = useState(
    API_KEY ? "" : "Google Maps API key is missing.",
  );
  useEffect(() => {
    if (!API_KEY) return;
    importLibrary("maps")
      .then(() => setMaps(window.google.maps))
      .catch(() => setError("Failed to load Google Maps."));
  }, []);
  return { maps, error };
}
