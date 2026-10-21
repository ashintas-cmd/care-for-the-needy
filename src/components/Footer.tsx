import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Care for the Needy Patients</h4>
            <p>
              A social initiative to help patients find clinical trials in India.
              We provide easy access to CTRI data for recruiting studies.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/search">Search Trials</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://ctri.nic.in" target="_blank" rel="noopener noreferrer">
              CTRI Official Website
            </a>
            <a href="https://www.icmr.gov.in" target="_blank" rel="noopener noreferrer">
              ICMR
            </a>
            <a href="https://www.who.int/ictrp" target="_blank" rel="noopener noreferrer">
              WHO ICTRP
            </a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Ashish Tripathi</p>
            <p>📧 Ash.intas@gmail.com</p>
            <p>📍 Bharat AI Research Center, Hisar</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Care for the Needy Patients. A social initiative in collaboration with Bharat AI Research Center, Hisar.
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Disclaimer: This website is for awareness purposes only. Always consult your doctor before participating in any clinical trial.
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Trial data is sourced from the Clinical Trials Registry - India (CTRI) via the WHO ICTRP and refreshed every 15 days.
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            <Link to="/admin" style={{ color: 'inherit', opacity: 0.75 }}>Admin Login</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
