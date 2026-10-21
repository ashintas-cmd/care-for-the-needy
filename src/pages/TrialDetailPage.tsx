import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTrial } from '../services/trialsApi';
import type { Trial } from '../data/trials';

const TrialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchTrial(id || '')
      .then(result => {
        if (!cancelled) setTrial(result);
      })
      .catch(err => {
        if (!cancelled) {
          setTrial(null);
          setError(err instanceof Error ? err.message : 'Failed to load trial');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>
            Loading trial details from the database...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <h2>Could not load this trial</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>{error}</p>
            <Link to="/search" style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
            <h2>Trial Not Found</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
              The trial you are looking for does not exist or has been removed.
            </p>
            <Link to="/search" style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/search" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--primary)',
          textDecoration: 'none',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          ← Back to Search
        </Link>

        {/* Patient Awareness Notice */}
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
            <strong style={{ color: '#92400e' }}>Important Patient Information:</strong>
            <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px', lineHeight: 1.6 }}>
              This trial information is for awareness only. Participation is voluntary and requires informed consent.
              You may receive investigational treatment, standard care, or placebo. Final eligibility is determined by
              the study team. Verify all information with the study site and{' '}
              <a href="https://ctri.nic.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                CTRI registry
              </a>
              . <strong>Never pay money</strong> to participate in a clinical trial.
            </p>
          </div>
        </div>

        <div className="detail-header">
          <div className="trial-header" style={{ marginBottom: '16px' }}>
            <h1 className="detail-title">{trial.title}</h1>
            <span className={`trial-badge ${trial.recruitmentStatus === 'Recruiting' ? 'badge-recruiting' : 'badge-not-recruiting'}`}>
              {trial.recruitmentStatus}
            </span>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '16px' }}>
            <strong>Scientific Title:</strong> {trial.scientificTitle}
          </p>
          <div className="detail-meta">
            <div className="detail-meta-item">
              <span>📋</span> {trial.ctriNumber}
            </div>
            <div className="detail-meta-item">
              <span>📊</span> {trial.phase}
            </div>
            <div className="detail-meta-item">
              <span>📅</span> Last Updated: {trial.lastUpdated}
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-card">
              <h3>Study Information</h3>
              <div className="detail-row">
                <span className="detail-label">Study Type</span>
                <span className="detail-value">{trial.studyType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Study Design</span>
                <span className="detail-value">{trial.studyDesign}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Condition</span>
                <span className="detail-value">{trial.condition}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Intervention</span>
                <span className="detail-value">{trial.intervention}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sponsor</span>
                <span className="detail-value">{trial.sponsor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sponsor Type</span>
                <span className="detail-value">{trial.sponsorType}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Enrollment</h3>
              <div className="detail-row">
                <span className="detail-label">Target Sample Size</span>
                <span className="detail-value">{trial.enrollmentTarget} participants</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Currently Enrolled</span>
                <span className="detail-value">{trial.enrolled} participants</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{trial.startDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Expected Completion</span>
                <span className="detail-value">{trial.completionDate}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Eligibility Criteria</h3>
              <div className="detail-row">
                <span className="detail-label">Age Range</span>
                <span className="detail-value">{trial.eligibility.minAge} - {trial.eligibility.maxAge}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{trial.eligibility.gender}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Inclusion Criteria</span>
                <span className="detail-value">{trial.eligibility.inclusionCriteria}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Exclusion Criteria</span>
                <span className="detail-value">{trial.eligibility.exclusionCriteria}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Outcomes</h3>
              {trial.outcomes.map((outcome, index) => (
                <div key={index} className="detail-row">
                  <span className="detail-label">{outcome.type} Outcome</span>
                  <span className="detail-value">
                    {outcome.name} ({outcome.timeframe})
                  </span>
                </div>
              ))}
            </div>

            <div className="detail-card">
              <h3>Brief Summary</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.8' }}>
                {trial.briefSummary}
              </p>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="detail-card">
              <h3>Principal Investigator</h3>
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{trial.principalInvestigator}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Affiliation</span>
                <span className="detail-value">{trial.piAffiliation}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Contact Information</h3>
              <div className="detail-row">
                <span className="detail-label">Contact Person</span>
                <span className="detail-value">{trial.contactPerson}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  <a href={`mailto:${trial.contactEmail}`} style={{ color: 'var(--primary)' }}>
                    {trial.contactEmail}
                  </a>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{trial.contactPhone}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Trial Sites</h3>
              {trial.sites.map((site, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{site.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{site.address}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{site.city}, {site.state}</div>
                  <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '4px' }}>
                    📞 {site.phone}
                  </div>
                </div>
              ))}
            </div>

            <div className="detail-card">
              <h3>Regulatory Information</h3>
              <div className="detail-row">
                <span className="detail-label">Ethics Committee</span>
                <span className="detail-value">{trial.ethicsCommittee}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">DCGI Approval</span>
                <span className="detail-value">{trial.dcgIApproval}</span>
              </div>
            </div>

            <div className="detail-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h3 style={{ color: 'var(--primary)' }}>About This Trial</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                This trial is registered with the Clinical Trials Registry - India (CTRI).
                For more information, visit the{' '}
                <a href={trial.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                  official CTRI page
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialDetailPage;
