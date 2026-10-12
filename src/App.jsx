import { useMemo, useState } from "react";
import { T } from "./tokens";
import "./index.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./screens/Overview";
import Regional from "./screens/Regional";
import Modeling from "./screens/Modeling";
import Alerts from "./screens/Alerts";
import useLiveDistricts from "./hooks/useLiveDistricts";

const TITLES = {
  overview: "Rain & Landslide Analysis",
  regional: "Rain & Landslide Analysis",
  modeling: "Predictive Modeling",
  alerts: "Active Alerts",
};

function exportJournal(districts) {
  const headings = ["District", "State", "Risk score", "Risk level", "Latitude", "Longitude"];
  const rows = districts.map((district) => {
    const score = district.score ?? district.risk_score ?? 0;
    return [
      district.district || district.name || "",
      district.state || "",
      score.toFixed(3),
      score >= 0.7 ? "CRITICAL" : score >= 0.4 ? "ELEVATED" : "STABLE",
      district.lat ?? "",
      district.lon ?? "",
    ];
  });
  const csv = [headings, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `rainrisk-field-journal-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [screen, setScreen] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusDistrict, setFocusDistrict] = useState("");
  const live = useLiveDistricts();

  const districtNames = useMemo(
    () => live.districts.map((district) => district.district || district.name).filter(Boolean),
    [live.districts],
  );

  const navigate = (nextScreen) => {
    setScreen(nextScreen);
    setSidebarOpen(false);
  };

  const openDistrict = (districtName) => {
    setFocusDistrict(districtName);
    navigate("regional");
  };

  return (
    <div className="app-shell" style={{ "--surface": T.bg }}>
      <Sidebar
        screen={screen}
        setScreen={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onExport={() => exportJournal(live.districts)}
      />
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <div className="app-main">
        <Topbar
          title={TITLES[screen]}
          districts={districtNames}
          onMenu={() => setSidebarOpen(true)}
          onPickDistrict={openDistrict}
          liveProps={{
            status: live.status,
            lastUpdated: live.lastUpdated,
            obsDate: live.obsDate,
            lagDays: live.lagDays,
            error: live.error,
            refresh: live.refresh,
          }}
        />

        <div className="app-content">
          {screen === "overview" && <Overview districts={live.districts} onSelectDistrict={openDistrict} />}
          {screen === "regional" && <Regional districts={live.districts} focusDistrict={focusDistrict} />}
          {screen === "modeling" && <Modeling districts={live.districts} />}
          {screen === "alerts" && <Alerts districts={live.districts} onSelectDistrict={openDistrict} />}
        </div>
      </div>
    </div>
  );
}
