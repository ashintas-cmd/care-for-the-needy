import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Watermark from './components/Watermark';
import PatientAwarenessBanner from './components/PatientAwarenessBanner';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TrialDetailPage from './pages/TrialDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function AppShell() {
  const [currentPage, setCurrentPage] = useState('home');
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdmin && <PatientAwarenessBanner />}
      {!isAdmin && <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trial/:id" element={<TrialDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <Watermark />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
