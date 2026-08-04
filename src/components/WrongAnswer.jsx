import { useEffect } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './WrongAnswer.css';

export function WrongAnswer({ feedback, patienceLost, onContinue }) {
  useEffect(() => {
    soundSystem.playError();
  }, []);

  return (
    <div className="wrong-answer">
      <div className="wrong-card">
        <div className="wrong-icon">❌</div>
        <h2>WRONG REPAIR!</h2>
        <p className="feedback">{feedback}</p>
        <div className="patience-effect">
          <span>Patience lost:</span>
          <span className="patience-drain">-{patienceLost}%</span>
        </div>
        <p className="hint">Try another repair option!</p>
        
        <button className="continue-btn" onClick={onContinue}>
          Try Again
        </button>
      </div>
    </div>
  );
}
