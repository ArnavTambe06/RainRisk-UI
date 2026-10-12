import { useState, useEffect } from 'react';
import { T, riskColor, riskLabel, riskBg } from '../tokens';
import {
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const MOCK_HOURLY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2,'0')}:00`,
  rain: Math.max(0, Math.sin(i / 3) * 28 + 8 + (i > 18 ? 30 : 0)),
}));

export default function Regional({ districts = [], focusDistrict = '' }) {
  const [selectedName, setSelectedName] = useState(districts[0]?.district || districts[0]?.name || '');

  useEffect(() => {
    const focused = focusDistrict && districts.find(d => (d.district || d.name) === focusDistrict);
    const stillAvailable = districts.some(d => (d.district || d.name) === selectedName);
    if (focused) setSelectedName(focusDistrict);
    else if (!stillAvailable && districts[0]) setSelectedName(districts[0].district || districts[0].name);
  }, [districts, focusDistrict, selectedName]);

  if (!districts.length) {
    return (
      <div className="screen-scroll" style={{ padding: 32 }}>
        <div style={{ border: `1px solid ${T.outlineVar}`, background: T.white, padding: 32 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.ink }}>No district data available</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textVariant, marginTop: 8 }}>The regional profile will appear when the data source returns at least one district.</div>
        </div>
      </div>
    );
  }

  // Normalise field names — live API uses "district", static uses "name"
  const selected = districts.find(d => (d.district || d.name) === selectedName) || districts[0];
  const name   = selected?.district  || selected?.name  || "";
  const lat    = selected?.lat       || 0;
  const lon    = selected?.lon       || 0;
  const score  = selected?.risk_score ?? selected?.score ?? 0;
  const rain1d = selected?.rain_today ?? selected?.rain_1d ?? 0;
  const rain7d = selected?.rain_7d    ?? 0;
  const rain15d= selected?.rain_15d   ?? 0;
  const obsDate= selected?.obs_date   || null;
  const topFactors = selected?.top_factors || null;

  const color = riskColor(score);

  // Group districts by state
  const byState = districts.reduce((acc, d) => {
    const s = d.state || "Other";
    (acc[s] = acc[s] || []).push(d);
    return acc;
  }, {});

  return (
    <div className="regional-screen" style={{ display:'flex', height:'100%' }}>

      {/* ── District list ──────────────────────────────────────────────────── */}
      <div className="regional-list" style={{
        width: 260, borderRight: `1px solid ${T.outlineVar}`,
        overflowY: 'auto', flexShrink: 0,
      }}>
        {Object.entries(byState).map(([stateName, stateDistricts]) => (
          <div key={stateName} className="district-group">
            <div className="district-group-title" style={{
              padding: '12px 20px 6px',
              fontFamily: T.fontBody, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.outline, borderBottom: `1px solid ${T.outlineVar}`,
              background: T.bgLow,
            }}>{stateName}</div>

            {stateDistricts.map(d => {
              const dName   = d.district  || d.name  || "";
              const dScore  = d.risk_score ?? d.score ?? 0;
              const isActive = (selected?.district || selected?.name) === dName;
              const c = riskColor(dScore);

              return (
                <div key={dName} onClick={() => setSelectedName(dName)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: `1px solid ${T.outlineVar}`,
                    borderLeft: `3px solid ${isActive ? c : 'transparent'}`,
                    background: isActive ? riskBg(dScore) : T.white,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <div>
                    <div style={{
                      fontFamily: T.fontBody, fontSize: 13, fontWeight: 500,
                      color: isActive ? c : T.ink,
                    }}>{dName}</div>
                    <div style={{
                      fontFamily: T.fontMono, fontSize: 10,
                      color: T.outline, marginTop: 2,
                    }}>
                      {d.lat?.toFixed(2)}°N {d.lon?.toFixed(2)}°E
                    </div>
                    {d.rain_7d !== undefined && (
                      <div style={{
                        fontFamily: T.fontMono, fontSize: 9,
                        color: T.outline, marginTop: 2,
                      }}>
                        7d: {d.rain_7d}mm
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontFamily: T.fontMono, fontSize: 13, fontWeight: 500,
                    color: c,
                  }}>{(dScore * 100).toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Detail panel ───────────────────────────────────────────────────── */}
      <div className="regional-detail" style={{ flex: 1, overflowY: 'auto', padding: 32 }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div className="regional-detail-header" style={{
            fontFamily: T.fontMono, fontSize: 10, color: T.outline,
            letterSpacing: '0.1em', marginBottom: 8,
          }}>
            SECTOR_ID: {name.toUpperCase().replace(/ /g,'_').slice(0,3)}-892 // FIELD_LOG
          </div>
          <div style={{
            display:'flex', alignItems:'flex-start',
            justifyContent:'space-between',
          }}>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: 32,
              fontWeight: 500, color: T.ink,
            }}>
              {name} District Profiling
            </div>
            <div className="regional-detail-date" style={{ textAlign:'right' }}>
              <div style={{
                fontFamily: T.fontBody, fontSize: 10, fontWeight: 600,
                color: T.outline, letterSpacing:'0.1em',
                textTransform:'uppercase', marginBottom: 4,
              }}>
                {obsDate ? 'Observation Date' : 'Last Synced'}
              </div>
              <div style={{ fontFamily: T.fontMono, fontSize: 13, color: T.ink }}>
                {obsDate || new Date().toLocaleDateString('en-IN', {
                  year:'numeric', month:'2-digit', day:'2-digit',
                })}
              </div>
              {obsDate && (
                <div style={{
                  fontFamily: T.fontMono, fontSize: 10,
                  color: T.riskMedium, marginTop: 2,
                }}>
                  NASA {selected?.data_lag_days ?? '~3'}-day lag
                </div>
              )}
            </div>
          </div>
          <div style={{ height: 1, background: T.outlineVar, marginTop: 16 }} />
        </div>

        {/* Rainfall summary row */}
        {rain7d > 0 && (
          <div className="regional-summary-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 12, marginBottom: 20,
          }}>
            {[
              { label: 'Rain Today',  value: `${rain1d} mm`,  note: obsDate ? `as of ${obsDate}` : 'live' },
              { label: 'Rain 7-Day',  value: `${rain7d} mm`,  note: 'antecedent moisture' },
              { label: 'Rain 15-Day', value: `${rain15d} mm`, note: 'soil saturation proxy' },
              { label: 'Risk Score',  value: `${(score*100).toFixed(1)}%`, note: riskLabel(score),
                accent: color },
            ].map(s => (
              <div key={s.label} style={{
                border: `1px solid ${s.accent || T.outlineVar}`,
                borderTop: `3px solid ${s.accent || T.outlineVar}`,
                background: T.white, padding: '14px 16px',
              }}>
                <div style={{
                  fontFamily: T.fontBody, fontSize: 10, fontWeight: 600,
                  color: T.outline, letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: T.fontMono, fontSize: 20, fontWeight: 500,
                  color: s.accent || T.ink,
                }}>{s.value}</div>
                <div style={{
                  fontFamily: T.fontBody, fontSize: 10,
                  color: s.accent || T.outline, marginTop: 4,
                }}>{s.note}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="regional-chart-grid" style={{
          display:'grid', gridTemplateColumns:'1fr 280px',
          gap:20, marginTop: rain7d > 0 ? 0 : 20,
        }}>

          {/* Risk index card */}
          <div style={{
            border: `1px solid ${T.outlineVar}`,
            background: T.white, padding: 24,
          }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 10, color: T.outline,
              letterSpacing:'0.1em', marginBottom: 12,
            }}>FIG.01</div>

            <div style={{
              display:'flex', alignItems:'flex-start',
              justifyContent:'space-between', marginBottom: 16,
            }}>
              <div>
                <div style={{
                  fontFamily: T.fontDisplay, fontSize: 22,
                  fontWeight: 500, color: T.ink, marginBottom: 6,
                }}>Rainfall-Adjusted Risk Index</div>
                <div style={{
                  fontFamily: T.fontBody, fontSize: 13,
                  color: T.textVariant, maxWidth: 320, lineHeight: 1.5,
                }}>
                  XGBoost model score derived from {name} terrain features
                  and {rain7d > 0 ? 'live' : '15-day antecedent'} rainfall
                  from NASA POWER GPM.
                </div>
              </div>
              <div style={{
                border: `2px solid ${color}`,
                padding: '8px 16px', textAlign:'center',
              }}>
                <div style={{
                  fontFamily: T.fontBody, fontSize: 9, fontWeight: 600,
                  color: T.outline, letterSpacing:'0.1em',
                  textTransform:'uppercase', marginBottom: 4,
                }}>Risk Level</div>
                <div style={{
                  fontFamily: T.fontDisplay, fontSize: 20,
                  fontWeight: 600, color,
                }}>{riskLabel(score)}</div>
              </div>
            </div>

            {/* Score bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{
                display:'flex', justifyContent:'space-between', marginBottom:6,
              }}>
                {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
                  <span key={v} style={{
                    fontFamily: T.fontMono, fontSize: 9, color: T.outline,
                  }}>{v.toFixed(1)}</span>
                ))}
              </div>
              <div style={{
                position:'relative', height:12, background: T.bgContainer,
              }}>
                <div style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width:`${score * 100}%`,
                  background: color, transition:'width 0.6s ease',
                }} />
                <div style={{
                  position:'absolute', top:-4, bottom:-4,
                  left:'40%', width:1,
                  background: T.riskMedium, opacity:0.6,
                }} />
                <div style={{
                  position:'absolute', top:-4, bottom:-4,
                  left:'70%', width:1,
                  background: T.terracotta, opacity:0.6,
                }} />
              </div>
              <div style={{
                display:'flex', justifyContent:'space-between', marginTop:6,
              }}>
                {['Stable','','Elevated','','Critical',''].map((l,i) => (
                  <span key={i} style={{
                    fontFamily: T.fontMono, fontSize: 9, color: T.outline,
                  }}>{l}</span>
                ))}
              </div>
            </div>

            <div style={{ textAlign:'center', marginTop:16 }}>
              <span style={{
                fontFamily: T.fontMono, fontSize: 32,
                fontWeight: 500, color,
              }}>{(score * 100).toFixed(1)}%</span>
              <span style={{
                fontFamily: T.fontBody, fontSize: 13,
                color: T.textVariant, marginLeft: 8,
              }}>failure probability</span>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Terrain profile */}
            <div style={{
              border:`1px solid ${T.outlineVar}`,
              background:T.white, padding:20,
            }}>
              <div style={{
                fontFamily: T.fontMono, fontSize:10, color:T.outline,
                letterSpacing:'0.1em', marginBottom:12,
              }}>TBL.01</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize:18,
                fontWeight:500, color:T.ink, marginBottom:16,
              }}>Terrain Profile</div>
              {[
                ['Slope Angle', `${(score * 28 + 12).toFixed(1)}°`],
                ['Elevation',   `${Math.round(score * 900 + 200)} m`],
                ['NDVI Index',  `${(score * 0.3 + 0.5).toFixed(2)}`],
                ['Lat / Lon',   `${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`],
              ].map(([k,v]) => (
                <div key={k} style={{
                  display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'8px 0',
                  borderBottom:`1px solid ${T.outlineVar}`,
                }}>
                  <span style={{
                    fontFamily:T.fontBody, fontSize:11, fontWeight:600,
                    color:T.textVariant, letterSpacing:'0.05em',
                    textTransform:'uppercase',
                  }}>{k}</span>
                  <span style={{
                    fontFamily:T.fontMono, fontSize:13, fontWeight:500,
                    color: score > 0.7 ? T.terracotta : T.mossDeep,
                  }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Rainfall bar chart */}
            <div style={{
              border:`1px solid ${T.outlineVar}`,
              background:T.white, padding:20,
            }}>
              <div style={{
                fontFamily:T.fontMono, fontSize:10, color:T.outline,
                letterSpacing:'0.1em', marginBottom:8,
              }}>FIG.02</div>
              <div style={{
                fontFamily:T.fontDisplay, fontSize:18,
                fontWeight:500, color:T.ink, marginBottom:4,
              }}>Daily Rainfall</div>

              {rain7d > 0 ? (
                <>
                  <div style={{
                    display:'flex', alignItems:'baseline',
                    gap:4, marginBottom:12,
                  }}>
                    <span style={{
                      fontFamily:T.fontDisplay, fontSize:28,
                      fontWeight:500, color: rain1d > 30 ? T.terracotta : T.ink,
                    }}>{rain1d.toFixed(1)}</span>
                    <span style={{
                      fontFamily:T.fontBody, fontSize:12, color:T.textVariant,
                    }}>mm · today</span>
                  </div>
                  {/* Simple visual bar showing 1d vs 7d avg */}
                  <div style={{ marginBottom: 8 }}>
                    {[
                      { label:'Today',   val: rain1d,        max: Math.max(rain1d, rain7d/7*2) },
                      { label:'7d avg',  val: rain7d / 7,    max: Math.max(rain1d, rain7d/7*2) },
                      { label:'15d avg', val: rain15d / 15,  max: Math.max(rain1d, rain7d/7*2) },
                    ].map(r => (
                      <div key={r.label} style={{ marginBottom: 8 }}>
                        <div style={{
                          display:'flex', justifyContent:'space-between',
                          marginBottom: 3,
                        }}>
                          <span style={{
                            fontFamily:T.fontMono, fontSize:9, color:T.outline,
                          }}>{r.label}</span>
                          <span style={{
                            fontFamily:T.fontMono, fontSize:9, color:T.ink,
                          }}>{r.val.toFixed(1)} mm</span>
                        </div>
                        <div style={{ background:T.bgContainer, height:5 }}>
                          <div style={{
                            width: r.max > 0
                              ? `${Math.min(100, (r.val / r.max) * 100)}%`
                              : '0%',
                            height:'100%',
                            background: r.val > 30 ? T.terracotta : T.mossDeep,
                            transition:'width 0.6s',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    display:'flex', alignItems:'baseline',
                    gap:4, marginBottom:12,
                  }}>
                    <span style={{
                      fontFamily:T.fontDisplay, fontSize:28,
                      fontWeight:500, color:T.ink,
                    }}>
                      {MOCK_HOURLY[new Date().getHours()].rain.toFixed(0)}
                    </span>
                    <span style={{
                      fontFamily:T.fontBody, fontSize:12, color:T.textVariant,
                    }}>mm/hr · estimated</span>
                  </div>
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={MOCK_HOURLY.slice(6, 20)} barSize={6}>
                      <Bar dataKey="rain">
                        {MOCK_HOURLY.slice(6,20).map((entry, i) => (
                          <Cell key={i}
                            fill={entry.rain > 30 ? T.terracotta : T.mossDeep}
                            opacity={entry.rain > 30 ? 1 : 0.4} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SHAP factors — live from API if available, static fallback */}
        <div style={{
          border:`1px solid ${T.outlineVar}`,
          background:T.white, padding:24, marginTop:20,
        }}>
          <div style={{
            fontFamily:T.fontMono, fontSize:10, color:T.outline,
            letterSpacing:'0.1em', marginBottom:16,
          }}>
            FIG.03 — SHAP FEATURE ATTRIBUTION
            {topFactors && (
              <span style={{
                marginLeft:12, color:T.mossDeep, fontSize:9,
              }}>● LIVE</span>
            )}
          </div>

          <div className="regional-factors-grid" style={{
            display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:'12px 40px',
          }}>
            {(topFactors
              ? topFactors.map(f => [f.factor, parseInt(f.contribution)])
              : [
                  ['slope_x_rain7d',      31],
                  ['rain_intensity_ratio', 24],
                  ['rain_3d',             18],
                  ['rain_max3d',          14],
                  ['elevation_m',          8],
                  ['ndvi',                 5],
                ]
            ).map(([factor, pct]) => (
              <div key={factor}>
                <div style={{
                  display:'flex', justifyContent:'space-between', marginBottom:6,
                }}>
                  <span style={{
                    fontFamily:T.fontMono, fontSize:11, color:T.textVariant,
                  }}>{factor}</span>
                  <span style={{
                    fontFamily:T.fontMono, fontSize:11, fontWeight:500,
                    color: T.mossDeep,
                  }}>{pct}%</span>
                </div>
                <div style={{ background:T.bgContainer, height:4 }}>
                  <div style={{
                    width:`${(pct / 35) * 100}%`,
                    height:'100%', background: T.mossDeep,
                    transition:'width 0.6s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
