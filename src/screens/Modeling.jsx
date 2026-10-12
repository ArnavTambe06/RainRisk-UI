import { useMemo, useState } from "react";
import { T, riskColor, riskLabel } from "../tokens";
import { DISTRICTS } from "../data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from "recharts";

const FORECAST = Array.from({ length: 13 }, (_, index) => ({
  t: `T+${String(index * 6).padStart(2, "0")}`,
  score: Math.min(0.99, 0.3 + (index / 12) * 0.65 + Math.sin(index) * 0.06),
}));

const estimateLocally = (form) => {
  const weighted = Number(form.rain1d) * 0.006 + Number(form.rain3d) * 0.002 + Number(form.rain7d) * 0.0018 + Number(form.rain15d) * 0.0005 + Number(form.rainMax3d) * 0.002;
  const riskScore = Math.min(0.99, Math.max(0.04, weighted));
  return {
    risk_score: Number(riskScore.toFixed(3)),
    risk_level: riskScore >= 0.7 ? "HIGH" : riskScore >= 0.4 ? "MEDIUM" : "LOW",
    top_factors: [
      ["rain_7d", Number(form.rain7d) * 0.28],
      ["rain_15d", Number(form.rain15d) * 0.22],
      ["rain_1d", Number(form.rain1d) * 0.2],
      ["rain_max3d", Number(form.rainMax3d) * 0.16],
    ].map(([factor, value]) => ({ factor, contribution: `${Math.min(39, Math.max(4, Math.round(value)))}%` })),
  };
};

