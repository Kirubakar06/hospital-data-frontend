import { CheckCircle2, X, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const Icon = type === 'error' ? XCircle : CheckCircle2;
  return <div className={`toast toast-${type}`} role="status"><Icon size={19} /><span>{message}</span><button aria-label="Dismiss notification" onClick={onClose}><X size={16} /></button></div>;
}
