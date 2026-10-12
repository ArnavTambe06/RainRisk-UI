import { useState, useEffect, useCallback } from "react";
import { DISTRICTS, fetchLiveDistricts } from "../data";

const REFRESH_INTERVAL = 60 * 60 * 1000;  // 1 hour
const POLL_INTERVAL    = 30 * 1000;        // poll every 30s until live

export default function useLiveDistricts() {
  const [districts,   setDistricts]   = useState(DISTRICTS);
  const [status,      setStatus]      = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [obsDate,     setObsDate]     = useState(null);
  const [lagDays,     setLagDays]     = useState(null);
  const [error,       setError]       = useState(null);
  const [isLive,      setIsLive]      = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchLiveDistricts();

      if (data.districts && data.districts.length > 0) {
        const merged = data.districts.map(d => ({
          ...d,
          score: d.risk_score,
        }));
        setDistricts(merged);
        setLastUpdated(new Date());
        setObsDate(data.districts[0]?.obs_date || null);
        setLagDays(data.districts[0]?.data_lag_days ?? null);
        setStatus("live");
        setIsLive(true);
        setError(null);
      }
    } catch {
      setError("API unreachable — showing static data");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Poll every 30 seconds until we get live data
    const poll = setInterval(() => {
      if (!isLive) refresh();
    }, POLL_INTERVAL);

    // Initial fetch
    refresh();

    return () => clearInterval(poll);
  }, [refresh, isLive]);

  // Once live, refresh every hour
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [isLive, refresh]);

  return { districts, status, lastUpdated, obsDate, lagDays, error, refresh };
}
