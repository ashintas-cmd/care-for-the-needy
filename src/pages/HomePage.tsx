import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrialCard from '../components/TrialCard';
import PatientQueryForm from '../components/PatientQueryForm';
import { fetchStats, fetchTrials, TrialStats } from '../services/trialsApi';
import { imageForSlot } from '../services/imagesApi';
import useSiteImages from '../hooks/useSiteImages';
import type { Trial } from '../data/trials';
import './HomePage.css';

const emptyStats: TrialStats = {
  total: 0,
  recruiting: 0,
  conditions: [],
  states: [],
  phases: []
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [stats, setStats] = useState<TrialStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { images: siteImages } = useSiteImages();
  const heroImage = imageForSlot(siteImages, 'hero');
  const careImage = imageForSlot(siteImages, 'care');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [trialList, summary] = await Promise.all([
          fetchTrials({ status: 'Recruiting', limit: 6 }),
          fetchStats().catch(() => null)
        ]);

        if (cancelled) return;

        setTrials(trialList.trials);
        setStats(summary || {
          total: trialList.trials.length,
          recruiting: trialList.trials.length,
          conditions: Array.from(new Set(trialList.trials.map(t => t.condition).filter(Boolean))),
          states: Array.from(new Set(trialList.trials.map(t => t.state).filter(Boolean))),
          phases: Array.from(new Set(trialList.trials.map(t => t.phase).filter(Boolean)))
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load trials');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const conditions = stats.conditions.length > 0
    ? stats.conditions
    : Array.from(new Set(trials.map(t => t.condition).filter(Boolean)));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleConditionClick = (condition: string) => {
    navigate(`/search?condition=${encodeURIComponent(condition)}`);
  };

  const statsCards = [
    { number: stats.total.toString(), label: 'Total Registered Trials' },
    { number: stats.recruiting.toString(), label: 'Currently Recruiting' },
    { number: stats.states.length.toString(), label: 'States Covered' },
    { number: 'Free', label: 'For Patients' }
  ];

  const awarenessPoints = [
    {
      icon: "🔍",
      title: "Independent Platform",
      text: "We do not advertise, promote, endorse, or recommend any clinical trial, medicine, sponsor, or hospital."
    },
    {
      icon: "💊",
      title: "Research Studies",
      text: "Clinical trials are research studies. You may receive investigational treatment, standard care, or placebo."
    },
    {
      icon: "✋",
      title: "Voluntary Participation",
      text: "Participation is always voluntary. You must receive informed consent before joining any trial."
    },
    {
      icon: "⚠️",
      title: "Verify Information",
      text: "Trial details may change. Always verify with the study site and original CTRI registry before deciding."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Care for the Needy · Patient Awareness</span>
            <h2>Find Clinical Trials in India</h2>
            <p>
              Search for recruiting clinical trials across India. Get information about trial locations,
              eligibility criteria, and contact details. Our mission is to make clinical trial information
              accessible to all patients.
            </p>

            <form onSubmit={handleSearch} className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by disease, condition, drug, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search Trials</button>
              </div>
            </form>

            <div className="quick-filters">
              {conditions.slice(0, 8).map(condition => (
                <button
                  key={condition}
                  className="filter-chip"
                  onClick={() => handleConditionClick(condition)}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <figure className="hero-visual">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              decoding="async"
            />
          </figure>
        </div>
      </section>

      {/* Patient Awareness Section */}
      <section className="awareness-section">
        <div className="container">
          <div className="awareness-header">
            <span className="awareness-icon">📢</span>
            <h2>Important Patient Awareness</h2>
            <p>Please read this important information before using this website</p>
          </div>

          <div className="awareness-grid">
            {awarenessPoints.map((point, index) => (
              <div key={index} className="awareness-card">
                <div className="awareness-card-icon">{point.icon}</div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            ))}
          </div>

          <div className="awareness-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <strong>Disclaimer:</strong> This website is for awareness purposes only and is not a substitute
              for professional medical advice, diagnosis, treatment, or emergency medical care. No payment should
              be made or personal medical information shared with unknown persons based on listings on this website.
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {statsCards.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Section */}
      <section className="care-section">
        <div className="container care-grid">
          <figure className="care-visual">
            <img
              src={careImage.src}
              alt={careImage.alt}
              width={careImage.width}
              height={careImage.height}
              loading="lazy"
              decoding="async"
            />
            {careImage.caption && <figcaption>{careImage.caption}</figcaption>}
          </figure>

          <div className="care-copy">
            <span className="care-eyebrow">Beyond the trial</span>
            <h2>Care that reaches the bedside</h2>
            <p>
              A clinical trial is only one part of a patient's journey. Behind every listing on this
              platform is a person — often an older parent, a spouse or a child — looking for clear,
              honest information and dignified care close to home.
            </p>
            <ul className="care-points">
              <li>Every trial is linked back to the original CTRI registry entry for verification</li>
              <li>Free to use, always — this platform is a social initiative, not a paid service</li>
              <li>Written for patients and caregivers, not only for researchers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recent Trials */}
      <section className="trials-section">
        <div className="container">
          <div className="section-header">
            <h2>Currently Recruiting Trials</h2>
            <p>These trials are actively looking for participants. Click on a trial to learn more.</p>
          </div>
          <div className="trials-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                Loading trials from the database...
              </div>
            ) : error ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#b91c1c' }}>
                Could not load trials. {error}
              </div>
            ) : trials.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                No recruiting trials are available right now.
              </div>
            ) : (
              trials.slice(0, 6).map(trial => (
                <TrialCard key={trial.id} trial={trial} />
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/search" style={{
              display: 'inline-block',
              background: 'var(--primary)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px'
            }}>
              View All Recruiting Trials
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="trials-section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to find a clinical trial for your condition</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ marginBottom: '8px' }}>Search</h3>
              <p>Enter your disease, condition, or location to find relevant clinical trials</p>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ marginBottom: '8px' }}>Review</h3>
              <p>Check trial details, eligibility criteria, and locations near you</p>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
              <h3 style={{ marginBottom: '8px' }}>Contact</h3>
              <p>Reach out to the trial team using the provided contact information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Query Form Section */}
      <section className="trials-section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <h2>Have a Question?</h2>
            <p>Submit your query and our team will get back to you</p>
          </div>
          <PatientQueryForm />
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-card">
            <h3>Need Help Finding a Trial?</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Our team is here to help you navigate clinical trial options and answer your questions.
            </p>
            <div className="contact-person">
              <div className="contact-avatar">AT</div>
              <div className="contact-info">
                <h4>Ashish Tripathi</h4>
                <p>📧 Ash.intas@gmail.com</p>
                <p>📍 Bharat AI Research Center, Hisar</p>
              </div>
            </div>
            <Link to="/contact" style={{
              display: 'inline-block',
              marginTop: '24px',
              background: 'var(--secondary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
