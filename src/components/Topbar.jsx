import { useMemo, useState } from "react";
import { T } from "../tokens";

export default function Topbar({ title, liveProps, districts = [], onPickDistrict, onMenu }) {
  const { status, lastUpdated, obsDate, lagDays, error, refresh } = liveProps || {};
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const statusCfg = {
    idle: { color: T.outline, dot: T.outline, label: "Initialising" },
    loading: { color: T.riskMedium, dot: T.riskMedium, label: "Fetching" },
    live: { color: "#2d6a4f", dot: "#2d6a4f", label: "Live" },
    error: { color: T.terracotta, dot: T.terracotta, label: "Offline" },
  };
  const cfg = statusCfg[status] || statusCfg.idle;
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? districts.filter((district) => district.toLowerCase().includes(normalized)).slice(0, 6) : [];
  }, [districts, query]);

  const selectDistrict = (district) => {
    setQuery("");
    setSearchOpen(false);
    onPickDistrict?.(district);
  };

  return (
    <header style={{ borderBottom: `1px solid ${T.outlineVar}`, background: T.white, flexShrink: 0 }}>
      <div style={{ minHeight: 60, padding: "0 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button type="button" className="icon-button topbar-menu" aria-label="Open navigation" onClick={onMenu} style={{ display: "none", width: 34, height: 34, fontSize: 17 }}>☰</button>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 500, color: T.ink, flex: 1, minWidth: 150 }}>{title}</div>

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${T.outlineVar}`, padding: "7px 12px", background: T.bg, width: 250 }}>
            <span aria-hidden="true" style={{ color: T.outline, fontSize: 14 }}>⌕</span>
            <input
              aria-label="Search districts"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); if (event.key === "Enter" && results[0]) selectDistrict(results[0]); }}
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: T.fontBody, fontSize: 12, color: T.text, flex: 1, minWidth: 0 }}
              placeholder="Search district..."
            />
          </div>
          {searchOpen && query.trim() && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10, background: T.white, border: `1px solid ${T.outlineVar}`, boxShadow: "0 8px 20px rgba(23,49,36,.12)" }}>
              {results.length ? results.map((district) => (
                <button key={district} type="button" onMouseDown={() => selectDistrict(district)} style={{ display: "block", width: "100%", padding: "10px 12px", border: 0, borderBottom: `1px solid ${T.outlineVar}`, background: T.white, color: T.ink, textAlign: "left", cursor: "pointer", fontFamily: T.fontBody, fontSize: 12 }}>
                  {district}<span style={{ display: "block", marginTop: 2, color: T.outline, fontFamily: T.fontMono, fontSize: 9 }}>Open district profile</span>
                </button>
              )) : <div style={{ padding: "11px 12px", fontFamily: T.fontBody, fontSize: 12, color: T.outline }}>No matching district</div>}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${cfg.color}30`, background: `${cfg.color}10`, padding: "5px 11px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, animation: status === "loading" ? "spin-pulse 1s infinite" : "none" }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, color: cfg.color, letterSpacing: "0.1em" }}>{cfg.label}</span>
        </div>
        <button type="button" className="icon-button" aria-label="Field unit profile" style={{ width: 34, height: 34, fontSize: 14 }}>WG</button>
      </div>

      <div style={{ borderTop: `1px solid ${T.outlineVar}`, padding: "5px 32px", minHeight: 29, display: "flex", alignItems: "center", gap: 18, background: error ? "#fdf2ee" : T.bgLow }}>
        {error ? (
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.terracotta }}>△ {error}</span>
        ) : (
          <>
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline }}>
              NASA POWER GPM · {obsDate ? <>Observation date: <strong>{obsDate}</strong></> : status === "loading" ? "Syncing observation data" : "Static field baseline"}
            </span>
            {lagDays !== null && lagDays !== undefined && <span className="topbar-lag" style={{ fontFamily: T.fontMono, fontSize: 10, color: T.riskMedium }}>· {lagDays}-day reporting lag</span>}
            {lastUpdated && <span className="topbar-updated" style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline }}>· Refreshed {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</span>}
          </>
        )}
        <button type="button" onClick={refresh} disabled={status === "loading"} className="outline-button" style={{ marginLeft: "auto", padding: "3px 9px", fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>↻ Refresh</button>
      </div>

      <style>{`
        @keyframes spin-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.8); } }
        @media (max-width: 680px) {
          .topbar-menu { display: block !important; }
          header > div:first-child { padding: 0 16px !important; gap: 10px !important; }
          header > div:first-child > div:nth-child(2) { font-size: 18px !important; min-width: 0 !important; }
          header > div:first-child > div:nth-child(3) { width: 34px !important; }
          header > div:first-child > div:nth-child(3) > div { width: 34px !important; padding: 7px 8px !important; }
          header > div:first-child > div:nth-child(3) input { display: none; }
          header > div:first-child > div:nth-child(3) span { margin: 0 auto; }
          header > div:first-child > div:nth-child(4) span { display: none; }
          header > div:first-child > div:nth-child(4) { padding: 8px; }
          header > div:first-child > button:last-child { display: none; }
          header > div:nth-child(2) { padding: 5px 16px !important; overflow: hidden; white-space: nowrap; }
          .topbar-lag, .topbar-updated { display: none; }
        }
      `}</style>
    </header>
  );
}