export default function Modeling({ districts = [] }) {
  const districtOptions = districts.length ? districts : DISTRICTS;
  const [form, setForm] = useState({ district: "Wayanad", rain1d: 52.62, rain3d: 66.58, rain7d: 194.2, rain15d: 374.8, rainMax3d: 52.62 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLocalEstimate, setIsLocalEstimate] = useState(false);

  const score = Number(result?.risk_score ?? 0);
  const color = riskColor(result ? score : 0);
  const forecast = useMemo(() => FORECAST.map((point, index) => ({ ...point, score: result ? Math.min(0.99, Math.max(0.03, score - 0.22 + (index / 12) * 0.28 + Math.sin(index) * 0.04)) : point.score })), [result, score]);

  const predict = async () => {
    setLoading(true);
    setError(null);
    setIsLocalEstimate(false);
    const payload = {
      district: form.district,
      date: new Date().toISOString().split("T")[0],
      rain_1d: Number(form.rain1d), rain_3d: Number(form.rain3d), rain_7d: Number(form.rain7d), rain_15d: Number(form.rain15d), rain_max3d: Number(form.rainMax3d), is_monsoon: 1,
    };
    try {
      const response = await fetch("http://localhost:8000/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setResult({ ...data, top_factors: data.top_factors || [] });
    } catch {
      setResult(estimateLocally(form));
      setIsLocalEstimate(true);
      setError("Live model unavailable · showing a local estimate from the entered rainfall values");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, unit }) => (
    <label style={{ borderBottom: `1px solid ${T.outlineVar}`, paddingBottom: 12 }}>
      <span style={{ display: "block", fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <input type="number" min="0" step="0.1" value={form[k]} onChange={(event) => setForm((current) => ({ ...current, [k]: event.target.value }))} style={{ border: "none", borderBottom: `1px solid ${T.outlineVar}`, background: "transparent", outline: "none", fontFamily: T.fontMono, fontSize: 18, color: T.ink, width: 100, paddingBottom: 2 }} />
        <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textVariant }}>{unit}</span>
      </span>
    </label>
  );

  return (
    <div className="modeling-layout">
      <div className="modeling-main">
        {result && result.risk_level === "HIGH" && <div style={{ background: T.terracotta, padding: "12px 32px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}><span style={{ color: T.parchment, fontSize: 16 }}>△</span><div><strong style={{ fontFamily: T.fontBody, fontSize: 11, color: T.parchment, letterSpacing: ".1em", textTransform: "uppercase" }}>Critical advisory · </strong><span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.parchment }}>{form.district} showing rapid saturation. Model predicts {(score * 100).toFixed(0)}% failure probability.</span></div></div>}

        <div className="modeling-scroll">
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline, letterSpacing: ".1em", marginBottom: 8 }}>INFERENCE WORKBENCH · RAINFALL SCENARIO</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 32, color: T.ink, marginBottom: 6 }}>Test a field scenario</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textVariant, lineHeight: 1.6, maxWidth: 650 }}>Enter recent rainfall telemetry to estimate failure probability and inspect the variables driving the score.</div>
          </div>

          <div className="modeling-grid">
            <div style={{ border: `1px solid ${T.outlineVar}`, background: T.white, padding: 24 }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline, letterSpacing: ".1em", marginBottom: 16 }}>FIG. 01 · 72-HOUR PROBABILITY FORECAST</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={forecast} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.terracotta} stopOpacity={.3} /><stop offset="95%" stopColor={T.terracotta} stopOpacity={.02} /></linearGradient></defs>
                  <CartesianGrid stroke={T.outlineVar} strokeDasharray="4 4" />
                  <XAxis dataKey="t" tick={{ fontFamily: T.fontMono, fontSize: 10, fill: T.outline }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fontFamily: T.fontMono, fontSize: 10, fill: T.outline }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={.7} stroke={T.terracotta} strokeDasharray="4 2" label={{ value: "Critical threshold", fill: T.terracotta, fontSize: 10, fontFamily: T.fontMono }} />
                  <Area type="monotone" dataKey="score" stroke={T.terracotta} strokeWidth={1.5} fill="url(#forecast-fill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ border: `1px solid ${T.outlineVar}`, background: T.white, padding: 24 }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.outline, letterSpacing: ".1em", marginBottom: 16 }}>RECENT SENSOR TELEMETRY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${T.outlineVar}`, paddingBottom: 8, marginBottom: 8 }}>{["Node ID", "Rain (mm)", "Risk Δ"].map((heading) => <span key={heading} style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase" }}>{heading}</span>)}</div>
              {[["N-104", "52.6", "+0.4", T.terracotta], ["N-105", "27.3", "+0.1", T.riskMedium], ["N-106", "8.1", "0.0", T.mossDeep]].map(([id, rain, delta, sensorColor]) => <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 0", borderBottom: `1px solid ${T.outlineVar}` }}><span style={{ fontFamily: T.fontMono, fontSize: 13, color: T.ink }}>{id}</span><span style={{ fontFamily: T.fontMono, fontSize: 13, color: sensorColor }}>{rain}</span><span style={{ fontFamily: T.fontMono, fontSize: 13, color: sensorColor }}>{delta}</span></div>)}
            </div>
          </div>
        </div>
      </div>

      <aside className="modeling-side">
        <div style={{ padding: 24, borderBottom: `1px solid ${T.outlineVar}` }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 500, color: T.ink, marginBottom: 20 }}>Model Parameters</div>
          <label style={{ display: "block", marginBottom: 16 }}><span style={{ display: "block", fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>District</span><select value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.outlineVar}`, background: "transparent", outline: "none", fontFamily: T.fontMono, fontSize: 14, color: T.ink, paddingBottom: 4, cursor: "pointer" }}>{districtOptions.map((district) => { const name = district.district || district.name; return <option key={name} value={name}>{name}</option>; })}</select></label>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}><Field label="Rain today" k="rain1d" unit="mm" /><Field label="Rain 3-day" k="rain3d" unit="mm" /><Field label="Rain 7-day" k="rain7d" unit="mm" /><Field label="Rain 15-day" k="rain15d" unit="mm" /><Field label="Maximum 3-day" k="rainMax3d" unit="mm" /></div>
          <button type="button" onClick={predict} disabled={loading} style={{ width: "100%", marginTop: 24, padding: "12px 0", border: "none", background: loading ? T.outlineVar : T.mossDeep, color: T.parchment, fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", cursor: loading ? "default" : "pointer" }}>{loading ? "Calculating..." : "Run inference"}</button>
          {error && <div style={{ marginTop: 12, padding: "10px 12px", border: `1px solid ${isLocalEstimate ? T.riskMedium : T.terracotta}`, background: isLocalEstimate ? "#fdf8ee" : "#fdf2ee", fontFamily: T.fontBody, fontSize: 12, color: isLocalEstimate ? T.textVariant : T.terracottaDk }}>{error}</div>}
        </div>

        {result ? <div style={{ padding: 24 }}>
          <div style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>Inference result</div>
          <div style={{ border: `2px solid ${color}`, padding: 16, textAlign: "center", marginBottom: 20 }}><div style={{ fontFamily: T.fontMono, fontSize: 42, fontWeight: 500, color, lineHeight: 1 }}>{(score * 100).toFixed(1)}</div><div style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4 }}>% {riskLabel(score)}</div></div>
          <div style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.outline, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>Top contributing features</div>
          {(result.top_factors || []).map((factor, index) => { const contribution = String(factor.contribution ?? "0%"); const width = Math.min(100, Number.parseInt(contribution, 10) * 2.5 || (index + 1) * 15); return <div key={`${factor.factor}-${index}`} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}><span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.textVariant }}>{factor.factor}</span><span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.mossDeep }}>{contribution}</span></div><div style={{ background: T.bgContainer, height: 3 }}><div style={{ width: `${width}%`, height: "100%", background: T.mossDeep }} /></div></div>; })}
        </div> : <div style={{ padding: 24, fontFamily: T.fontBody, fontSize: 13, color: T.textVariant, lineHeight: 1.6 }}>Your score and feature attribution will appear here after you run an inference.</div>}
      </aside>
    </div>
  );
}
