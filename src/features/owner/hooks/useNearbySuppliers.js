import { useCallback, useEffect, useState } from "react";
import { getNearbySuppliers } from "../api/supplierMapApi";

export function useNearbySuppliers(accessToken, { radius, category, source }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getNearbySuppliers(accessToken, {
          radius,
          category,
          source,
        });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, radius, category, source, reloadKey]);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { data, loading, error, reload };
}
