import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, HeartPulse, LockKeyhole, X } from 'lucide-react';
import carepointLogo from '../assets/carepoint-logo.png';
import { sidebarNavigationForRole } from '../data/modules';

export default function Sidebar({ open, onClose, collapsed, onToggle, user }) {
  const groups = sidebarNavigationForRole(user?.role);
  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="brand">
          {collapsed
            ? <div className="brand-mark"><HeartPulse size={22} strokeWidth={2.2} /></div>
            : <img className="sidebar-logo" src={carepointLogo} alt="CarePoint Hospital Management System" />}
          <button className="mobile-close icon-button" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
        </div>
        <div className="sidebar-scroll">
          {groups.map((group) => (
            <section className="nav-section" key={group.section}>
              {!collapsed && <p className="nav-heading">{group.section}</p>}
              {group.items.map(({ label, path, icon: Icon, allowed }) => (
                allowed
                  ? <NavLink key={path} to={path} end={path === '/'} title={collapsed ? label : undefined}
                    onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                  </NavLink>
                  : <div key={path} className="nav-link nav-link-locked" role="link" aria-disabled="true"
                    aria-label={`${label} is unavailable for the ${user?.role || 'current'} role`}
                    title={collapsed ? `${label} (locked)` : undefined}>
                    <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                    <LockKeyhole className="nav-lock" size={14} aria-hidden="true" />
                  </div>
              ))}
            </section>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="online-indicator"><i /><span>{!collapsed && 'All systems operational'}</span></div>
          <button className="collapse-button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse menu</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
