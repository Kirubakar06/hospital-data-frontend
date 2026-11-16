import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { moduleConfigs, navigationForRole } from '../data/modules';
import { hasPermission } from '../../shared/permissions.js';

export default function Header({ onMenu, user, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const current = Object.values(moduleConfigs).find((item) => item.route === pathname);
  const allowedNavigation = navigationForRole(user?.role);
  const title = pathname === '/'
    ? 'Dashboard'
    : pathname.startsWith('/patients/') ? 'Patient profile' : current?.label || 'Dashboard';
  const matches = allowedNavigation.flatMap((group) => group.items).filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5);
  const notifications = [
    { module: 'appointments', title: 'Appointments today', text: 'Review your upcoming schedule', path: '/appointments', tone: '' },
    { module: 'billing', title: 'Pending invoices', text: 'Follow up on outstanding payments', path: '/billing', tone: 'amber-dot' },
  ].filter((item) => hasPermission(user?.role, item.module, 'read'));
  const goTo = (path) => { navigate(path); setQuery(''); };
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Open menu" onClick={onMenu}><Menu size={21} /></button>
      <div className="breadcrumb"><span>CarePoint</span><i>/</i><strong>{title}</strong></div>
      <div className="topbar-actions">
        <div className="global-search-wrap"><label className="top-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) goTo(matches[0].path); if (event.key === 'Escape') setQuery(''); }} placeholder="Search pages..." aria-label="Search pages" /><kbd>⌘ K</kbd></label>
          {query && <div className="global-search-results">{matches.length ? matches.map((item) => <button key={item.path} onClick={() => goTo(item.path)}><item.icon size={16} /><span>{item.label}</span></button>) : <p>No matching pages</p>}</div>}
        </div>
        {notifications.length > 0 && <div className="notification-wrap"><button className="notification-button icon-button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((shown) => !shown)}><Bell size={19} /><i /></button>
          {showNotifications && <div className="notification-popover"><strong>Notifications</strong>{notifications.map((item) => <button key={item.module} onClick={() => { goTo(item.path); setShowNotifications(false); }}><span className={`notification-dot ${item.tone}`} /><span><b>{item.title}</b><small>{item.text}</small></span></button>)}</div>}
        </div>}
        <div className="top-divider" />
        <button className="profile-button" onClick={onLogout} title="Sign out">
          <span className="avatar avatar-navy">{String(user?.name || 'User').split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <span className="profile-copy"><strong>{user?.name || 'User'}</strong><small>{user?.role || ''}</small></span>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
