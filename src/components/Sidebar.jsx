import { T } from "../tokens";

const NAV = [
  { id: "overview", icon: "◉", label: "Overview" },
  { id: "regional", icon: "◇", label: "Regional" },
  { id: "modeling", icon: "▣", label: "Modeling" },
  { id: "alerts", icon: "△", label: "Alerts" },
];

const styles = {
  sidebar: {
    width: 240, minHeight: "100vh", background: T.mossDeep,
    display: "flex", flexDirection: "column", borderRight: `1px solid ${T.mossDark}`,
    flexShrink: 0,
  },
  brand: { padding: "32px 24px 24px", borderBottom: "1px solid rgba(176,205,187,0.2)" },
  logo: {
    width: 36, height: 36, background: T.mossDark, border: `1px solid ${T.mossLight}`,
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
    color: T.mossLight, fontSize: 16,
  },
  title: { fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 600, color: T.parchment, lineHeight: 1.2, marginBottom: 4 },
  subtitle: { fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.mossLight, letterSpacing: "0.15em", textTransform: "uppercase" },
  nav: { padding: "24px 0", flex: 1 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 24px",
    cursor: "pointer", background: active ? T.mossDark : "transparent",
    border: 0, borderLeft: `2px solid ${active ? T.mossLight : "transparent"}`,
    textAlign: "left", transition: "background .15s ease, border-color .15s ease",
  }),
  navIcon: (active) => ({ fontSize: 14, color: active ? T.mossLight : "rgba(176,205,187,0.5)", width: 18, textAlign: "center" }),
  navLabel: (active) => ({ fontFamily: T.fontBody, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? T.parchment : "rgba(253,251,247,0.6)", letterSpacing: "0.03em" }),
  footer: { padding: "20px 24px", borderTop: "1px solid rgba(176,205,187,0.2)" },
  exportBtn: {
    width: "100%", padding: "10px 0", background: T.terracotta, border: "none", color: T.parchment,
    fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  meta: { marginTop: 16, display: "flex", flexDirection: "column", gap: 6 },
  metaItem: { fontFamily: T.fontBody, fontSize: 10, color: "rgba(176,205,187,0.5)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 },
};

export default function Sidebar({ screen, setScreen, isOpen, onClose, onExport }) {
  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`} style={styles.sidebar} aria-label="Primary navigation">
      <div style={styles.brand}>
        <div style={styles.logo} aria-hidden="true">△</div>
        <div style={styles.title}>Western Ghats<br />Observatory</div>
        <div style={styles.subtitle}>Geological Field Unit</div>
      </div>

      <nav style={styles.nav}>
        {NAV.map((item) => {
          const active = screen === item.id;
          return (
            <button key={item.id} type="button" aria-current={active ? "page" : undefined} style={styles.navItem(active)} onClick={() => { setScreen(item.id); onClose?.(); }}>
              <span aria-hidden="true" style={styles.navIcon(active)}>{item.icon}</span>
              <span style={styles.navLabel(active)}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <button type="button" style={styles.exportBtn} onClick={onExport}>
          <span aria-hidden="true">↓</span> Export Field Journal
        </button>
        <div style={styles.meta}>
          <div style={styles.metaItem}><span aria-hidden="true">◉</span> AUC 0.8606 · CV 0.8495</div>
          <div style={styles.metaItem}><span aria-hidden="true">◇</span> 51 verified events</div>
          <div style={styles.metaItem}><span aria-hidden="true">▣</span> NASA GPM · NRSC 2023</div>
        </div>
      </div>
    </aside>
  );
}
