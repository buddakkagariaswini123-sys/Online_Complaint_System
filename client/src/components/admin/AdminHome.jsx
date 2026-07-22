import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Dropdown } from "react-bootstrap";
import {
  Activity, BarChart3, Bell, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardList, Cloud, Download, FileText, LayoutDashboard, Menu, MessageSquare,
  Moon, MoreHorizontal, Plus, Search, Settings, Star, Sun, Ticket, Users, UserPlus,
} from "lucide-react";
import UserInfo from "./UserInfo";
import AgentInfo from "./AgentInfo";
import AccordionAdmin from "./AccordionAdmin";
import "./AdminDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const navItems = [
  ["Dashboard", LayoutDashboard], ["Customers", Users], ["Tickets", Ticket], ["Agents", UserPlus],
  ["Feedback", MessageSquare], ["Analytics", BarChart3], ["Reports", FileText], ["Notifications", Bell], ["Settings", Settings],
];

const initials = (name = "Admin") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Today";

function StatCard({ label, value, detail, trend, icon: Icon, tone = "violet" }) {
  return <article className={`crm-stat-card ${tone}`}>
    <div className="crm-stat-icon"><Icon size={21} /></div>
    <p>{label}</p><strong>{value ?? "—"}</strong>
    <div className="crm-stat-footer"><span className={trend?.startsWith("+") ? "up" : "neutral"}>{trend || "Live data"}</span><small>{detail}</small></div>
  </article>;
}

function LineChart({ area = false }) {
  return <div className="chart-wrap" aria-label="Customer growth chart">
    <div className="chart-labels"><span>480</span><span>320</span><span>160</span><span>0</span></div>
    <svg viewBox="0 0 600 210" preserveAspectRatio="none" role="img">
      <defs><linearGradient id="crmFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#7557ff" stopOpacity=".26"/><stop offset="1" stopColor="#7557ff" stopOpacity="0"/></linearGradient></defs>
      {[35, 90, 145, 200].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className="chart-grid" />)}
      {area && <path d="M0 182 C55 172 64 125 112 136 S184 101 224 113 S292 65 337 86 S402 113 445 71 S521 26 600 49 L600 210 L0 210Z" fill="url(#crmFill)"/>}
      <path d="M0 182 C55 172 64 125 112 136 S184 101 224 113 S292 65 337 86 S402 113 445 71 S521 26 600 49" className="chart-line" />
      <circle cx="445" cy="71" r="5" className="chart-point" />
    </svg>
    <div className="chart-months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
  </div>;
}

function BarChart() {
  const bars = [44, 64, 47, 84, 58, 73, 92];
  return <div className="bar-chart">{bars.map((height, i) => <div key={height} className="bar-column"><i style={{ height: `${height}%` }} /><span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span></div>)}</div>;
}

