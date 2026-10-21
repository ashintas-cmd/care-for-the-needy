import React, { useState } from 'react';
import PatientQueryForm from '../components/PatientQueryForm';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the form data to a server
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="trials-section">
      <div className="container">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>Have questions or need help finding a clinical trial? We're here to help.</p>
        </div>

        <div className="detail-card" style={{ marginBottom: '32px' }}>
          <h3>Patient Query Form</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
            Please fill out this form and our team will get back to you.
          </p>
          <PatientQueryForm />
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-card">
              <h3>Send Us a Message</h3>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h4>Message Sent Successfully!</h4>
                  <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                    Thank you for reaching out. We will get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        background: 'white'
                      }}
                    >
                      <option value="">Select a subject</option>
                      <option value="finding-trial">Help Finding a Trial</option>
                      <option value="trial-information">Trial Information</option>
                      <option value="participation">Participation Questions</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="detail-card">
              <h3>Contact Information</h3>
              <div className="detail-row">
                <span className="detail-label">Contact Person</span>
                <span className="detail-value">Ashish Tripathi</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  <a href="mailto:Ash.intas@gmail.com" style={{ color: 'var(--primary)' }}>
                    Ash.intas@gmail.com
                  </a>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Organization</span>
                <span className="detail-value">Bharat AI Research Center</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location</span>
                <span className="detail-value">Hisar, Haryana</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>About This Initiative</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.8' }}>
                Care for the Needy Patients is a social initiative in collaboration with
                Bharat AI Research Center, Hisar. Our goal is to make clinical trial information
                accessible to all patients in India.
              </p>
            </div>

            <div className="detail-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h3 style={{ color: 'var(--primary)' }}>Quick Help</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '12px' }}>
                <strong>Finding a Trial:</strong> Use our search feature to find trials by disease, condition, or location.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '12px' }}>
                <strong>Eligibility:</strong> Check the trial details page for inclusion and exclusion criteria.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                <strong>Contact:</strong> Each trial site has contact information for the principal investigator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
