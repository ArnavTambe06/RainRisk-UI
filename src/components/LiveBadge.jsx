import { T } from "../tokens";

export default function LiveBadge({ status, lastUpdated, obsDate, lagDays, onRefresh }) {
  const configs = {
    idle:    { color: T.outline,     dot: T.outline,     label: "Initialising" },
    loading: { color: T.riskMedium,  dot: T.riskMedium,  label: "Fetching live data..." },
    live:    { color: "#2d6a4f",     dot: "#2d6a4f",     label: "Live" },
    error:   { color: T.terracotta,  dot: T.terracotta,  label: "Offline" },
  };
  const cfg = configs[status] || configs.idle;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      border: `1px solid ${T.outlineVar}`,
      padding: "6px 14px", background: T.white,
    }}>
      {/* Status pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: cfg.dot,
          boxShadow: status === "live" ? `0 0 0 3px ${cfg.dot}30` : "none",
          animation: status === "loading" ? "pulse 1s infinite" : "none",
        }} />
        <span style={{
          fontFamily: T.fontMono, fontSize: 10, fontWeight: 500,
          color: cfg.color, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{cfg.label}</span>
      </div>

      {/* Data lag notice */}
      {obsDate && (
        <div style={{
          fontFamily: T.fontMono, fontSize: 10, color: T.outline,
          borderLeft: `1px solid ${T.outlineVar}`, paddingLeft: 14,
        }}>
          Data as of {obsDate}
          {lagDays !== null && (
            <span style={{ color: T.riskMedium, marginLeft: 6 }}>
              · {lagDays}d NASA lag
            </span>
          )}
        </div>
      )}

      {/* Last fetched */}
      {lastUpdated && (
        <div style={{
          fontFamily: T.fontMono, fontSize: 10, color: T.outline,
          borderLeft: `1px solid ${T.outlineVar}`, paddingLeft: 14,
        }}>
          Fetched {lastUpdated.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      )}

      {/* Manual refresh */}
      <button onClick={onRefresh} disabled={status === "loading"}
        style={{
          border: `1px solid ${T.outlineVar}`, background: "transparent",
          padding: "3px 10px", cursor: status === "loading" ? "default" : "pointer",
          fontFamily: T.fontBody, fontSize: 10, fontWeight: 600,
          color: status === "loading" ? T.outline : T.ink,
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginLeft: 4,
        }}>
        ↻ Refresh
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}