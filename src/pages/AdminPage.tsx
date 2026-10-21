import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  fetchQueries,
  fetchQueryStats,
  PatientQuery,
  QueryStats,
  updateQueryStatus
} from '../services/adminApi';
import './AdminPage.css';

const emptyStats: QueryStats = { total: 0, pending: 0, contacted: 0, closed: 0 };
const STATUSES = ['pending', 'contacted', 'closed'] as const;

const formatDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const csvCell = (value: unknown): string => {
  let text = String(value === null || value === undefined ? '' : value);
  // Prevent spreadsheet formula injection from patient-entered text.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const statusLabel = (status: string): string =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';

const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  const [queries, setQueries] = useState<PatientQuery[]>([]);
  const [stats, setStats] = useState<QueryStats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<PatientQuery | null>(null);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdTokenResult();
        if (token.claims.role !== 'admin') {
          await signOut(auth);
          setUser(null);
          setAuthError('This account does not have admin access.');
        } else {
          setUser(currentUser);
        }
      } catch {
        // If claims cannot be read, let the API decide.
        setUser(currentUser);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [list, summary] = await Promise.all([fetchQueries(), fetchQueryStats()]);
      setQueries(list.queries);
      setStats(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const visibleQueries = useMemo(() => {
    const term = search.trim().toLowerCase();

    return queries.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;

      return [
        item.patientName,
        item.contactNumber,
        item.email,
        item.whatsappNumber,
        item.queryDetails
      ].some(value => value.toLowerCase().includes(term));
    });
  }, [queries, search, statusFilter]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setSigningIn(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (
        code.includes('invalid-credential') ||
        code.includes('wrong-password') ||
        code.includes('user-not-found')
      ) {
        setAuthError('Email or password is incorrect.');
      } else if (code.includes('too-many-requests')) {
        setAuthError('Too many attempts. Please wait a few minutes and try again.');
      } else if (code.includes('operation-not-allowed')) {
        setAuthError('Email/password sign-in is not enabled for this project.');
      } else {
        setAuthError(err instanceof Error ? err.message : 'Sign in failed.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError('');
    setAuthNotice('');

    if (!email.trim()) {
      setAuthError('Please type your admin email first, then click "Forgot password".');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthNotice('Password reset email sent. Please check your inbox and spam folder.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Could not send the reset email.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setQueries([]);
    setStats(emptyStats);
    setSelected(null);
    setPassword('');
  };

  const changeStatus = async (query: PatientQuery, status: string) => {
    if (status === query.status) return;

    setUpdatingId(query.id);
    setError('');

    try {
      const updated = await updateQueryStatus(query.id, status);

      setQueries(prev =>
        prev.map(item =>
          item.id === query.id
            ? { ...item, status: updated.status, updatedAt: updated.updatedAt || item.updatedAt }
            : item
        )
      );
      setSelected(prev =>
        prev && prev.id === query.id
          ? { ...prev, status: updated.status, updatedAt: updated.updatedAt || prev.updatedAt }
          : prev
      );

      fetchQueryStats().then(setStats).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId('');
    }
  };

  const downloadCsv = () => {
    const rows = [
      ['Date', 'Patient Name', 'Contact Number', 'Email', 'WhatsApp', 'Query', 'Status'],
      ...visibleQueries.map(item => [
        item.createdAt,
        item.patientName,
        item.contactNumber,
        item.email,
        item.whatsappNumber,
        item.queryDetails,
        item.status
      ])
    ];

    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `patient-queries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="admin-page">
        <div className="admin-centered">Checking sign-in status...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <div className="admin-brand-block">
            <span className="admin-brand-icon">🏥</span>
            <div>
              <h1>Admin Login</h1>
              <p>Care for the Needy Patients</p>
            </div>
          </div>

          <p className="admin-login-note">
            This area contains confidential patient information. Only authorised
            administrators can sign in.
          </p>

          <form onSubmit={handleLogin}>
            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="admin-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </label>

            {authError && <div className="admin-alert admin-alert-error">{authError}</div>}
            {authNotice && <div className="admin-alert admin-alert-success">{authNotice}</div>}

            <button type="submit" className="admin-primary-button" disabled={signingIn}>
              {signingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <button type="button" className="admin-link-button" onClick={handleForgotPassword}>
            Forgot password?
          </button>

          <p className="admin-back-link">
            <Link to="/">← Back to website</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-brand-block">
            <span className="admin-brand-icon">🏥</span>
            <div>
              <h1>Patient Queries</h1>
              <p>Care for the Needy Patients · Admin</p>
            </div>
          </div>

          <div className="admin-user-actions">
            <span className="admin-user-email">{user.email}</span>
            <Link className="admin-secondary-button" to="/">View website</Link>
            <button type="button" className="admin-secondary-button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-number">{stats.total}</span>
            <span className="admin-stat-label">Total queries</span>
          </div>
          <div className="admin-stat-card admin-stat-pending">
            <span className="admin-stat-number">{stats.pending}</span>
            <span className="admin-stat-label">Pending</span>
          </div>
          <div className="admin-stat-card admin-stat-contacted">
            <span className="admin-stat-number">{stats.contacted}</span>
            <span className="admin-stat-label">Contacted</span>
          </div>
          <div className="admin-stat-card admin-stat-closed">
            <span className="admin-stat-number">{stats.closed}</span>
            <span className="admin-stat-label">Closed</span>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-toolbar">
            <input
              type="search"
              className="admin-search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, phone, email or query..."
            />

            <select
              className="admin-select"
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              type="button"
              className="admin-primary-button"
              onClick={downloadCsv}
              disabled={visibleQueries.length === 0}
            >
              Download Excel (CSV)
            </button>
          </div>

          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <div className="admin-table-meta">
            Showing <strong>{visibleQueries.length}</strong> of <strong>{queries.length}</strong> queries
          </div>

          {loading && queries.length === 0 ? (
            <div className="admin-empty">Loading queries...</div>
          ) : visibleQueries.length === 0 ? (
            <div className="admin-empty">No queries match your search.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th className="admin-hide-sm">Contact</th>
                    <th className="admin-hide-md">Email</th>
                    <th>Query</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleQueries.map(item => (
                    <tr key={item.id}>
                      <td className="admin-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="admin-strong">{item.patientName}</td>
                      <td className="admin-nowrap admin-hide-sm">{item.contactNumber}</td>
                      <td className="admin-hide-md">{item.email || '—'}</td>
                      <td>
                        <span className="admin-query-preview" title={item.queryDetails}>
                          {item.queryDetails}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${item.status}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-link-button"
                          onClick={() => setSelected(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Query from ${selected.patientName}`}
            onClick={event => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>{selected.patientName}</h2>
                <p>{formatDate(selected.createdAt)}</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div>
                  <span>Contact number</span>
                  <a href={`tel:${selected.contactNumber}`}>{selected.contactNumber}</a>
                </div>
                <div>
                  <span>Email</span>
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div>
                  <span>WhatsApp</span>
                  {selected.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${selected.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selected.whatsappNumber}
                    </a>
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div>
                  <span>Last updated</span>
                  <p>{formatDate(selected.updatedAt)}</p>
                </div>
              </div>

              <div className="admin-query-full">
                <span>Query details</span>
                <p>{selected.queryDetails}</p>
              </div>

              <div className="admin-status-row">
                <label className="admin-field admin-field-inline">
                  <span>Status</span>
                  <select
                    className="admin-select"
                    value={selected.status}
                    disabled={updatingId === selected.id}
                    onChange={event => changeStatus(selected, event.target.value)}
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                {updatingId === selected.id && (
                  <span className="admin-saving">Saving...</span>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-primary-button"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(
                      `${selected.patientName}\n${selected.contactNumber}\n${selected.email}\n\n${selected.queryDetails}`
                    )
                    .catch(() => undefined);
                }}
              >
                Copy details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
