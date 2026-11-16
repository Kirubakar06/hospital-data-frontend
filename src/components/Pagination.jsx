import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, pageSize, onChange }) {
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);
  return <div className="pagination">
    <span>Showing <strong>{first}–{last}</strong> of <strong>{total}</strong> results</span>
    <div className="page-controls">
      <button aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button>
      {Array.from({ length: pages }, (_, index) => index + 1).map((number) =>
        <button key={number} className={page === number ? 'selected' : ''} onClick={() => onChange(number)}>{number}</button>)}
      <button aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button>
    </div>
  </div>;
}
