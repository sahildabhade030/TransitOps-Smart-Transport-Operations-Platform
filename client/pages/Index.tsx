import { useEffect, useState } from "react";
import OperationsDashboard from "@/components/OperationsDashboard";
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  DollarSign,
  FileBarChart,
  Fuel,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";

type Role = "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst";
type Screen = "welcome" | "register" | "login" | "dashboard";

const roles: { name: Role; short: string; icon: typeof Truck; description: string; color: string }[] = [
  { name: "Fleet Manager", short: "FM", icon: Truck, description: "Command your fleet assets and keep every vehicle moving.", color: "from-cyan-400 to-blue-500" },
  { name: "Driver", short: "DR", icon: UserRound, description: "Create trips, stay informed, and deliver with confidence.", color: "from-violet-400 to-fuchsia-500" },
  { name: "Safety Officer", short: "SO", icon: ShieldCheck, description: "Protect your people with proactive compliance insights.", color: "from-emerald-400 to-teal-500" },
  { name: "Financial Analyst", short: "FA", icon: FileBarChart, description: "Turn operating data into profitable decisions.", color: "from-amber-300 to-orange-500" },
];

const kpis = [
  { label: "Active vehicles", value: "84", trend: "+8.4%", icon: Truck, tone: "bg-sky-400/15 text-sky-300" },
  { label: "Available now", value: "62", trend: "+4.1%", icon: Activity, tone: "bg-emerald-400/15 text-emerald-300" },
  { label: "On active trips", value: "18", trend: "+12.2%", icon: MapPin, tone: "bg-violet-400/15 text-violet-300" },
  { label: "In maintenance", value: "04", trend: "-2.7%", icon: Wrench, tone: "bg-orange-400/15 text-orange-300" },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedRole, setSelectedRole] = useState<Role>("Fleet Manager");
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const currentRole = roles.find((role) => role.name === selectedRole)!;

  if (screen === "dashboard") {
    return <OperationsDashboard role={currentRole} dark={dark} setDark={setDark} onLogout={() => setScreen("welcome")} />;
  }

  if (screen === "register" || screen === "login") {
    const isLogin = screen === "login";
    return (
      <main className="auth-shell min-h-screen overflow-hidden px-5 py-6 text-white sm:px-8 lg:px-12">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <button onClick={() => setScreen("welcome")} className="brand flex items-center gap-3 text-left">
            <span className="brand-mark"><Truck size={20} strokeWidth={2.6} /></span>
            <span><b>Transit</b><em>Ops</em></span>
          </button>
          <button onClick={() => setScreen("welcome")} className="hidden text-sm text-slate-300 transition hover:text-white sm:block">← Back to overview</button>
        </nav>
        <section className="relative z-10 mx-auto flex max-w-6xl items-center justify-center py-10 lg:min-h-[calc(100vh-90px)] lg:py-0">
          <div className="auth-panel grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/50 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.08fr_.92fr]">
            <aside className="relative hidden overflow-hidden border-r border-white/10 bg-white/[.035] p-12 lg:block">
              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"><Sparkles size={14} /> OPERATIONS, ELEVATED</div>
                <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">The control room for every mile ahead.</h1>
                <p className="mt-5 max-w-md leading-7 text-slate-400">Make clearer decisions with real-time intelligence across your people, vehicles, and routes.</p>
                <div className="mt-12 grid grid-cols-2 gap-3">
                  {["Live fleet pulse", "Smart compliance", "Cost intelligence", "Secure access"].map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm font-medium text-slate-200"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">0{index + 1}</span>{item}</div>)}
                </div>
              </div>
              <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute bottom-8 left-12 flex items-center gap-3 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /> System status: all services operational</div>
            </aside>
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="mb-8"><p className="text-sm font-medium text-cyan-300">{isLogin ? "Welcome back" : "Create your workspace"}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{isLogin ? "Sign in to TransitOps" : "Start managing smarter"}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{isLogin ? "Access the workspace tailored to your operational role." : "Select your operating role to personalize your workspace."}</p></div>
              {!isLogin && <div className="mb-7 grid grid-cols-2 gap-3">{roles.map((role) => { const Icon = role.icon; const selected = role.name === selectedRole; return <button key={role.name} onClick={() => setSelectedRole(role.name)} className={`role-choice ${selected ? "role-choice-active" : ""}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-slate-950`}><Icon size={18} /></span><span className="text-left"><b>{role.name}</b><small>{role.short} workspace</small></span></button>; })}</div>}
              <form onSubmit={async (e) => { e.preventDefault(); setAuthError(""); const form = new FormData(e.currentTarget); const response = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), organization: form.get("organization"), role: selectedRole }) }); const data = await response.json(); if (!response.ok) { setAuthError(data.error ?? "Unable to continue"); return; } localStorage.setItem("transitops_user", JSON.stringify(data.user)); setScreen("dashboard"); }} className="space-y-4">
                {!isLogin && <label className="form-label">Organization name<input required name="organization" placeholder="e.g. Northstar Logistics" /></label>}
                <label className="form-label">Work email<input required name="email" type="email" placeholder="name@company.com" /></label>
                <label className="form-label">Password<input required name="password" type="password" placeholder="••••••••" /></label>
                {isLogin && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-400"><input type="checkbox" className="accent-cyan-400" /> Remember me</label><button type="button" className="text-cyan-300 hover:text-cyan-200">Forgot password?</button></div>}
                {authError && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{authError}</p>}
                <button type="submit" className="primary-action">{isLogin ? `Enter ${selectedRole} workspace` : "Create secure workspace"}<ArrowRight size={17} /></button>
              </form>
              <p className="mt-7 text-center text-sm text-slate-400">{isLogin ? "New to TransitOps?" : "Already have an account?"} <button onClick={() => setScreen(isLogin ? "register" : "login")} className="font-semibold text-cyan-300 hover:text-cyan-200">{isLogin ? "Create an account" : "Sign in"}</button></p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="landing min-h-screen overflow-hidden px-5 pb-10 text-white sm:px-8 lg:px-12">
      <div className="grid-bg" /><div className="hero-orb orb-a" /><div className="hero-orb orb-b" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between py-6">
        <button className="brand flex items-center gap-3 text-left"><span className="brand-mark"><Truck size={20} strokeWidth={2.6} /></span><span><b>Transit</b><em>Ops</em></span></button>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex"><a href="#capabilities" className="hover:text-white">Platform</a><a href="#roles" className="hover:text-white">Solutions</a><a href="#metrics" className="hover:text-white">Why TransitOps</a></div>
        <div className="hidden items-center gap-4 sm:flex"><button onClick={() => setScreen("login")} className="text-sm font-medium text-slate-200 hover:text-white">Sign in</button><button onClick={() => setScreen("register")} className="nav-cta">Get started <ArrowRight size={15} /></button></div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/10 p-2 text-slate-200 sm:hidden">{menuOpen ? <X /> : <Menu />}</button>
      </nav>
      {menuOpen && <div className="relative z-20 mx-auto mb-6 flex max-w-7xl flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/95 p-4 sm:hidden"><button onClick={() => setScreen("login")} className="rounded-lg px-3 py-2 text-left">Sign in</button><button onClick={() => setScreen("register")} className="nav-cta justify-center">Get started <ArrowRight size={15} /></button></div>}
      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 py-16 lg:grid-cols-[1fr_.9fr] lg:items-center lg:py-24">
        <div className="max-w-3xl"><div className="eyebrow"><span className="pulse-dot" />THE INTELLIGENT TRANSPORT OS</div><h1 className="mt-6 text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">Every operation.<br /><span className="gradient-text">Perfectly in motion.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">TransitOps brings your fleet, people, routes, and costs into one commanding, real-time view.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => setScreen("register")} className="hero-cta">Build your control room <ArrowRight size={18} /></button><button onClick={() => setScreen("login")} className="secondary-action"><Activity size={18} /> Explore live workspace</button></div><div id="metrics" className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-7"><Metric value="99.9%" label="platform uptime"/><Metric value="28%" label="lower idle time"/><Metric value="4.8×" label="faster decisions"/></div></div>
        <div className="dashboard-preview animate-float"><div className="preview-top"><div><span className="text-xs text-slate-400">Good morning, Morgan</span><h3>Fleet command center</h3></div><div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-sm font-bold text-slate-950">MO<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" /></div></div><div className="mt-5 grid grid-cols-3 gap-3"><PreviewStat value="84" label="Vehicles" color="text-cyan-300"/><PreviewStat value="18" label="On route" color="text-violet-300"/><PreviewStat value="92%" label="Utilization" color="text-emerald-300"/></div><div className="map-card mt-5"><div className="map-lines" /><div className="map-route" /><span className="route-pin pin-one"><Truck size={12} /></span><span className="route-pin pin-two"><MapPin size={13} /></span><div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs backdrop-blur"><b className="block text-white">18 active deliveries</b><span className="text-slate-400">Across 4 regions</span></div></div><div className="mt-5 flex items-center justify-between"><div className="flex -space-x-2">{["AR", "DV", "MC", "JL"].map((initials, index) => <span key={initials} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold ${["bg-violet-400", "bg-amber-300", "bg-rose-400", "bg-cyan-300"][index]} text-slate-900`}>{initials}</span>)}</div><span className="text-xs font-medium text-cyan-300">View operations →</span></div></div>
      </section>
      <section id="capabilities" className="relative z-10 mx-auto max-w-7xl py-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-cyan-300">ONE PLATFORM, TOTAL CLARITY</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Designed around how your team moves.</h2></div><p className="max-w-md text-sm leading-6 text-slate-400">Purpose-built workspaces surface exactly what every team needs, exactly when they need it.</p></div><div id="roles" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{roles.map((role) => { const Icon = role.icon; return <button key={role.name} onClick={() => { setSelectedRole(role.name); setScreen("register"); }} className="feature-card group text-left"><span className={`mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-slate-950 shadow-lg`}><Icon size={21} /></span><h3>{role.name}</h3><p>{role.description}</p><span className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:gap-3">Explore workspace <ChevronRight size={15} /></span></button>; })}</div></section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) { return <div><b className="text-xl">{value}</b><span className="ml-2 text-xs text-slate-400">{label}</span></div>; }
function PreviewStat({ value, label, color }: { value: string; label: string; color: string }) { return <div className="rounded-xl border border-white/5 bg-white/[.035] p-3"><b className={`text-lg ${color}`}>{value}</b><span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">{label}</span></div>; }

function Dashboard({ role, dark, setDark, onLogout }: { role: typeof roles[number]; dark: boolean; setDark: (value: boolean) => void; onLogout: () => void }) {
  const Icon = role.icon;
  const [notice, setNotice] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<"checking" | "connected" | "offline">("checking");
  useEffect(() => {
    fetch("/api/health/mongodb")
      .then((response) => setDatabaseStatus(response.ok ? "connected" : "offline"))
      .catch(() => setDatabaseStatus("offline"));
  }, []);
  const navItems: Array<{ icon: typeof LayoutDashboard; label: string }> = [{ icon: LayoutDashboard, label: "Overview" }, { icon: Truck, label: "Fleet" }, { icon: ClipboardList, label: "Trips" }, { icon: UsersRound, label: "Drivers" }, { icon: Wrench, label: "Maintenance" }, { icon: Fuel, label: "Fuel & expenses" }, { icon: FileBarChart, label: "Reports" }];
  return <main className="dashboard-shell min-h-screen text-slate-100"><aside className="dash-sidebar"><button className="brand mb-11 flex items-center gap-3 text-left"><span className="brand-mark"><Truck size={20} /></span><span><b>Transit</b><em>Ops</em></span></button><div className="mb-7 px-3 text-[10px] font-bold tracking-[.18em] text-slate-500">WORKSPACE</div><nav className="space-y-1">{navItems.map(({ icon: NavIcon, label }, index) => <button key={label} onClick={() => setNotice(true)} className={`side-link ${index === 0 ? "side-link-active" : ""}`}><NavIcon size={18} />{label}</button>)}</nav><div className="mt-auto rounded-2xl border border-cyan-300/10 bg-cyan-300/[.06] p-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-slate-950`}><Icon size={18} /></span><div><b className="block text-xs">{role.name}</b><span className="text-[11px] text-slate-400">Role-based access</span></div></div></div><button onClick={onLogout} className="side-link mt-4"><LogOut size={18} />Sign out</button></aside><section className="dash-content"><header className="dash-header"><button className="rounded-xl border border-white/10 p-2 md:hidden"><Menu size={18} /></button><div className="hidden max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/[.035] px-3 py-2 text-sm text-slate-500 md:flex"><Search size={17} /> Search fleet, trips or drivers...</div><div className="ml-auto flex items-center gap-3"><button onClick={() => setDark(!dark)} className="icon-button">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="icon-button relative"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" /></button><button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-2 py-1.5 text-left"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300 text-[10px] font-bold text-slate-950">MO</span><span className="hidden pr-1 text-xs sm:block"><b className="block">Morgan O.</b><em className="not-italic text-[10px] text-slate-500">Fleet Manager</em></span><ChevronDown size={14} className="hidden text-slate-500 sm:block" /></button></div></header><div className="mx-auto max-w-7xl p-5 sm:p-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-400">Wednesday, October 23</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Operational overview</h1><p className="mt-2 text-sm text-slate-400">Everything moving across Northstar Logistics.</p><span className="mt-3 inline-flex items-center gap-2 text-[11px] text-slate-500"><i className={`h-1.5 w-1.5 rounded-full ${databaseStatus === "connected" ? "bg-emerald-400" : databaseStatus === "offline" ? "bg-orange-300" : "bg-slate-500"}`} /> MongoDB {databaseStatus === "connected" ? "connected" : databaseStatus === "offline" ? "offline — start MongoDB locally" : "checking connection..."}</span></div><button onClick={() => setNotice(true)} className="primary-action w-auto px-5 py-3"><Plus size={17} /> Create trip</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(({ label, value, trend, icon: KpiIcon, tone }) => <div key={label} className="kpi-card"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><KpiIcon size={19} /></span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${trend[0] === "+" ? "bg-emerald-400/10 text-emerald-300" : "bg-orange-400/10 text-orange-300"}`}>{trend}</span></div><b className="mt-5 block text-3xl font-semibold tracking-tight">{value}</b><span className="mt-1 block text-sm text-slate-400">{label}</span></div>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.9fr]"><section className="dash-card"><div className="flex items-start justify-between"><div><h2>Fleet utilization</h2><p>Performance across the last 7 days</p></div><button className="text-xs font-semibold text-cyan-300">This week <ChevronDown className="inline" size={13} /></button></div><div className="chart mt-8"><div className="chart-grid" />{[42, 58, 45, 70, 63, 82, 74].map((height, index) => <div key={index} className="bar-wrap"><div className="chart-bar" style={{ height: `${height}%` }} /><span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>)}</div><div className="mt-6 flex gap-5 border-t border-white/8 pt-4 text-xs text-slate-400"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300" />Utilization</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-600" />Target 85%</span></div></section><section className="dash-card"><div className="flex items-center justify-between"><div><h2>Attention required</h2><p>Items needing a decision</p></div><CircleAlert size={19} className="text-orange-300" /></div><div className="mt-5 space-y-3">{[["2 licenses expiring", "Safety", "in 7 days", "bg-orange-300"], ["Van-08 scheduled service", "Maintenance", "Tomorrow", "bg-violet-300"], ["Fuel variance detected", "Finance", "Today", "bg-cyan-300"]].map(([title, category, due, color]) => <button onClick={() => setNotice(true)} key={title} className="attention-row"><span className={`h-2 w-2 rounded-full ${color}`} /><span className="flex-1 text-left"><b>{title}</b><small>{category}</small></span><span className="text-[10px] text-slate-500">{due}</span></button>)}</div></section></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.9fr]"><section className="dash-card overflow-hidden p-0"><div className="flex items-center justify-between p-5 pb-4"><div><h2>Active trips</h2><p>Live dispatch status</p></div><button className="text-xs font-semibold text-cyan-300">View all</button></div><div className="overflow-x-auto"><table><thead><tr><th>Trip</th><th>Route</th><th>Driver</th><th>Status</th><th /></tr></thead><tbody>{[["TRP-2481", "Dallas → Austin", "D. Valencia", "En route", "bg-cyan-300"], ["TRP-2480", "Houston → Waco", "A. Reed", "Loading", "bg-violet-300"], ["TRP-2478", "Austin → San Antonio", "J. Morgan", "En route", "bg-emerald-300"]].map(([trip, route, driver, status, color]) => <tr key={trip}><td><b>{trip}</b></td><td>{route}</td><td>{driver}</td><td><span className="status-pill"><i className={`h-1.5 w-1.5 rounded-full ${color}`} />{status}</span></td><td><button className="text-slate-500"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section><section className="dash-card"><div className="flex items-center justify-between"><div><h2>Cost pulse</h2><p>October to date</p></div><DollarSign size={18} className="text-cyan-300" /></div><div className="mt-6 flex items-end justify-between"><div><b className="text-3xl">$48,240</b><span className="mt-1 block text-xs text-emerald-300">↓ 6.2% vs last month</span></div><div className="donut"><span>73<small>%</small></span></div></div><div className="mt-5 flex justify-between border-t border-white/8 pt-4 text-xs text-slate-400"><span>Fuel <b className="ml-1 text-slate-200">$31.2k</b></span><span>Maintenance <b className="ml-1 text-slate-200">$17.0k</b></span></div></section></div></div></section>{notice && <button onClick={() => setNotice(false)} className="toast-notice"><Sparkles size={16} /> This interactive preview is ready to connect to your MongoDB API.<X size={15} /></button>}</main>;
}
