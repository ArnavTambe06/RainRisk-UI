import { useMemo, useState } from "react";
import { T, riskColor, riskLabel } from "../tokens";
import { ARCHIVE_EVENTS, DISTRICTS } from "../data";

const scoreOf = (district) => district.score ?? district.risk_score ?? 0;
const nameOf = (district) => district.district || district.name || "Unknown district";

export default function Alerts({ districts = DISTRICTS, onSelectDistrict }) {
  const [expanded, setExpanded] = useState(0);
  const [showArchive, setShowArchive] = useState(false);
  const [onlyCritical, setOnlyCritical] = useState(false);
  const high = useMemo(() => districts.filter((district) => scoreOf(district) >= 0.7).sort((a, b) => scoreOf(b) - scoreOf(a)), [districts]);
  const medium = useMemo(() => districts.filter((district) => scoreOf(district) >= 0.4 && scoreOf(district) < 0.7).sort((a, b) => scoreOf(b) - scoreOf(a)), [districts]);
  const stable = districts.length - high.length - medium.length;
  const primary = high[0] || medium[0] || districts[0];

  return (
    <div className="alerts-screen">
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline, letterSpacing: ".12em", marginBottom: 8 }}>FIELD OPERATIONS · SIGNAL REGISTER</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 500, color: T.ink, marginBottom: 8 }}>Active alerts</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 15, color: T.textVariant, lineHeight: 1.6, maxWidth: 630 }}>Current surveillance of geological instability across the Western Ghats. Signals are derived from model inference on rainfall and terrain conditions.</div>
          </div>
          <button type="button" className="outline-button" onClick={() => setOnlyCritical((current) => !current)} style={{ padding: "9px 12px", fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{onlyCritical ? "Show all signals" : "Critical only"}</button>
        </div>
      </div>

      <div className="alert-metric-grid" style={{ marginBottom: 24 }}>
        {[["Critical", high.length, T.terracotta], ["Elevated", medium.length, T.riskMedium], ["Stable", stable, T.mossDeep]].map(([label, value, color]) => <div key={label} style={{ border: `1px solid ${color}55`, borderTop: `3px solid ${color}`, background: T.white, padding: "14px 16px" }}><div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.outline, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>{label} districts</div><div style={{ fontFamily: T.fontMono, fontSize: 28, color, marginTop: 6 }}>{value}</div></div>)}
      </div>

      {!districts.length ? <div style={{ border: `1px solid ${T.outlineVar}`, background: T.white, padding: 28, fontFamily: T.fontBody, color: T.textVariant }}>No alert signals are available right now.</div> : <div className="alerts-grid" style={{ marginBottom: 32 }}>
        <div style={{ border: `1px solid ${T.outlineVar}`, borderTop: `3px solid ${riskColor(scoreOf(primary))}`, background: T.white, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <div style={{ background: riskColor(scoreOf(primary)), padding: "4px 10px", fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.parchment, letterSpacing: ".1em", textTransform: "uppercase" }}>◉ {riskLabel(scoreOf(primary))} RISK</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</div>
          </div>
          <button type="button" onClick={() => onSelectDistrict?.(nameOf(primary))} style={{ border: 0, background: "transparent", padding: 0, color: riskColor(scoreOf(primary)), fontFamily: T.fontDisplay, fontSize: 27, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>{nameOf(primary)}, {primary.state} →</button>
          <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textVariant, lineHeight: 1.7, margin: "12px 0 20px" }}>{scoreOf(primary) >= 0.7 ? "Rainfall-adjusted risk has crossed the critical field threshold. Immediate verification is recommended for settlements in exposed valley zones." : "No critical signal is active. This is the highest current district signal and should be monitored as rainfall conditions change."}</div>
          <div style={{ borderTop: `1px solid ${T.outlineVar}`, paddingTop: 16 }} className="alert-metric-grid">
            {[["Risk score", `${(scoreOf(primary) * 100).toFixed(1)}%`, riskColor(scoreOf(primary))], ["Rain 7-day", primary.rain_7d ? `${primary.rain_7d} mm` : "—", T.terracottaDk], ["Confidence", scoreOf(primary) >= .7 ? "HIGH" : "WATCH", T.mossDeep]].map(([label, value, color]) => <div key={label}><div style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div><div style={{ fontFamily: T.fontMono, fontSize: 15, fontWeight: 500, color }}>{value}</div></div>)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(onlyCritical ? high.slice(1, 3) : [...high.slice(1, 3), ...medium.slice(0, 1)]).map((district, index) => <button type="button" key={nameOf(district)} onClick={() => onSelectDistrict?.(nameOf(district))} style={{ border: `1px solid ${T.outlineVar}`, borderLeft: `3px solid ${riskColor(scoreOf(district))}`, background: T.white, padding: 16, flex: 1, textAlign: "left", cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}><span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.outline, letterSpacing: ".1em" }}>IDX-{4090 + index} · {riskLabel(scoreOf(district))}</span><span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.outline }}>{index + 1}h ago</span></div><div style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 500, color: T.ink, marginBottom: 8 }}>{nameOf(district)}</div><div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textVariant, lineHeight: 1.5 }}>Risk score {(scoreOf(district) * 100).toFixed(0)}%. Open district profile for the latest field context.</div></button>)}
          {!high.slice(1, 3).length && !medium.length && <div style={{ border: `1px solid ${T.outlineVar}`, background: T.bgLow, padding: 16, fontFamily: T.fontBody, fontSize: 13, color: T.textVariant }}>No secondary signals need attention.</div>}
        </div>
      </div>}

      <div style={{ borderTop: `1px solid ${T.outlineVar}`, paddingTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 18, marginBottom: 20 }}>
          <div><div style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 500, color: T.ink, marginBottom: 4 }}>Archival event register</div><div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textVariant }}>Historical timeline of significant slip events · Western Ghats 2018–2024</div></div>
          <button type="button" className="outline-button" onClick={() => setShowArchive((current) => !current)} style={{ padding: "8px 12px", fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", whiteSpace: "nowrap" }}>{showArchive ? "Collapse archive" : "View full archive"}</button>
        </div>
        <div>
          {(showArchive ? ARCHIVE_EVENTS : ARCHIVE_EVENTS.slice(0, 3)).map((event, index) => <button type="button" key={event.title} onClick={() => setExpanded(expanded === index ? -1 : index)} style={{ display: "flex", width: "100%", gap: 24, padding: "20px 0", border: 0, borderBottom: `1px solid ${T.outlineVar}`, background: "transparent", cursor: "pointer", textAlign: "left" }}><div style={{ flexShrink: 0, paddingTop: 2 }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${index === 0 ? T.terracotta : T.outline}`, marginTop: 4, background: index === 0 ? T.terracotta : T.white }} /></div><div style={{ flex: 1 }}><div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.outline, letterSpacing: ".08em", marginBottom: 6 }}>{event.date}</div><div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 500, color: index === 0 ? T.terracotta : T.ink, marginBottom: expanded === index ? 12 : 0 }}>{event.title}</div>{expanded === index && <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textVariant, lineHeight: 1.7 }}>{event.desc}</div>}</div><span aria-hidden="true" style={{ fontFamily: T.fontMono, color: T.outline }}>{expanded === index ? "−" : "+"}</span></button>)}
        </div>
      </div>
    </div>
  );
}
