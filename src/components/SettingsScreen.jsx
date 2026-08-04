import { useState } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './SettingsScreen.css';

export function SettingsScreen({ settings, onUpdateSettings, onReset, onBack }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (key) => {
    soundSystem.playClick();
    onUpdateSettings(key, !settings[key]);
    if (key === 'sound') {
      soundSystem.setEnabled(!settings[key]);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    soundSystem.playCustomerLeave();
    onReset();
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    soundSystem.playClick();
    setShowResetConfirm(false);
  };

  return (
    <div className="settings-screen">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>⚙️ SETTINGS</h2>
        </div>

        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔊</span>
              <div className="setting-text">
                <span className="setting-name">Sound Effects</span>
                <span className="setting-desc">Enable game sound effects</span>
              </div>
            </div>
            <button 
              className={`toggle-btn ${settings.sound ? 'on' : 'off'}`}
              onClick={() => handleToggle('sound')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🎵</span>
              <div className="setting-text">
                <span className="setting-name">Music</span>
                <span className="setting-desc">Enable background music</span>
              </div>
            </div>
            <button 
              className={`toggle-btn ${settings.music ? 'on' : 'off'}`}
              onClick={() => handleToggle('music')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </div>

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button className="reset-btn" onClick={handleReset}>
            🗑️ Reset Progress
          </button>
        </div>

        {showResetConfirm && (
          <div className="reset-modal">
            <div className="reset-modal-content">
              <h3>⚠️ Reset Progress?</h3>
              <p>This will delete all your progress including money, upgrades, and statistics.</p>
              <p className="warning">This action cannot be undone!</p>
              <div className="reset-modal-buttons">
                <button className="cancel-btn" onClick={cancelReset}>
                  Cancel
                </button>
                <button className="confirm-reset-btn" onClick={confirmReset}>
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
