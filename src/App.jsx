import { lazy, Suspense, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import carepointLogo from './assets/carepoint-logo.png';
import ModulePage from './pages/ModulePage';
import PatientDetailPage from './pages/PatientDetailPage';
import { moduleConfigs } from './data/modules';
import { api, errorMessage, refreshSession, setAccessToken } from './services/api';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function AppLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const location = useLocation();
  const notify = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.toastTimer);
    window.toastTimer = window.setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };
  return <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} user={user} />
    <div className="main-column"><Header onMenu={() => setSidebarOpen(true)} user={user} onLogout={onLogout} />
      <main key={location.pathname} className="main-content"><Suspense fallback={<div className="loading-state">Loading your workspace…</div>}><Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/patients/:patientId" element={<PatientDetailPage />} />
        {Object.values(moduleConfigs).map((config) => <Route key={config.route} path={config.route}
          element={<ModulePage key={config.store} config={config} notify={notify} user={user} />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></Suspense></main>
      <footer className="app-footer"><span>© 2026 CarePoint Medical Center</span><span>Secure · Reliable · Patient-first</span></footer>
    </div>
    <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
  </div>;
}

export default function App() {
  const [session, setSession] = useState({ loading: true, setupRequired: false, user: null, error: '' });
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canRetryBackend, setCanRetryBackend] = useState(false);

  const checkSetup = async () => {
    try {
      const response = await api.get('/auth/setup-status');
      setCanRetryBackend(false);
      setSession((current) => ({ ...current, loading: false, setupRequired: response.data.data.setupRequired, error: '' }));
    } catch (error) {
      setCanRetryBackend(true);
      setSession((current) => ({ ...current, loading: false, error: errorMessage(error, 'Cannot connect to the backend.') }));
    }
  };

  useEffect(() => {
    let active = true;
    const expireSession = () => {
      setAccessToken(null);
      setSession({ loading: false, setupRequired: false, user: null, error: 'Your session expired. Please sign in again.' });
    };
    window.addEventListener('carepoint:session-expired', expireSession);
    refreshSession().then((data) => {
      if (!active) return;
      setCanRetryBackend(false);
      setSession({ loading: false, setupRequired: false, user: data.user, error: '' });
    }).catch(async () => {
      if (active) await checkSetup();
    });
    return () => {
      active = false;
      window.removeEventListener('carepoint:session-expired', expireSession);
    };
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setSession((current) => ({ ...current, loading: true, error: '' }));
    setAuthNotice('');
    setCanRetryBackend(false);
    try {
      if (!session.setupRequired && authMode === 'register') {
        const response = await api.post('/auth/register', {
          name: credentials.name, email: credentials.email, password: credentials.password,
        });
        setCredentials((current) => ({ ...current, password: '' }));
        setAuthMode('login');
        setAuthNotice(response.data.message);
        setSession((current) => ({ ...current, loading: false, error: '' }));
        return;
      }
      const path = session.setupRequired ? '/auth/setup' : '/auth/login';
      const payload = session.setupRequired
        ? { name: credentials.name, email: credentials.email, password: credentials.password }
        : { email: credentials.email, password: credentials.password };
      const response = await api.post(path, payload);
      setAccessToken(response.data.data.accessToken);
      setSession({ loading: false, setupRequired: false, user: response.data.data.user, error: '' });
    } catch (error) {
      const needsRegistration = error.response?.status === 401;
      const message = needsRegistration
        ? 'Email or password is incorrect. If you are new, create an account; an administrator must approve it before you can sign in.'
        : errorMessage(error, 'Unable to sign in.');
      setCanRetryBackend(!error.response || error.response.status >= 500);
      setSession((current) => ({ ...current, loading: false, error: message }));
    }
  };

  const signOut = async () => {
    let logoutError = '';
    try {
      await api.post('/auth/logout');
    } catch (error) {
      logoutError = errorMessage(error, 'Could not confirm sign out with the server.');
    } finally {
      setAccessToken(null);
      setSession({ loading: false, setupRequired: false, user: null, error: logoutError });
      await checkSetup();
      if (logoutError) setSession((current) => ({ ...current, error: logoutError }));
    }
  };

  if (session.loading && !session.user) return <div className="auth-screen"><div className="auth-card">Connecting securely to CarePoint…</div></div>;
  if (!session.user) return <div className="auth-screen">
    <form className="auth-card" onSubmit={signIn}>
      <div className="auth-brand"><img src={carepointLogo} alt="CarePoint Hospital Management System" /></div>
      <h1>{session.setupRequired ? 'Set up your hospital admin' : authMode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
      <p>{session.setupRequired ? 'Create the first administrator account to secure this workspace.' : authMode === 'register' ? 'Register with any email. An administrator must approve your account before access.' : 'Sign in with an active account. New accounts need administrator approval.'}</p>
      {session.error && <div className="inline-error" role="alert">{session.error}</div>}
      {authNotice && <div className="auth-notice" role="status">{authNotice}</div>}
      {(session.setupRequired || authMode === 'register') && <label className="auth-field">Full name<input autoComplete="name" required minLength={2} maxLength={160} value={credentials.name} onChange={(event) => setCredentials({ ...credentials, name: event.target.value })} /></label>}
      <label className="auth-field">Email<input type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
      <label className="auth-field">Password<div className="password-input-wrap">
        <input type={passwordVisible ? 'text' : 'password'} autoComplete={session.setupRequired || authMode === 'register' ? 'new-password' : 'current-password'} required minLength={session.setupRequired || authMode === 'register' ? 12 : 1} value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
        <button className="password-toggle" type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)}>
          {passwordVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
        {(session.setupRequired || authMode === 'register') && <small>Use at least 12 characters. Store this password securely.</small>}
      </label>
      <button className="button button-primary auth-submit" disabled={session.loading}>{session.loading ? 'Please wait…' : session.setupRequired ? 'Create administrator' : authMode === 'register' ? 'Request account' : 'Sign in'}</button>
      {!session.setupRequired && <button className="auth-retry" type="button" onClick={() => {
        setAuthMode((mode) => mode === 'login' ? 'register' : 'login');
        setAuthNotice('');
        setCanRetryBackend(false);
        setSession((current) => ({ ...current, error: '' }));
      }}>{authMode === 'register' ? 'Already have an account? Sign in' : 'Use a different email? Create an account'}</button>}
      {canRetryBackend && <button className="auth-retry" type="button" onClick={checkSetup}>Retry backend connection</button>}
    </form>
  </div>;
  return <AppLayout user={session.user} onLogout={signOut} />;
}
