import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const navigate = useNavigate();

  const handleNav = (page: string) => {
    setCurrentPage(page);
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <span>Clinical Trials Registry - India (CTRI) Data</span>
          <span>Total Registered Trials: 119,983</span>
        </div>
      </div>
      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              <h1>Care for the Needy Patients</h1>
              <p>Find Clinical Trials in India for Your Disease</p>
            </div>
          </Link>
          <nav className="nav">
            <button
              className={currentPage === 'home' ? 'active' : ''}
              onClick={() => handleNav('home')}
            >
              Home
            </button>
            <button
              className={currentPage === 'search' ? 'active' : ''}
              onClick={() => handleNav('search')}
            >
              Search Trials
            </button>
            <button
              className={currentPage === 'about' ? 'active' : ''}
              onClick={() => handleNav('about')}
            >
              About
            </button>
            <button
              className={currentPage === 'contact' ? 'active' : ''}
              onClick={() => handleNav('contact')}
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
