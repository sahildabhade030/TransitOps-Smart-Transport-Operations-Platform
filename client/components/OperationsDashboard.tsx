import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, Bell, ChevronDown, FileBarChart, Fuel, LayoutDashboard, LogOut, Menu, Moon, Plus, RefreshCw, Search, ShieldCheck, Sun, Truck, UserRound, UsersRound, Wrench, X } from "lucide-react";

type Role = "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst";
type RoleInfo = { name: Role; short: string; icon: typeof Truck; description: string; color: string };
type Resource = "vehicles" | "drivers" | "trips" | "maintenance" | "fuel" | "expenses";
type NavItem = { key: string; label: string; icon: typeof LayoutDashboard; resource?: Resource };

const allNav: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "vehicles", label: "Fleet", icon: Truck, resource: "vehicles" },
  { key: "trips", label: "Trips", icon: Activity, resource: "trips" },
  { key: "drivers", label: "Drivers", icon: UsersRound, resource: "drivers" },
  { key: "maintenance", label: "Maintenance", icon: Wrench, resource: "maintenance" },
  { key: "fuel", label: "Fuel & expenses", icon: Fuel, resource: "fuel" },
  { key: "reports", label: "Reports", icon: FileBarChart },
];

const roleNav: Record<Role, string[]> = {
  "Fleet Manager": ["overview", "vehicles", "trips", "drivers", "maintenance", "fuel", "reports"],
  Driver: ["overview", "trips"],
  "Safety Officer": ["overview", "drivers", "maintenance"],
  "Financial Analyst": ["overview", "fuel", "reports"],
};

export default function OperationsDashboard({ role, dark, setDark, onLogout }: { role: RoleInfo; dark: boolean; setDark: (value: boolean) => void; onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const [databaseStatus, setDatabaseStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = role.icon;
  const nav = useMemo(() => allNav.filter((item) => roleNav[role.name].includes(item.key)), [role.name]);
  const current = nav.find((item) => item.key === active) ?? nav[0];

  async function loadData() {
    setLoading(true);
    try {
      const health = await fetch("/api/health/mongodb");
      setDatabaseStatus(health.ok ? "connected" : "offline");
      const summaryResponse = await fetch("/api/dashboard/summary");
      if (summaryResponse.ok) setSummary(await summaryResponse.json());
      const resources = [...new Set(nav.map((item) => item.resource).filter(Boolean))] as Resource[];
      const responses = await Promise.all(resources.map(async (resource) => [resource, await fetch(`/api/${resource}`).then((response) => response.ok ? response.json() : [])] as const));
      setRecords(Object.fromEntries(responses));
    } catch { setDatabaseStatus("offline"); } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [role.name]);

  async function saveRecord(event: React.FormEvent<HTMLFormElement>, resource: Resource) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "Unable to save record"); return; }
    setNotice(`${resource.slice(0, -1)} saved to MongoDB`);
    setShowForm(false);
    await loadData();
  }

  return <main className="dashboard-shell min-h-screen text-slate-100">
    <aside className="dash-sidebar"><button className="brand mb-11 flex items-center gap-3 text-left"><span className="brand-mark"><Truck size={20} /></span><span><b>Transit</b><em>Ops</em></span></button><div className="mb-7 px-3 text-[10px] font-bold tracking-[.18em] text-slate-500">WORKSPACE</div><nav className="space-y-1">{nav.map(({ icon: NavIcon, label, key }) => <button key={key} onClick={() => { setActive(key); setNotice(""); }} className={`side-link ${active === key ? "side-link-active" : ""}`}><NavIcon size={18} />{label}</button>)}</nav><div className="mt-auto rounded-2xl border border-cyan-300/10 bg-cyan-300/[.06] p-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-slate-950`}><Icon size={18} /></span><div><b className="block text-xs">{role.name}</b><span className="text-[11px] text-slate-400">Role-based access</span></div></div></div><button onClick={onLogout} className="side-link mt-4"><LogOut size={18} />Sign out</button></aside>
    <section className="dash-content"><header className="dash-header"><button className="rounded-xl border border-white/10 p-2 md:hidden"><Menu size={18} /></button><div className="hidden max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/[.035] px-3 py-2 text-sm text-slate-500 md:flex"><Search size={17} /> Search workspace...</div><div className="ml-auto flex items-center gap-3"><button onClick={() => setDark(!dark)} className="icon-button">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button onClick={loadData} className="icon-button"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button><button className="icon-button"><Bell size={17} /></button><button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-2 py-1.5 text-left"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300 text-[10px] font-bold text-slate-950">MO</span><span className="hidden pr-1 text-xs sm:block"><b className="block">Workspace user</b><em className="not-italic text-[10px] text-slate-500">{role.name}</em></span><ChevronDown size={14} className="hidden text-slate-500 sm:block" /></button></div></header>
      <div className="mx-auto max-w-7xl p-5 sm:p-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-400">TransitOps workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{current.label}</h1><p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400"><i className={`h-1.5 w-1.5 rounded-full ${databaseStatus === "connected" ? "bg-emerald-400" : databaseStatus === "offline" ? "bg-orange-300" : "bg-slate-500"}`} /> MongoDB {databaseStatus === "connected" ? "connected" : databaseStatus === "offline" ? "offline" : "checking..."}</p></div>{current.resource && <button onClick={() => setShowForm(true)} className="primary-action w-auto px-5 py-3"><Plus size={17} /> Add {current.label.replace(" & expenses", "")}</button>}</div>{active === "overview" ? <Overview summary={summary} records={records} /> : active === "reports" ? <Reports records={records} /> : <ResourceView resource={current.resource!} records={records[current.resource!] ?? []} onAdd={() => setShowForm(true)} />}</div>
    </section>
    {showForm && current.resource && <RecordModal resource={current.resource} onClose={() => setShowForm(false)} onSave={saveRecord} />}
    {notice && <button onClick={() => setNotice("")} className="toast-notice"><ShieldCheck size={16} /> {notice}<X size={15} /></button>}
  </main>;
}

