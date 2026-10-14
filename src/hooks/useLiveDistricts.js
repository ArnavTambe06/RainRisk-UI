import { useState, useEffect, useCallback } from "react";
import { DISTRICTS, fetchLiveDistricts, API_BASE } from "../data";

const REFRESH_INTERVAL = 60 * 60 * 1000;
const POLL_INTERVAL    = 30 * 1000;
const RETRY_INTERVAL   = 10 * 1000;  // retry every 10s on error

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
      // First wake up the server
      const healthRes = await fetch(`${API_BASE}/health`, { 
        signal: AbortSignal.timeout(15000) 
      });
      if (!healthRes.ok) throw new Error("Server not ready");

      // Check cache
      const cacheRes  = await fetch(`${API_BASE}/cache-status`);
      const cacheInfo = await cacheRes.json();

      if (!cacheInfo.ready) {
        setStatus("loading");
        setError(null);
        return;
      }

      // Fetch live data
      const data = await fetchLiveDistricts();
      if (data.districts && data.districts.length > 0) {
        setDistricts(data.districts.map(d => ({ ...d, score: d.risk_score })));
        setLastUpdated(new Date());
        setObsDate(data.districts[0]?.obs_date || null);
        setLagDays(data.districts[0]?.data_lag_days ?? null);
        setStatus("live");
        setIsLive(true);
        setError(null);
      }
    } catch (e) {
      setError("API waking up — retrying...");
      setStatus("loading");  // show loading not error while Render wakes up
    }
  }, []);

  useEffect(() => {
    refresh();
    // Keep polling until live
    const poll = setInterval(() => {
      if (!isLive) refresh();
    }, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [refresh, isLive]);

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [isLive, refresh]);

  return { districts, status, lastUpdated, obsDate, lagDays, error, refresh };
}