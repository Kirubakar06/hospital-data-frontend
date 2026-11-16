import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BedDouble, CalendarDays, CircleDollarSign,
  Clock3, Users, UserRound, Activity, Plus, Stethoscope, CalendarPlus,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api, errorMessage } from '../services/api';
import { StatusBadge } from '../components/DataTable';
import { hasPermission } from '../../shared/permissions.js';

const palette = ['#4178e8', '#7ca7f7', '#9c87ec', '#50b99a', '#f0b352', '#ed7c76'];
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function StatCard({ title, value, note, icon: Icon, tone, trend }) {
  return <article className={`stat-card stat-card-${tone}`}><div className={`stat-icon ${tone}`}><Icon size={20} /></div>
    <div className="stat-title">{title}</div><div className="stat-value">{value}</div>
    <div className="stat-note">{trend && <span className={trend === 'down' ? 'trend-down' : 'trend-up'}>{trend === 'down' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {note.split(' ')[0]}</span>}
      <span>{trend ? note.substring(note.indexOf(' ') + 1) : note}</span></div>
  </article>;
}

function ChartTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label || payload[0].name}</strong><span>{prefix}{Number(payload[0].value).toLocaleString()}</span></div>;
}

export default function Dashboard({ user }) {
  const [state, setState] = useState({ loading: true, error: '', overview: {}, patientStats: [], appointmentStats: [], revenueStats: [], upcoming: [], recentPatients: [], logs: [] });
  const role = user?.role;
  const canReadPatients = hasPermission(role, 'patients', 'read');
  const canReadDoctors = hasPermission(role, 'doctors', 'read');
  const canReadAppointments = hasPermission(role, 'appointments', 'read');
  const canReadRooms = hasPermission(role, 'rooms', 'read');
  const canReadBilling = hasPermission(role, 'billing', 'read');
  const canReadAuditLogs = hasPermission(role, 'auditLogs', 'read');
  const canCreatePatients = hasPermission(role, 'patients', 'create');
  const canCreateAppointments = hasPermission(role, 'appointments', 'create');
  const canCreateBilling = hasPermission(role, 'billing', 'create');
  useEffect(() => {
    let active = true;
    const fetchIfAllowed = (module, endpoint) => hasPermission(role, module, 'read')
      ? api.get(endpoint)
      : Promise.resolve({ data: { data: [] } });
    Promise.all([
      api.get('/dashboard/overview'),
      fetchIfAllowed('patients', '/dashboard/patient-statistics'),
      fetchIfAllowed('appointments', '/dashboard/appointment-statistics'),
      fetchIfAllowed('billing', '/dashboard/revenue-statistics'),
      fetchIfAllowed('appointments', '/dashboard/upcoming-appointments'),
      fetchIfAllowed('patients', '/dashboard/recent-patients'),
      fetchIfAllowed('auditLogs', '/dashboard/recent-activity'),
    ]).then(([overview, patients, appointments, revenue, upcoming, recent, logs]) => {
      if (!active) return;
      const appointmentRows = appointments.data.data;
      setState({
        loading: false, error: '',
        overview: overview.data.data,
        patientStats: patients.data.data,
        appointmentStats: ['Confirmed', 'Scheduled', 'Completed', 'Cancelled'].map((status) => ({
          status, count: Number(appointmentRows.find((row) => row.status === status)?.count || 0),
        })),
        revenueStats: revenue.data.data.map((row) => ({ ...row, amount: Number(row.amount || 0) })),
        upcoming: upcoming.data.data.slice(0, 4),
        recentPatients: recent.data.data.slice(0, 5),
        logs: logs.data.data.slice(0, 3),
      });
    }).catch((error) => {
      if (active) setState((current) => ({ ...current, loading: false, error: errorMessage(error) }));
    });
    return () => { active = false; };
  }, [role]);
  const { overview, patientStats, appointmentStats, revenueStats, upcoming, recentPatients, logs } = state;
  const revenue = Number(overview.totalRevenue || 0);
  const pending = Number(overview.pendingPayments || 0);
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return <div className="page-content dashboard-content">
    <div className="page-heading dashboard-heading"><div><div className="eyebrow"><Activity size={14} /> YOUR HOSPITAL AT A GLANCE</div><h1>Hospital dashboard <span className="wave">✦</span></h1>
      <p>Here&apos;s what&apos;s happening at CarePoint today.</p></div><div className="date-chip"><CalendarDays size={16} />{dateLabel}</div></div>
    {state.error && <div className="inline-error" role="alert">{state.error}</div>}
    {state.loading && <div className="loading-state">Loading live hospital data…</div>}
    <div className="stat-grid">
      {canReadPatients && <StatCard title="Total patients" value={Number(overview.totalPatients || 0).toLocaleString()} note="Registered patients" icon={Users} tone="blue" />}
      {canReadDoctors && <StatCard title="Medical team" value={Number(overview.totalDoctors || 0).toLocaleString()} note="Registered doctors" icon={Stethoscope} tone="violet" />}
      {canReadAppointments && <StatCard title="Total appointments" value={Number(overview.totalAppointments || 0).toLocaleString()} note="Across all departments" icon={CalendarDays} tone="green" />}
      {canReadAppointments && <StatCard title="Today's appointments" value={Number(overview.todaysAppointments || 0).toLocaleString()} note="Scheduled for today" icon={CalendarPlus} tone="violet" />}
      {canReadRooms && <StatCard title="Available rooms" value={Number(overview.availableRooms || 0).toLocaleString()} note={`of ${Number(overview.availableRooms || 0) + Number(overview.occupiedRooms || 0)} active rooms`} icon={BedDouble} tone="amber" />}
      {canReadRooms && <StatCard title="Occupied rooms" value={Number(overview.occupiedRooms || 0).toLocaleString()} note="Currently in use" icon={BedDouble} tone="teal" />}
      {canReadBilling && <StatCard title="Revenue collected" value={`$${revenue.toLocaleString()}`} note="Payments received" icon={CircleDollarSign} tone="teal" />}
      {canReadBilling && <StatCard title="Pending payments" value={`$${pending.toLocaleString()}`} note="Needs follow-up" icon={Clock3} tone="rose" />}
    </div>
    <div className="chart-grid">
      {canReadPatients && <section className="panel chart-panel"><div className="panel-heading"><div><h2>Patient overview</h2><p>Patients by department</p></div><span className="chart-legend"><i className="legend-blue" /> Patient count</span></div>
        <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={patientStats} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
          <defs><linearGradient id="patientFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5685ed" stopOpacity={0.24} /><stop offset="95%" stopColor="#5685ed" stopOpacity={0.01} /></linearGradient></defs>
          <CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 11 }} dy={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 11 }} />
          <Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="value" stroke="#5482e9" strokeWidth={2.5} fill="url(#patientFill)" activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div>
      </section>}
      {canReadAppointments && <section className="panel chart-panel"><div className="panel-heading"><div><h2>Appointment status</h2><p>Current appointment breakdown</p></div><Link className="text-link" to="/appointments">View all <ArrowRight size={14} /></Link></div>
        <div className="chart-area appointment-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={appointmentStats} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 10 }} dy={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 11 }} /><Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="#5b83e7" radius={[5, 5, 0, 0]} barSize={30} /></BarChart></ResponsiveContainer></div>
      </section>}
    </div>
    <div className="lower-grid">
      {canReadBilling && <section className="panel chart-panel revenue-panel"><div className="panel-heading"><div><h2>Revenue snapshot</h2><p>Invoice totals by service · {new Date().getFullYear()}</p></div><span className="revenue-total">${revenue.toLocaleString()} <small>collected</small></span></div>
        <div className="revenue-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenueStats} margin={{ top: 18, right: 14, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 11 }} dy={8} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8b94a5', fontSize: 11 }} /><Tooltip content={<ChartTooltip prefix="$" />} />
          <Bar dataKey="amount" fill="#55b99b" radius={[5, 5, 0, 0]} barSize={32}>{revenueStats.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}</Bar>
        </BarChart></ResponsiveContainer></div>
      </section>}
      {(canCreatePatients || canCreateAppointments || canCreateBilling) && <section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Common tasks, one click away</p></div></div>
        <div className="quick-actions">
          {canCreatePatients && <Link to="/patients" className="quick-action"><span className="quick-action-icon quick-blue"><Plus size={17} /></span><span><strong>Register a patient</strong><small>Add a new patient profile</small></span><ArrowRight size={16} /></Link>}
          {canCreateAppointments && <Link to="/appointments" className="quick-action"><span className="quick-action-icon quick-violet"><CalendarPlus size={17} /></span><span><strong>Schedule appointment</strong><small>Book a patient visit</small></span><ArrowRight size={16} /></Link>}
          {canCreateBilling && <Link to="/billing" className="quick-action"><span className="quick-action-icon quick-green"><CircleDollarSign size={17} /></span><span><strong>Create an invoice</strong><small>Bill for a service</small></span><ArrowRight size={16} /></Link>}
        </div>
      </section>}
    </div>
    <div className="bottom-grid">
      {canReadPatients && <section className="panel table-panel"><div className="panel-heading"><div><h2>Recent patients</h2><p>Your latest patient registrations</p></div><Link className="text-link" to="/patients">View all <ArrowRight size={14} /></Link></div>
        <div className="table-scroll"><table className="data-table compact-table"><thead><tr><th>Patient</th><th>Patient ID</th><th>Department</th><th>Visit type</th><th>Status</th></tr></thead><tbody>
          {recentPatients.map((patient, index) => <tr key={patient.id}><td><div className="patient-cell"><span className={`avatar avatar-${index % 3}`}>{String(patient.name || 'Patient').split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><Link className="patient-name-link" to={`/patients/${encodeURIComponent(patient.id)}`}>{patient.name}</Link></div></td><td>{patient.id}</td><td>{patient.department || '—'}</td><td>{patient.admissionType || 'OP'}</td><td><StatusBadge value={patient.status} /></td></tr>)}
          {!recentPatients.length && <tr><td colSpan="5" className="empty-table">No patients registered yet.</td></tr>}
        </tbody></table></div>
      </section>}
      {canReadAppointments && <section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Upcoming appointments</h2><p>Next on the schedule</p></div><Link className="text-link" to="/appointments">View all <ArrowRight size={14} /></Link></div>
        <div className="appointment-list">{upcoming.map((item, index) => <div className="appointment-item" key={item.id}>
          <div className={`appointment-date date-tone-${index % 3}`}><strong>{shortDate.format(new Date(`${item.date}T12:00:00`)).split(' ')[1].replace(',', '')}</strong><small>{shortDate.format(new Date(`${item.date}T12:00:00`)).split(' ')[0]}</small></div>
          <div className="appointment-info"><strong>{item.patient}</strong><small>{item.doctor} · {item.department}</small></div><span className="appointment-time">{item.time}</span>
        </div>)}{!upcoming.length && <div className="empty-state"><strong>No upcoming appointments</strong></div>}</div>
      </section>}
    </div>
    {canReadAuditLogs && <section className="activity-strip"><div className="activity-title"><Activity size={17} /><strong>Recent activity</strong></div>
      {logs.map((log) => <div className="activity-event" key={log.id}><span className="activity-dot" /><span><strong>{log.user}</strong> {log.action.toLowerCase()} <b>{log.target}</b></span><small>{log.date}</small></div>)}
      {!logs.length && <span className="activity-event">Activity will appear here as you use the system.</span>}
    </section>}
    <div className="dashboard-footnote"><UserRound size={14} /> Your workspace is private to your team.</div>
  </div>;
}
