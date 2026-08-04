import { useEffect } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './FailedScreen.css';

export function FailedScreen({ reason, onContinue }) {
  useEffect(() => {
    soundSystem.playCustomerLeave();
  }, []);

  return (
    <div className="failed-screen">
      <div className="failed-card">
        <div className="failed-icon">😞</div>
        <h2>CUSTOMER LEFT!</h2>
        <p className="failed-reason">{reason}</p>
        <p className="failed-desc">Don't worry, another customer will arrive soon!</p>
        
        <button className="continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
