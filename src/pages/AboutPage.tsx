import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="trials-section">
      <div className="container">
        <div className="section-header">
          <h2>About Care for the Needy Patients</h2>
          <p>Our mission is to make clinical trial information accessible to all patients in India</p>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-card">
              <h3>Our Mission</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '16px' }}>
                Care for the Needy Patients is a social initiative dedicated to helping patients find
                clinical trials in India. We believe that every patient deserves access to potentially
                life-saving treatments through clinical research.
              </p>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.8' }}>
                The Clinical Trials Registry - India (CTRI) contains information about thousands of
                clinical trials, but the data is often difficult for common people to navigate. Our
                platform simplifies this information and presents it in an easy-to-understand format.
              </p>
            </div>

            <div className="detail-card">
              <h3>What We Do</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>🔍</span>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Simplify Search</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                      We make it easy to search for clinical trials by disease, condition, location, or treatment type.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>📍</span>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Location-Based Results</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                      Find trials near you with detailed site information and contact details.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>📋</span>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Clear Eligibility Criteria</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                      Understand who can participate with clear inclusion and exclusion criteria.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>📞</span>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Direct Contact Information</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                      Get direct contact details for trial sites and principal investigators.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Data Source</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '16px' }}>
                All trial data on this platform is sourced from the{' '}
                <a href="https://ctri.nic.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                  Clinical Trials Registry - India (CTRI)
                </a>
                , which is maintained by the Indian Council of Medical Research (ICMR).
              </p>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.8' }}>
                CTRI is a free and online public record system for registration of clinical trials
                being conducted in India. It was launched on 20th July 2007 and is a Primary Registry
                of the International Clinical Trials Registry Platform (ICTRP) of the World Health Organization (WHO).
              </p>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="detail-card">
              <h3>Collaboration</h3>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
                <h4 style={{ marginBottom: '8px' }}>Bharat AI Research Center</h4>
                <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                  Hisar, Haryana
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '12px', lineHeight: '1.6' }}>
                  This initiative is developed in collaboration with Bharat AI Research Center, Hisar,
                  leveraging artificial intelligence to improve healthcare accessibility.
                </p>
              </div>
            </div>

            <div className="detail-card">
              <h3>Key Statistics</h3>
              <div className="detail-row">
                <span className="detail-label">Total CTRI Trials</span>
                <span className="detail-value">119,983</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Currently Recruiting</span>
                <span className="detail-value">Available on platform</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">States Covered</span>
                <span className="detail-value">All Indian States</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trial Types</span>
                <span className="detail-value">Interventional, Observational</span>
              </div>
            </div>

            <div className="detail-card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
              <h3 style={{ color: '#92400e' }}>Important Note</h3>
              <p style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.6' }}>
                This platform is for <strong>awareness purposes only</strong>. It is not intended for
                advertisement or promotion of any specific trial or treatment. Always consult your
                healthcare provider before making any medical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