function Overview({ summary, records }: { summary: Record<string, number>; records: Record<string, any[]> }) { const metrics = [["Active vehicles", summary.activeVehicles ?? 0, Truck, "text-cyan-300"], ["Available vehicles", summary.availableVehicles ?? 0, Activity, "text-emerald-300"], ["Active trips", summary.activeTrips ?? 0, MapPinIcon, "text-violet-300"], ["In maintenance", summary.maintenanceVehicles ?? 0, Wrench, "text-orange-300"]] as const; return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, KpiIcon, color]) => <div key={label} className="kpi-card"><span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.06] ${color}`}><KpiIcon size={19} /></span><b className="mt-5 block text-3xl font-semibold tracking-tight">{value}</b><span className="mt-1 block text-sm text-slate-400">{label}</span></div>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="dash-card"><h2>Connected data</h2><p>Your live MongoDB collections</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Vehicles", records.vehicles?.length ?? 0], ["Drivers", records.drivers?.length ?? 0], ["Trips", records.trips?.length ?? 0], ["Maintenance", records.maintenance?.length ?? 0], ["Fuel logs", records.fuel?.length ?? 0], ["Expenses", records.expenses?.length ?? 0]].map(([label, count]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[.025] p-4"><b className="text-xl text-cyan-300">{count}</b><span className="mt-1 block text-xs text-slate-400">{label}</span></div>)}</div></section><section className="dash-card"><h2>Fleet utilization</h2><p>Calculated from current vehicle status</p><div className="mt-8 flex items-center justify-center"><div className="donut"><span>{summary.utilization ?? 0}<small>%</small></span></div></div></section></div></>; }

function ResourceView({ resource, records, onAdd }: { resource: Resource; records: any[]; onAdd: () => void }) { const labels: Record<Resource, string> = { vehicles: "Vehicle registry", drivers: "Driver management", trips: "Trip management", maintenance: "Maintenance logs", fuel: "Fuel logs", expenses: "Operational expenses" }; return <section className="dash-card overflow-hidden p-0"><div className="flex items-center justify-between p-5"><div><h2>{labels[resource]}</h2><p>{records.length} records stored in MongoDB</p></div><button onClick={onAdd} className="secondary-action px-3 py-2"><Plus size={15} /> Add record</button></div>{records.length ? <div className="overflow-x-auto"><table><thead><tr><th>Record</th><th>Status</th><th>Created</th></tr></thead><tbody>{records.map((record) => <tr key={String(record._id)}><td><b>{record.registrationNumber ?? record.name ?? record.title ?? record.source ?? record._id}</b></td><td><span className="status-pill">{record.status ?? "Recorded"}</span></td><td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-500">No records yet. Add the first record to create this MongoDB collection.</div>}</section>; }

function Reports({ records }: { records: Record<string, any[]> }) { const fuelCost = (records.fuel ?? []).reduce((total, item) => total + Number(item.cost ?? 0), 0); const expenseCost = (records.expenses ?? []).reduce((total, item) => total + Number(item.cost ?? 0), 0); return <div className="grid gap-5 sm:grid-cols-3"><div className="dash-card"><p>Total fuel cost</p><b className="mt-3 block text-3xl">${fuelCost.toFixed(2)}</b></div><div className="dash-card"><p>Other expenses</p><b className="mt-3 block text-3xl">${expenseCost.toFixed(2)}</b></div><div className="dash-card"><p>Total records</p><b className="mt-3 block text-3xl">{Object.values(records).reduce((sum, list) => sum + list.length, 0)}</b></div></div>; }

function RecordModal({ resource, onClose, onSave }: { resource: Resource; onClose: () => void; onSave: (event: FormEvent<HTMLFormElement>, resource: Resource) => void }) { const fields: Record<Resource, Array<[string, string, string]>> = { vehicles: [["registrationNumber", "Registration number", "e.g. VAN-05"], ["vehicleName", "Vehicle name / model", "e.g. Transit Van"], ["type", "Vehicle type", "Van"], ["maximumLoadCapacity", "Maximum load (kg)", "500"], ["status", "Status", "Available"]], drivers: [["name", "Driver name", "Alex Morgan"], ["licenseNumber", "License number", "DL-12345"], ["licenseCategory", "License category", "Class A"], ["licenseExpiryDate", "License expiry", "2027-12-31"], ["status", "Status", "Available"]], trips: [["source", "Source", "Dallas"], ["destination", "Destination", "Austin"], ["vehicleId", "Vehicle ID", "MongoDB vehicle id"], ["driverId", "Driver ID", "MongoDB driver id"], ["cargoWeight", "Cargo weight (kg)", "450"], ["status", "Status", "Draft"]], maintenance: [["vehicleId", "Vehicle ID", "MongoDB vehicle id"], ["serviceType", "Service type", "Oil change"], ["cost", "Cost", "250"], ["status", "Status", "Active"]], fuel: [["vehicleId", "Vehicle ID", "MongoDB vehicle id"], ["liters", "Liters", "120"], ["cost", "Cost", "180"], ["date", "Date", "2025-01-01"]], expenses: [["vehicleId", "Vehicle ID", "MongoDB vehicle id"], ["category", "Category", "Toll"], ["cost", "Cost", "75"], ["date", "Date", "2025-01-01"]] }; return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"><form onSubmit={(event) => onSave(event, resource)} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d2035] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-cyan-300">MongoDB record</p><h2 className="mt-1 text-xl font-semibold">Add {resource}</h2></div><button type="button" onClick={onClose} className="icon-button"><X size={17} /></button></div><div className="grid gap-4 sm:grid-cols-2">{fields[resource].map(([name, label, placeholder]) => <label className="form-label" key={name}>{label}<input required name={name} placeholder={placeholder} /></label>)}</div><button type="submit" className="primary-action mt-6">Save to MongoDB <Plus size={17} /></button></form></div>; }

function MapPinIcon(props: { size?: number }) { return <span className="text-current" {...props}>⌖</span>; }
