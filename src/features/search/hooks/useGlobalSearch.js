import { useEffect, useRef, useState } from "react";
import { searchAll, MIN_SEARCH_LENGTH } from "../api/searchApi";

const DEBOUNCE_MS = 350;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function useGlobalSearch(accessToken, query) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cacheRef = useRef(new Map());
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }
    const key = trimmed.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      setData(cached.data);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const result = await searchAll(accessToken, trimmed, controller.signal);
        cacheRef.current.set(key, { data: result, time: Date.now() });
        setData(result);
      } catch (err) {
        if (err.name === "AbortError") return;
        setData(null);
        setError(err.message || "Failed to search.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [accessToken, trimmed]);
  return { data, loading, error, tooShort: trimmed.length < MIN_SEARCH_LENGTH };
}
