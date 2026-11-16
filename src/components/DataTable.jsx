import { ArrowDown, ArrowUp, ArrowUpDown, CalendarX2, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();
  let tone = 'neutral';
  if (['active', 'available', 'paid', 'completed', 'confirmed', 'success', 'ready', 'reviewed', 'discharged'].includes(normalized)) tone = 'green';
  else if (['pending', 'scheduled', 'in progress', 'occupied', 'admitted', 'urgent'].includes(normalized)) tone = 'amber';
  else if (['cancelled', 'canceled', 'overdue', 'failed', 'inactive', 'no show', 'maintenance', 'locked'].includes(normalized)) tone = 'red';
  return <span className={`status-badge status-${tone}`}><i />{value || '—'}</span>;
}

function displayValue(value, key) {
  if (value === undefined || value === null || value === '') return '—';
  if (key === 'amount' || key === 'fee' || key === 'rate') return `$${Number(value).toLocaleString()}`;
  return String(value);
}

export default function DataTable({ rows, columns, config, onView, onEdit, onDelete, onCancel, sort, onSort }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column}><button className="sort-button" onClick={() => onSort(column)}>
          {column === 'id' ? config.idLabel : config.fields.find((item) => item.name === column)?.label || column.replace(/([A-Z])/g, ' $1')}
          {sort.field === column ? (sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} />}
        </button></th>)}<th className="actions-heading">Actions</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id}>
            {columns.map((column, index) => <td key={column}>
              {column === 'status' || column === 'availability' || column === 'result' || column === 'priority'
                ? <StatusBadge value={row[column]} />
                : config.store === 'patients' && column === 'name'
                  ? <Link className="patient-name-link" to={`/patients/${encodeURIComponent(row.id)}`}>{displayValue(row[column], column)}</Link>
                : index === 0 ? <strong className="table-primary">{displayValue(row[column], column)}</strong>
                  : displayValue(row[column], column)}
            </td>)}
            <td><div className="row-actions">
              <button title="View details" aria-label={`View ${row.id}`} onClick={() => onView(row)}><Eye size={16} /></button>
            {onEdit && <button title="Edit" aria-label={`Edit ${row.id}`} onClick={() => onEdit(row)}><Pencil size={15} /></button>}
              {onCancel && !['Cancelled', 'Completed'].includes(row.status) && <button title="Cancel appointment" aria-label={`Cancel ${row.id}`} onClick={() => onCancel(row)}><CalendarX2 size={15} /></button>}
            {onDelete && <button className="danger-action" title="Archive" aria-label={`Archive ${row.id}`} onClick={() => onDelete(row)}><Trash2 size={15} /></button>}
            </div></td>
          </tr>)}
          {!rows.length && <tr><td className="empty-table" colSpan={columns.length + 1}>
            <div className="empty-state"><span className="empty-icon">⌕</span><strong>No records found</strong><p>Try adjusting your search or filters.</p></div>
          </td></tr>}
        </tbody>
      </table>
    </div>
  );
}
