import React, { useCallback, useEffect, useRef, useState } from 'react';
import './PatientAwarenessBanner.css';

const PatientAwarenessBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Show the "scroll down" hint only while there is more content below.
  const updateScrollHint = useCallback(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const canScroll = modal.scrollHeight - modal.clientHeight > 24;
    const atBottom = modal.scrollTop + modal.clientHeight >= modal.scrollHeight - 24;
    setShowScrollHint(canScroll && !atBottom);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    updateScrollHint();
    const modal = modalRef.current;
    if (!modal) return;

    // Re-check when the modal content grows/shrinks (tab switch, fonts, resize).
    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(modal);
    window.addEventListener('resize', updateScrollHint);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScrollHint);
    };
  }, [isVisible, activeTab, updateScrollHint]);

  const handleScrollDown = () => {
    const modal = modalRef.current;
    if (!modal) return;
    modal.scrollBy({
      top: Math.max(modal.clientHeight * 0.75, 240),
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  const awarenessData = [
    {
      icon: "🔍",
      title: "Independent Awareness Purpose",
      content: "This website is an independent patient-awareness and clinical-trial information platform. Its purpose is solely to help patients and caregivers locate publicly available information about clinical research studies and study sites. The website does not advertise, promote, endorse, solicit participation in, or recommend any clinical trial, investigational product, medicine, sponsor, investigator, hospital or research site.",
      color: "#2563eb"
    },
    {
      icon: "ℹ️",
      title: "Information Only",
      content: "Information displayed on this website is intended for general awareness and navigation only and should not be considered medical advice, a treatment recommendation, confirmation of eligibility, or an assurance that participation in a clinical trial will provide therapeutic benefit or access to free treatment or medication.",
      color: "#10b981"
    },
    {
      icon: "💊",
      title: "Treatment Allocation & Placebo",
      content: "Clinical trials are research studies. Depending on the particular study design, participants may be assigned to an investigational treatment, an approved or active comparator, placebo, standard of care, or another study arm. The method and probability of assignment vary according to the individual study protocol. This website does not determine or influence treatment allocation.",
      color: "#f59e0b"
    },
    {
      icon: "✋",
      title: "Voluntary Participation & Consent",
      content: "Participation in a clinical trial must be voluntary and should occur only after the potential participant has received and understood the study-specific informed-consent information, including the purpose of the research, study procedures, possible risks and potential benefits, available alternatives, confidentiality provisions, applicable compensation or medical-management provisions, and the participant's rights.",
      color: "#8b5cf6"
    },
    {
      icon: "✅",
      title: "Eligibility & Enrollment",
      content: "Inclusion of a clinical trial or research site on this website does not mean that a patient is eligible for the study. Final eligibility and enrollment decisions are made by the responsible study team in accordance with the approved study protocol.",
      color: "#ef4444"
    },
    {
      icon: "🔄",
      title: "Information May Change",
      content: "Clinical-trial information, including recruitment status, site details and contact information, may change. Users should verify current information directly with the relevant study site and the original registry before making any decision.",
      color: "#06b6d4"
    },
    {
      icon: "⚠️",
      title: "Fraud & Privacy Caution",
      content: "No payment should be made or personal medical information shared with an unknown person solely on the basis of a listing on this website.",
      color: "#dc2626"
    },
    {
      icon: "🏥",
      title: "Medical-Care Limitation",
      content: "This website is not a substitute for professional medical advice, diagnosis, treatment or emergency medical care.",
      color: "#7c3aed"
    }
  ];

  return (
    <div className="awareness-overlay">
      <div className="awareness-modal-wrap">
        <div className="awareness-modal" ref={modalRef} onScroll={updateScrollHint}>
          <div className="awareness-header">
            <div className="awareness-header-icon">📢</div>
            <h2>Patient Awareness Platform</h2>
            <p>Important Patient Information and Disclaimer</p>
          </div>

          <div className="awareness-tabs">
            {awarenessData.map((item, index) => (
              <button
                key={index}
                className={`awareness-tab ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                style={{ '--tab-color': item.color } as React.CSSProperties}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-title">{item.title}</span>
              </button>
            ))}
          </div>

          <div className="awareness-content">
            <div className="content-card" style={{ borderLeftColor: awarenessData[activeTab].color }}>
              <div className="content-icon">{awarenessData[activeTab].icon}</div>
              <h3>{awarenessData[activeTab].title}</h3>
              <p>{awarenessData[activeTab].content}</p>
            </div>
          </div>

          <div className="awareness-footer">
            <div className="footer-info">
              <p>
                <strong>Need Help?</strong> Contact Ashish Tripathi at{' '}
                <a href="mailto:Ash.intas@gmail.com">Ash.intas@gmail.com</a>
              </p>
              <p className="footer-note">
                This is a social initiative in collaboration with Bharat AI Research Center, Hisar
              </p>
            </div>
            <button className="close-btn" onClick={() => setIsVisible(false)}>
              I Understand - Continue to Website
            </button>
          </div>
        </div>

        {showScrollHint && (
          <div className="scroll-hint-layer">
            <button
              type="button"
              className="scroll-hint"
              onClick={handleScrollDown}
              aria-label="Scroll down to read more and continue to the website"
            >
              <span className="scroll-hint-text">Scroll down for more</span>
              <span className="scroll-hint-chevrons" aria-hidden="true">
                <span className="chevron" />
                <span className="chevron" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAwarenessBanner;
