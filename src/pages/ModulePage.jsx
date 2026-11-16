import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { createRecord, deleteRecord, errorMessage, listRecords, searchPatients, updateRecord } from '../services/api';
import { hasPermission } from '../../shared/permissions.js';

const PAGE_SIZE = 8;
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function AppointmentCalendar({ records, month, onMonthChange, onView, onAdd }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { date, key, events: records.filter((record) => record.date === key) };
  });
  return <section className="calendar-panel">
    <div className="calendar-heading"><div><h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><p>Select an appointment to view its details.</p></div>
      <div className="calendar-controls"><button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><button onClick={() => onMonthChange(new Date())}>Today</button><button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div>
    </div>
    <div className="calendar-grid">{weekdays.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
      {days.map(({ date, key, events }) => <div className={`calendar-day ${date.getMonth() !== month.getMonth() ? 'calendar-muted' : ''}`} key={key}>
        <button className="calendar-day-number" onClick={() => onAdd(key)} aria-label={`Add appointment on ${key}`}>{date.getDate()}</button>
        <div className="calendar-events">{events.slice(0, 3).map((event) => <button key={event.id} className={`calendar-event event-${String(event.status).toLowerCase().replace(/\s/g, '-')}`} onClick={() => onView(event)}>
          <strong>{event.time}</strong> {event.patient}</button>)}
          {events.length > 3 && <small className="calendar-more">+{events.length - 3} more</small>}
        </div>
      </div>)}
    </div>
  </section>;
}

function RecordForm({ config, initial, readOnly, onCancel, onSave }) {
  const [values, setValues] = useState(initial || {});
  const [errors, setErrors] = useState({});
  const change = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };
  const submit = (event) => {
    event.preventDefault();
    const invalid = {};
    config.fields.forEach((field) => {
      if (field.required && !String(values[field.name] || '').trim()) invalid[field.name] = `${field.label} is required`;
      if (field.type === 'email' && values[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.name])) invalid[field.name] = 'Enter a valid email address';
    });
    if (Object.keys(invalid).length) { setErrors(invalid); return; }
    onSave(values);
  };
  const input = (field) => {
    const common = { id: field.name, value: values[field.name] ?? '', disabled: readOnly, required: field.required,
      onChange: (event) => change(field.name, event.target.value), className: errors[field.name] ? 'input-error' : '' };
    if (field.type === 'select') return <select {...common}><option value="">Select {field.label.toLowerCase()}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select>;
    if (field.type === 'textarea') return <textarea {...common} rows={3} />;
    return <input {...common} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} />;
  };
  return <form className="record-form" onSubmit={submit} noValidate>
    <div className="form-grid">{config.fields.filter((field) => !(readOnly && field.type === 'password')).map((field) => <label key={field.name} className={`form-field ${field.type === 'textarea' ? 'field-full' : ''}`}>
      <span>{field.label}{field.required && <i> *</i>}</span>{input(field)}
      {errors[field.name] && <small className="field-error">{errors[field.name]}</small>}
    </label>)}</div>
    <div className="modal-footer">{readOnly ? <button className="button button-primary" type="button" onClick={onCancel}>Done</button> : <>
      <button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button>
      <button className="button button-primary" type="submit">{initial?.id ? 'Save changes' : `Add ${config.singular}`}</button>
    </>}</div>
  </form>;
}

