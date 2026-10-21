import React from 'react';
import { Link } from 'react-router-dom';
import { Trial } from '../data/trials';

interface TrialCardProps {
  trial: Trial;
}

const TrialCard: React.FC<TrialCardProps> = ({ trial }) => {
  return (
    <Link to={`/trial/${trial.id}`} style={{ textDecoration: 'none' }}>
      <div className="trial-card">
        <div className="trial-header">
          <h3 className="trial-title">{trial.title}</h3>
          <span className={`trial-badge ${trial.recruitmentStatus === 'Recruiting' ? 'badge-recruiting' : 'badge-not-recruiting'}`}>
            {trial.recruitmentStatus}
          </span>
        </div>

        <div className="trial-info">
          <div className="trial-info-item">
            <span>🏥</span>
            <span>{trial.condition}</span>
          </div>
          <div className="trial-info-item">
            <span>💊</span>
            <span>{trial.intervention}</span>
          </div>
          <div className="trial-info-item">
            <span>📍</span>
            <span>{trial.locations.join(', ')}</span>
          </div>
          <div className="trial-info-item">
            <span>👤</span>
            <span>PI: {trial.principalInvestigator}</span>
          </div>
          <div className="trial-info-item">
            <span>📊</span>
            <span>{trial.phase} | {trial.enrolled}/{trial.enrollmentTarget} enrolled</span>
          </div>
        </div>

        <div className="trial-footer">
          <span className="trial-ctri">{trial.ctriNumber}</span>
          <span className="trial-link">View Details →</span>
        </div>
      </div>
    </Link>
  );
};

export default TrialCard;
