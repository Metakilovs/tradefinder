import { useEffect, useState } from "react";

// Returns [lat, lng] once the browser's Geolocation API responds.
// Falls back to Nairobi city center if the user denies permission,
// so the app still works for the demo/presentation.
const NAIROBI_FALLBACK = [-1.286389, 36.817223];

export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(NAIROBI_FALLBACK);
      setError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {
        setError("Location permission denied - showing Nairobi as a default");
        setPosition(NAIROBI_FALLBACK);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { position, error };
}
