import { soundSystem } from '../utils/soundSystem';
import './WelcomeScreen.css';

export function WelcomeScreen({ onStart }) {
  const handleStart = () => {
    soundSystem.playSuccess();
    onStart();
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">🔧</div>
        <h1>WELCOME TO BYTEFIX</h1>
        <p className="welcome-tagline">
          Your first repair shop is small.
        </p>
        <p className="welcome-desc">
          Fix broken computers, earn money, upgrade your workshop and become the best technician in town.
        </p>
        
        <div className="welcome-tips">
          <div className="tip">
            <span className="tip-icon">👤</span>
            <span>Help customers with their PCs</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🔍</span>
            <span>Diagnose problems correctly</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🧹</span>
            <span>Complete repair mini-games</span>
          </div>
          <div className="tip">
            <span className="tip-icon">💰</span>
            <span>Earn money and upgrade!</span>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>
          START REPAIRING
        </button>
      </div>
    </div>
  );
}