export default function ModulePage({ config, notify, user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: 'id', direction: 'desc' });
  const [dialog, setDialog] = useState(null);
  const [calendarView, setCalendarView] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [error, setError] = useState('');
  const Icon = config.icon;
  const immutable = ['medicalRecords', 'payments', 'auditLogs'].includes(config.store);
  const canCreate = config.store !== 'auditLogs' && hasPermission(user?.role, config.store, 'create');
  const canEdit = !immutable && hasPermission(user?.role, config.store, 'update');
  const canDelete = !immutable && hasPermission(user?.role, config.store, 'delete');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = config.store === 'patients' && query.trim()
          ? await searchPatients(query.trim())
          : await listRecords(config.store);
        if (active) {
          setRecords(result);
          setError('');
        }
      } catch (loadError) {
        if (active) setError(errorMessage(loadError, `Unable to load ${config.label.toLowerCase()}.`));
      } finally {
        if (active) setLoading(false);
      }
    }, config.store === 'patients' && query.trim() ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [config.label, config.store, query, revision]);

  const choices = useMemo(() => Object.fromEntries(config.filters.map(({ field }) => [field,
    [...new Set(records.map((record) => record[field]).filter(Boolean))]])), [config, records]);
  const filtered = useMemo(() => records.filter((record) => {
    const matchesText = !query || config.searchFields.some((field) => String(record[field] || '').toLowerCase().includes(query.toLowerCase()));
    return matchesText && config.filters.every(({ field }) => !filters[field] || String(record[field] || '') === filters[field]);
  }).sort((a, b) => {
    const left = a[sort.field] ?? '';
    const right = b[sort.field] ?? '';
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sort.direction === 'asc' ? comparison : -comparison;
  }), [records, query, config, filters, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const persist = async (operation, message) => {
    try {
      await operation;
      setError('');
      setRevision((value) => value + 1);
      notify(message);
      setDialog(null);
    } catch (saveError) {
      const message = errorMessage(saveError, 'Unable to save changes.');
      setError(message);
      notify(message, 'error');
    }
  };
  const save = (values) => {
    const editing = dialog.mode === 'edit';
    const record = editing
      ? updateRecord(config.store, dialog.record.id, values)
      : createRecord(config.store, values);
    persist(record, `${config.singular} ${editing ? 'updated' : 'added'} successfully`);
  };
  const remove = (record) => {
    if (!window.confirm(`Archive ${record.id}${record.name || record.patient ? ` · ${record.name || record.patient}` : ''}?`)) return;
    persist(deleteRecord(config.store, record.id), `${config.singular} archived`);
  };
  const cancelAppointment = (record) => {
    if (!window.confirm(`Cancel appointment ${record.id} for ${record.patient}?`)) return;
    const updated = { ...record, status: 'Cancelled' };
    persist(updateRecord(config.store, record.id, updated), 'Appointment cancelled');
  };
  const toggleSort = (field) => {
    setSort((current) => ({ field, direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc' }));
  };
  const exportCsv = () => {
    const headings = config.columns.map((column) => column === 'id' ? config.idLabel : config.fields.find((field) => field.name === column)?.label || column);
    const csv = [headings, ...filtered.map((record) => config.columns.map((column) => record[column] ?? ''))]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `${config.store}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const clearFilters = () => { setFilters({}); setQuery(''); setPage(1); };

  return <div className="page-content">
    <div className="page-heading">
      <div><div className="eyebrow"><Icon size={14} /> CARE MANAGEMENT</div><h1>{config.label}</h1><p>{config.description}</p></div>
      <div className="heading-actions">{config.store === 'appointments' && <button className="button button-secondary" onClick={() => setCalendarView((value) => !value)}>{calendarView ? <List size={16} /> : <CalendarDays size={16} />}{calendarView ? 'List view' : 'Calendar'}</button>}
        <button className="button button-secondary" onClick={exportCsv}><Download size={16} /> Export</button>
        {canCreate && <button className="button button-primary" onClick={() => setDialog({ mode: 'create' })}><Plus size={17} /> Add {config.singular}</button>}</div>
    </div>
    {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
    <div className="module-summary"><div className="summary-icon"><Icon size={19} /></div><div><strong>{records.length} <span>total {config.label.toLowerCase()}</span></strong><small>Live database records</small></div></div>
    <section className="panel records-panel">
      <div className="table-toolbar">
        <label className="table-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${config.label.toLowerCase()}...`} /></label>
        <div className="filter-controls"><SlidersHorizontal size={16} className="filter-icon" />
          {config.filters.map(({ field, label }) => <select key={field} aria-label={label} value={filters[field] || ''} onChange={(event) => { setFilters((current) => ({ ...current, [field]: event.target.value })); setPage(1); }}>
            <option value="">{label}</option>{choices[field].map((choice) => <option key={choice}>{choice}</option>)}
          </select>)}
          {(query || Object.values(filters).some(Boolean)) && <button className="clear-filters" onClick={clearFilters}>Clear</button>}
        </div>
      </div>
      {calendarView && config.store === 'appointments'
        ? <AppointmentCalendar records={filtered} month={calendarMonth} onMonthChange={setCalendarMonth} onView={(record) => setDialog({ mode: 'view', record })}
          onAdd={(date) => setDialog({ mode: 'create', record: { date } })} />
        : <><DataTable rows={pageRows} columns={config.columns} config={config} sort={sort} onSort={toggleSort}
          onView={(record) => setDialog({ mode: 'view', record })}
          onEdit={canEdit ? (record) => setDialog({ mode: 'edit', record }) : undefined}
          onDelete={canDelete ? remove : undefined}
          onCancel={config.store === 'appointments' && hasPermission(user?.role, config.store, 'update') ? cancelAppointment : undefined} />
          <Pagination page={page} pages={pages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} /></>}
      {loading && <div className="loading-state">Loading records from the hospital database…</div>}
    </section>
    {dialog && <Modal wide={config.fields.length > 9} title={dialog.mode === 'view' ? `${config.singular} details` : dialog.mode === 'edit' ? `Edit ${config.singular}` : `Add ${config.singular}`}
      subtitle={dialog.record?.id || `New ${config.singular.toLowerCase()} record`} onClose={() => setDialog(null)}>
      <RecordForm key={`${dialog.mode}-${dialog.record?.id || 'new'}`} config={config} initial={dialog.record} readOnly={dialog.mode === 'view'} onCancel={() => setDialog(null)} onSave={save} />
    </Modal>}
  </div>;
}
