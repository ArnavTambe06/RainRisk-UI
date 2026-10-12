export const T = {
  // Colors
  bg:           '#fbf9f5',
  bgLow:        '#f5f3ef',
  bgContainer:  '#efeeea',
  bgHigh:       '#eae8e4',
  bgHighest:    '#e4e2de',
  white:        '#ffffff',
  text:         '#1b1c1a',
  textVariant:  '#424844',
  outline:      '#727973',
  outlineVar:   '#c2c8c2',
  mossDark:     '#173124',
  mossDeep:     '#2d4739',
  mossLight:    '#b0cdbb',
  slate:        '#4a5568',
  terracotta:   '#b85c38',
  terracottaDk: '#742a09',
  terracottaLt: '#ffb59a',
  error:        '#ba1a1a',
  ink:          '#1b1c1a',
  parchment:    '#fdfbf7',

  // Typography
  fontDisplay:  "'EB Garamond', Georgia, serif",
  fontBody:     "'Work Sans', system-ui, sans-serif",
  fontMono:     "'JetBrains Mono', monospace",

  // Risk
  riskHigh:     '#b85c38',
  riskMedium:   '#d4a017',
  riskLow:      '#2d4739',
};

export const riskColor = score =>
  score >= 0.7 ? T.riskHigh : score >= 0.4 ? T.riskMedium : T.riskLow;

export const riskLabel = score =>
  score >= 0.7 ? 'CRITICAL' : score >= 0.4 ? 'ELEVATED' : 'STABLE';

export const riskBg = score =>
  score >= 0.7 ? '#fdf2ee' : score >= 0.4 ? '#fdf8ee' : '#eef4f0';