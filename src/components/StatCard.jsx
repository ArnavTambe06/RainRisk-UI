import { T } from '../tokens';

export default function StatCard({ index, label, value, unit, sub, accent }) {
  const color = accent || T.ink;
  return (
    <div style={{
      border: `1px solid ${accent ? color : T.outlineVar}`,
      borderTop: accent ? `3px solid ${color}` : `1px solid ${T.outlineVar}`,
      padding: '20px 24px', background: T.white, flex: 1,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 10, color: T.outline,
        letterSpacing: '0.1em', marginBottom: 8,
      }}>{index}</div>
      <div style={{
        fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
        color: T.textVariant, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{
          fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 600,
          color, lineHeight: 1,
        }}>{value}</span>
        {unit && <span style={{
          fontFamily: T.fontBody, fontSize: 14, color: T.textVariant,
        }}>{unit}</span>}
      </div>
      {sub && <div style={{
        fontFamily: T.fontBody, fontSize: 12, color: accent || T.textVariant,
      }}>{sub}</div>}
    </div>
  );
}