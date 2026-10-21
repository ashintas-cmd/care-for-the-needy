import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrialCard from '../components/TrialCard';
import { fetchStats, fetchTrials } from '../services/trialsApi';
import type { Trial } from '../data/trials';

interface FilterOptions {
  conditions: string[];
  states: string[];
  phases: string[];
}

const emptyOptions: FilterOptions = { conditions: [], states: [], phases: [] };

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [state, setState] = useState('All');
  const [phase, setPhase] = useState('All');
  const [rawResults, setRawResults] = useState<Trial[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [options, setOptions] = useState<FilterOptions>(emptyOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the filter values once from the database, so dropdowns always match
  // the trials that actually exist in Firestore.
  useEffect(() => {
    let cancelled = false;

    fetchStats()
      .then(stats => {
        if (cancelled) return;
        setOptions({
          conditions: stats.conditions,
          states: stats.states,
          phases: stats.phases
        });
      })
      .catch(() => {
        // Dropdowns stay empty when the stats endpoint is unavailable; the
        // trial search below still reports the real error.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const q = searchParams.get('q') || '';
    const c = searchParams.get('condition') || 'All';
    setQuery(q);
    setCondition(c);
    setLoading(true);
    setError('');

    fetchTrials({
      q: q || undefined,
      // The backend's text search does not apply the condition filter, so the
      // condition is filtered on the client whenever a text query is present.
      condition: !q && c !== 'All' ? c : undefined,
      state: state !== 'All' ? state : undefined,
      phase: phase !== 'All' ? phase : undefined,
      limit: 100
    })
      .then(({ trials, pagination }) => {
        if (cancelled) return;
        setRawResults(trials);
        setHasMore(Boolean(pagination && pagination.hasMore));
      })
      .catch(err => {
        if (!cancelled) {
          setRawResults([]);
          setHasMore(false);
          setError(err instanceof Error ? err.message : 'Failed to load trials');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, state, phase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (query) params.q = query;
    if (condition !== 'All') params.condition = condition;
    setSearchParams(params);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    setError('');

    try {
      const q = searchParams.get('q') || '';
      const c = searchParams.get('condition') || 'All';

      const { trials, pagination } = await fetchTrials({
        q: q || undefined,
        condition: !q && c !== 'All' ? c : undefined,
        state: state !== 'All' ? state : undefined,
        phase: phase !== 'All' ? phase : undefined,
        limit: 100,
        offset: rawResults.length
      });

      setRawResults(prev => {
        const ids = new Set(prev.map(item => item.id));
        return [...prev, ...trials.filter(item => !ids.has(item.id))];
      });
      setHasMore(Boolean(pagination && pagination.hasMore));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more trials');
    } finally {
      setLoadingMore(false);
    }
  };

  const results = condition !== 'All'
    ? rawResults.filter(t => t.condition.toLowerCase().includes(condition.toLowerCase()))
    : rawResults;

  const clearFilters = () => {
    setQuery('');
    setCondition('All');
    setState('All');
    setPhase('All');
    setSearchParams({});
  };

  return (
    <div className="trials-section">
      <div className="container">
        <div className="section-header">
          <h2>Search Clinical Trials</h2>
          <p>Find recruiting clinical trials that match your criteria</p>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
          <div className="search-box" style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search by disease, condition, drug, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                minWidth: '200px',
                background: 'white'
              }}
            >
              <option value="All">All Conditions</option>
              {options.conditions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                minWidth: '180px',
                background: 'white'
              }}
            >
              <option value="All">All States</option>
              {options.states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                minWidth: '180px',
                background: 'white'
              }}
            >
              <option value="All">All Phases</option>
              {options.phases.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Filters
            </button>
          </div>
        </form>

        <div style={{ marginBottom: '24px', color: 'var(--text-light)' }}>
          {loading ? (
            'Loading trials from the database...'
          ) : error ? (
            <span style={{ color: '#b91c1c' }}>Could not load trials. {error}</span>
          ) : (
            <>Found <strong>{results.length}{hasMore ? '+' : ''}</strong> recruiting trials</>
          )}
        </div>

        {/* Awareness Notice */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>⚠️</span>
          <div>
            <strong style={{ color: '#92400e' }}>Patient Awareness Notice:</strong>
            <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px', lineHeight: 1.6 }}>
              This information is for awareness only and is not medical advice. Clinical trials are research studies -
              you may receive investigational treatment, standard care, or placebo. Participation is voluntary and
              requires informed consent. Always verify current information directly with the study site and the{' '}
              <a href="https://ctri.nic.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                original CTRI registry
              </a>{' '}
              before making any decision. <strong>Never pay money or share personal medical information</strong> based on listings on this website.
            </p>
          </div>
        </div>

        {!loading && !error && results.length > 0 && (
          <>
            <div className="trials-grid">
              {results.map(trial => (
                <TrialCard key={trial.id} trial={trial} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '12px 28px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loadingMore ? 'wait' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load more trials'}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h3>No trials found</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