const AdminHome = ({ onLogout }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { axios.get(`${API_URL}/admin/stats`, authHeader()).then(({ data }) => setStats(data)).catch((err) => setError(err.response?.data?.message || "Could not load stats")); }, []);
  const customerCount = stats?.totalUsers ?? 0;
  const tickets = stats?.totalComplaints ?? 0;
  const resolved = stats?.resolved ?? 0;
  const pending = stats?.pending ?? 0;
  const displayName = JSON.parse(localStorage.getItem("user") || "{}").name || "Administrator";
  const activity = useMemo(() => [
    ["New customer profile created", "Customer directory", "Just now", "violet"],
    [`${pending} tickets awaiting review`, "Support queue", "18 min ago", "amber"],
    [`${resolved} cases resolved successfully`, "Resolution desk", "1 hr ago", "green"],
  ].filter((item) => item.join(" ").toLowerCase().includes(search.toLowerCase())), [pending, resolved, search]);
  const selectNav = (item) => { setActive(item); setMobileOpen(false); };

  const managementContent = active === "Customers" ? <UserInfo /> : active === "Agents" ? <AgentInfo /> : <AccordionAdmin />;
  const isManagement = ["Customers", "Tickets", "Agents"].includes(active);

  return <div className={`crm-shell ${dark ? "crm-dark" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`crm-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="crm-brand"><div className="crm-brand-mark"><Activity size={20} /></div><span>Resolve<span>IQ</span></span><button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button></div>
      <nav>{navItems.map(([item, Icon]) => <button key={item} className={active === item ? "active" : ""} onClick={() => selectNav(item)}><Icon size={19} /><span>{item}</span>{item === "Notifications" && <b>3</b>}</button>)}</nav>
      <div className="sidebar-help"><CircleHelp size={19}/><div><strong>Need help?</strong><small>Visit support center</small></div></div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <main className="crm-main">
      <header className="crm-topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div className="crm-search"><Search size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers, tickets, or activity..." /></div><div className="topbar-actions"><span className="cloud-mode"><Cloud size={16}/> Local mode</span><button className="icon-button notification"><Bell size={20}/><i>3</i></button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button><Dropdown align="end"><Dropdown.Toggle className="profile-toggle"><span>{initials(displayName)}</span><div><strong>{displayName}</strong><small>Administrator</small></div></Dropdown.Toggle><Dropdown.Menu><Dropdown.Item onClick={() => selectNav("Settings")}>Account settings</Dropdown.Item><Dropdown.Item onClick={onLogout}>Sign out</Dropdown.Item></Dropdown.Menu></Dropdown></div></header>
      <section className="crm-content">
        <div className="welcome-row"><div><p className="section-kicker">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p><h1>{active === "Dashboard" ? `Good morning, ${displayName.split(" ")[0]}` : active}</h1><p className="welcome-subtitle">Here’s what’s happening across your support operations.</p></div><div className="quick-action-group"><Button onClick={() => selectNav("Customers")}><Plus size={17}/> Add customer</Button><Button variant="light" onClick={() => selectNav("Tickets")}><Ticket size={17}/> Create ticket</Button></div></div>
        {error && <div className="crm-error">{error}</div>}
        {active === "Dashboard" && <>
          <section className="stats-grid"><StatCard label="Total customers" value={customerCount} detail="vs. last month" trend="+12.6%" icon={Users}/><StatCard label="Open tickets" value={tickets - resolved} detail="needs attention" trend="Live queue" icon={Ticket} tone="orange"/><StatCard label="Resolved tickets" value={resolved} detail="this month" trend="+8.4%" icon={CheckCircle2} tone="green"/><StatCard label="Pending issues" value={pending} detail="awaiting assignment" trend={pending ? "Action needed" : "All clear"} icon={ClipboardList} tone="slate"/></section>
          <section className="charts-grid"><article className="crm-panel growth-panel"><div className="panel-heading"><div><h2>Customer growth</h2><p>New customer profiles over the last 6 months</p></div><button className="panel-menu"><MoreHorizontal size={19}/></button></div><div className="growth-total"><strong>{customerCount}</strong><span><b>+12.6%</b> from previous period</span></div><LineChart area/></article><article className="crm-panel ticket-status"><div className="panel-heading"><div><h2>Ticket status</h2><p>Current support distribution</p></div><button className="panel-menu"><MoreHorizontal size={19}/></button></div><div className="donut-layout"><div className="donut"><span><b>{tickets}</b><small>Total</small></span></div><div className="chart-legend"><p><i className="legend-purple"/>Resolved <b>{resolved}</b></p><p><i className="legend-orange"/>In progress <b>{stats?.assigned ?? 0}</b></p><p><i className="legend-gray"/>Pending <b>{pending}</b></p></div></div></article></section>
          <section className="content-grid"><article className="crm-panel complaints-panel"><div className="panel-heading"><div><h2>Weekly activity</h2><p>Complaint volume across this week</p></div><span className="period-pill">This week</span></div><BarChart/></article><article className="crm-panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates across your workspace</p></div><button className="text-link" onClick={() => selectNav("Notifications")}>View all</button></div><div className="activity-list">{activity.map(([title, source, time, tone]) => <div className="activity-row" key={title}><span className={`activity-dot ${tone}`}/><div><strong>{title}</strong><small>{source}</small></div><time>{time}</time></div>)}{!activity.length && <p className="empty-copy">No matching activity.</p>}</div></article></section>
          <section className="bottom-grid"><article className="crm-panel feedback-panel"><div className="panel-heading"><div><h2>Customer feedback</h2><p>Recent satisfaction signals</p></div><button className="text-link" onClick={() => selectNav("Feedback")}>See all</button></div><div className="feedback-card"><div className="feedback-avatar">AM</div><div><div className="feedback-meta"><strong>Alex Morgan</strong><span><Star size={13} fill="currentColor"/> 4.8</span></div><p>“The update process was quick and the support team kept me informed.”</p><small>Yesterday</small></div></div></article><article className="crm-panel quick-panel"><div><p className="section-kicker">QUICK ACTIONS</p><h2>Keep work moving</h2><p>Common actions for your support team.</p></div><div className="quick-buttons"><button onClick={() => selectNav("Customers")}><UserPlus size={18}/>Add customer</button><button onClick={() => selectNav("Tickets")}><Ticket size={18}/>Create ticket</button><button onClick={() => selectNav("Agents")}><Users size={18}/>Assign agent</button><button><Download size={18}/>Export report</button></div></article></section>
        </>}
        {isManagement && <section className="crm-panel management-panel"><div className="panel-heading"><div><h2>{active}</h2><p>{active === "Tickets" ? "Review and assign incoming customer requests." : `Manage your ${active.toLowerCase()} directory.`}</p></div><span className="period-pill">Live data</span></div>{managementContent}</section>}
        {!isManagement && active !== "Dashboard" && <section className="crm-panel coming-soon"><div className="coming-icon"><BarChart3 size={25}/></div><h2>{active} center</h2><p>This workspace is ready for your next integration.</p><Button onClick={() => selectNav("Dashboard")}>Back to dashboard</Button></section>}
      </section>
    </main>
  </div>;
};

export default AdminHome;
