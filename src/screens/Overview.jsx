import { useMemo, useState } from "react";
import { T, riskColor, riskLabel } from "../tokens";
import StatCard from "../components/StatCard";

const scoreOf = (district) => district.score ?? district.risk_score ?? 0;
const nameOf = (district) => district.district || district.name || "Unknown district";

export default function Overview({ districts = [], onSelectDistrict }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const high = districts.filter((district) => scoreOf(district) >= 0.7);
  const medium = districts.filter((district) => scoreOf(district) >= 0.4 && scoreOf(district) < 0.7);
  const rainfallValues = districts.map((district) => district.rain_7d ?? district.rain7d).filter((value) => Number.isFinite(Number(value)));
  const avgRain7d = rainfallValues.length ? (rainfallValues.reduce((total, value) => total + Number(value), 0) / rainfallValues.length).toFixed(1) : "—";

  const visibleDistricts = useMemo(() => districts.filter((district) => {
    const score = scoreOf(district);
    return filter === "all" || (filter === "critical" && score >= 0.7) || (filter === "elevated" && score >= 0.4 && score < 0.7) || (filter === "stable" && score < 0.4);
  }), [districts, filter]);
  const selectedDistrict = districts.find((district) => nameOf(district) === selected) || null;

  const chooseDistrict = (district) => {
    const name = nameOf(district);
    setSelected(name);
    onSelectDistrict?.(name);
  };

  return (
    <div className="overview-screen">
      <div className="overview-stats">
        <StatCard index="ID-01A" label="Avg 7-Day Rainfall" value={avgRain7d} unit={avgRain7d === "—" ? "" : "mm"} sub={rainfallValues.length ? `Across ${rainfallValues.length} reporting districts` : "Awaiting live rainfall telemetry"} />
        <div className="overview-stat-divider" />
        <StatCard index="WRN-04" label="Critical-Risk Districts" value={high.length} unit="districts" sub={high.length ? high.map(nameOf).join(", ") : "All districts within safe range"} accent={high.length ? T.terracotta : undefined} />
        <div className="overview-stat-divider" />
        <StatCard index="WRN-05" label="Elevated-Risk Districts" value={medium.length} unit="districts" sub={medium.length ? medium.map(nameOf).join(", ") : "No elevated zones"} accent={medium.length ? T.riskMedium : undefined} />
        <div className="overview-stat-divider" />
        <StatCard index="MOD-9X" label="Model AUC" value="0.86" unit="" sub="CV 0.8495 ± 0.05 · XGBoost" />
      </div>

      <div className="overview-map">
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(114,121,115,.08) 39px, rgba(114,121,115,.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(114,121,115,.08) 39px, rgba(114,121,115,.08) 40px), #f5f3ef" }} />
        <div className="map-caption" style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.slate, letterSpacing: ".15em", textTransform: "uppercase" }}>Observatory Overview · Western Ghats Region</div>
        <div className="map-toolbar" role="group" aria-label="Map risk filter">
          {["all", "critical", "elevated", "stable"].map((option) => (
            <button key={option} type="button" className="soft-button map-filter-button" onClick={() => setFilter(option)} style={{ color: filter === option ? T.parchment : T.ink, background: filter === option ? T.mossDeep : T.white, borderColor: filter === option ? T.mossDeep : T.outlineVar }}>{option}</button>
          ))}
        </div>

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Western Ghats district risk map">
          <text x="740" y="44" fontFamily={T.fontMono} fontSize="10" fill={T.slate} textAnchor="middle">N</text>
          <line x1="740" y1="48" x2="740" y2="70" stroke={T.slate} strokeWidth="1" /><polygon points="737,48 743,48 740,38" fill={T.slate} />
          <rect x="560" y="360" width="220" height="120" fill={T.white} stroke={T.outlineVar} strokeWidth="1" />
          <text x="572" y="380" fontFamily={T.fontBody} fontSize="10" fontWeight="600" fill={T.slate} letterSpacing="1">RISK LEVEL</text>
          {[[T.terracotta, "Critical (≥70%)"], [T.riskMedium, "Elevated (40–69%)"], [T.mossDeep, "Stable (&lt;40%)"]].map(([color, label], index) => (
            <g key={label} transform={`translate(572,${398 + index * 22})`}>
              <rect width="14" height="14" fill={color} /><text x="22" y="11" fontFamily={T.fontBody} fontSize="11" fill={T.textVariant}>{label}</text>
            </g>
          ))}
          {visibleDistricts.map((district) => {
            const score = scoreOf(district);
            const name = nameOf(district);
            const x = ((Number(district.lon ?? 76) - 73) / 5) * 640 + 80;
            const y = ((15 - Number(district.lat ?? 12)) / 5.5) * 360 + 60;
            const color = riskColor(score);
            const isHovered = hovered === name;
            const radius = score >= 0.7 ? 11 : score >= 0.4 ? 8 : 6;
            return (
              <g key={name} transform={`translate(${x},${y})`} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered(null)} onClick={() => chooseDistrict(district)}>
                {score >= 0.7 && <circle r={radius + 8} fill={color} opacity=".15" />}
                <circle r={radius + 4} fill={color} opacity=".12" /><circle r={radius} fill={color} stroke={T.white} strokeWidth="1.5" />
                {(isHovered || score >= 0.7) && <g>
                  <rect x="10" y="-28" width={Math.max(100, name.length * 7 + 60)} height="44" fill={T.white} stroke={color} strokeWidth="1" />
                  <text x="18" y="-11" fontFamily={T.fontMono} fontSize="10" fill={color} fontWeight="500">{name}</text>
                  <text x="18" y="4" fontFamily={T.fontMono} fontSize="10" fill={T.slate}>{(score * 100).toFixed(0)}% · {riskLabel(score)}</text>
                </g>}
              </g>
            );
          })}
        </svg>

        {selectedDistrict && <div className="map-selected-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase" }}>Selected district</div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.ink, marginTop: 3 }}>{nameOf(selectedDistrict)}</div>
            </div>
            <button type="button" className="icon-button" aria-label="Close district preview" onClick={() => setSelected(null)} style={{ width: 24, height: 24, border: 0, background: "transparent" }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline", marginTop: 12 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 25, color: riskColor(scoreOf(selectedDistrict)) }}>{(scoreOf(selectedDistrict) * 100).toFixed(0)}%</span>
            <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textVariant }}>{riskLabel(scoreOf(selectedDistrict))} · {selectedDistrict.state}</span>
          </div>
          <button type="button" className="outline-button" onClick={() => onSelectDistrict?.(nameOf(selectedDistrict))} style={{ marginTop: 12, padding: "6px 9px", fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Open full profile →</button>
        </div>}

        <div className="map-footer" style={{ borderTop: `1px solid ${T.outlineVar}`, background: T.white, padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.slate }}>{visibleDistricts.length} of {districts.length} districts · {filter === "all" ? "all risk levels" : `${filter} only`}</span>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.slate }}>Source: NASA POWER GPM · {new Date().toLocaleDateString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
