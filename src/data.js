export const DISTRICTS = [
  { name:'Wayanad',          state:'Kerala',      score:0.87, lat:11.6854, lon:76.1320 },
  { name:'Idukki',           state:'Kerala',      score:0.74, lat:9.9189,  lon:77.1025 },
  { name:'Malappuram',       state:'Kerala',      score:0.61, lat:11.0730, lon:76.0740 },
  { name:'Kozhikode',        state:'Kerala',      score:0.55, lat:11.2588, lon:75.7804 },
  { name:'Thrissur',         state:'Kerala',      score:0.42, lat:10.5276, lon:76.2144 },
  { name:'Kodagu',           state:'Karnataka',   score:0.79, lat:12.3375, lon:75.8069 },
  { name:'Chikmagalur',      state:'Karnataka',   score:0.66, lat:13.3161, lon:75.7720 },
  { name:'Uttara Kannada',   state:'Karnataka',   score:0.58, lat:14.7860, lon:74.6948 },
  { name:'Shivamogga',       state:'Karnataka',   score:0.49, lat:13.9299, lon:75.5681 },
  { name:'Dakshina Kannada', state:'Karnataka',   score:0.53, lat:12.8438, lon:75.2479 },
  { name:'Ratnagiri',        state:'Maharashtra', score:0.71, lat:17.0,    lon:73.3    },
  { name:'Sindhudurg',       state:'Maharashtra', score:0.44, lat:16.3,    lon:73.9    },
  { name:'Satara',           state:'Maharashtra', score:0.62, lat:17.6805, lon:74.0183 },
  { name:'Raigad',           state:'Maharashtra', score:0.68, lat:18.5158, lon:73.1298 },
  { name:'Pune',             state:'Maharashtra', score:0.31, lat:18.5204, lon:73.8567 },
  { name:'Kolhapur',         state:'Maharashtra', score:0.38, lat:16.7,    lon:74.2    },
  { name:'Nilgiris',         state:'Tamil Nadu',  score:0.76, lat:11.4916, lon:76.7337 },
  { name:'Coimbatore',       state:'Tamil Nadu',  score:0.28, lat:11.0168, lon:76.9558 },
  { name:'Dindigul',         state:'Tamil Nadu',  score:0.45, lat:10.3624, lon:77.9695 },
  { name:'Theni',            state:'Tamil Nadu',  score:0.59, lat:10.0104, lon:77.4771 },
];

export const WAYANAD_TIMELINE = [
  { date:'Jul 15', rain1d:18.2, rain7d:98.4,  score:0.170, level:'STABLE'   },
  { date:'Jul 17', rain1d:21.4, rain7d:118.2, score:0.413, level:'ELEVATED' },
  { date:'Jul 19', rain1d:19.8, rain7d:131.6, score:0.808, level:'CRITICAL' },
  { date:'Jul 21', rain1d:24.5, rain7d:148.3, score:0.951, level:'CRITICAL' },
  { date:'Jul 23', rain1d:23.3, rain7d:162.4, score:0.877, level:'CRITICAL' },
  { date:'Jul 25', rain1d:23.3, rain7d:178.9, score:0.874, level:'CRITICAL' },
  { date:'Jul 26', rain1d:15.1, rain7d:172.1, score:0.697, level:'ELEVATED' },
  { date:'Jul 27', rain1d:6.3,  rain7d:165.3, score:0.101, level:'STABLE'   },
  { date:'Jul 28', rain1d:7.6,  rain7d:158.7, score:0.092, level:'STABLE'   },
  { date:'Jul 29', rain1d:52.6, rain7d:194.2, score:0.987, level:'CRITICAL', disaster:true },
  { date:'Jul 30', rain1d:27.5, rain7d:198.4, score:0.981, level:'CRITICAL' },
];

export const STATE_COLORS = {
  'Kerala':      '#173124',
  'Karnataka':   '#2d4739',
  'Maharashtra': '#4a5568',
  'Tamil Nadu':  '#727973',
};

export const ARCHIVE_EVENTS = [
  { date:'2024, JULY 29',    title:'Mundakkai–Chooralmala Disaster',  desc:'52.6mm single-day rainfall on 15-day saturated soil. 400+ fatalities. Model score 0.987.' },
  { date:'2021, OCTOBER 16', title:'Rajamala, Idukki Collapse',        desc:'Prolonged antecedent moisture over 15 days preceded the event. 70+ fatalities.' },
  { date:'2019, AUGUST 10',  title:'Kavalappara, Malappuram',          desc:'Debris flow following 3 consecutive days of extreme rainfall. 59 fatalities.' },
  { date:'2021, JULY 22',    title:'Taliye Village, Raigad',           desc:'84 fatalities. 7-day rainfall exceeded 310mm threshold.' },
  { date:'2018, AUGUST 17',  title:'Kodagu Cascading Slides',          desc:'Kerala floods triggered simultaneous slides across Kodagu and Idukki.' },
];

export const API_BASE = "http://localhost:8000";

export const fetchLiveDistricts = async () => {
  const r = await fetch(`${API_BASE}/all-districts`);
  if (!r.ok) throw new Error("API error");
  return r.json();
};

export const fetchLocationRisk = async (lat, lon, place_name) => {
  const r = await fetch(`${API_BASE}/predict-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon, place_name }),
  });
  if (!r.ok) throw new Error("API error");
  return r.json();
};