import React, { useState } from 'react';
import './PatientQueryForm.css';

const PatientQueryForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    whatsappNumber: '',
    queryDetails: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Your query has been submitted successfully. We will contact you soon.');
        setFormData({ patientName: '', contactNumber: '', email: '', whatsappNumber: '', queryDetails: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit query. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="patient-query-form">
      <h3 style={{ marginBottom: '20px' }}>Patient Query Form</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Patient Name *</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Contact Number *</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Brief Details of Query or Issue *</label>
          <textarea
            name="queryDetails"
            value={formData.queryDetails}
            onChange={handleChange}
            required
            rows={5}
            className="form-textarea"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="submit-button"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Query'}
        </button>
        {status === 'success' && <p className="success-message">{message}</p>}
        {status === 'error' && <p className="error-message">{message}</p>}
      </form>
    </div>
  );
};

export default PatientQueryForm;
