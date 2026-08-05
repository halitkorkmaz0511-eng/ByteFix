import './Popups.css';

export function OfflineEarningsPopup({ earnings, hoursAway, onCollect, onDismiss }) {
  return (
    <div className="popup-overlay">
      <div className="popup offline-popup">
        <div className="popup-icon">🌙</div>
        <h2>Welcome Back!</h2>
        <p className="offline-time">You were away for {hoursAway} hours</p>
        
        <div className="earnings-display">
          <span className="earnings-label">Your shop earned</span>
          <span className="earnings-amount">${earnings.toLocaleString()}</span>
          <span className="earnings-label">while you were away</span>
        </div>

        <div className="popup-actions">
          <button className="collect-btn" onClick={onCollect}>
            💰 Collect Earnings
          </button>
          <button className="dismiss-btn" onClick={onDismiss}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export function AchievementPopup({ achievement, onDismiss }) {
  return (
    <div className="popup-overlay">
      <div className="popup achievement-popup">
        <div className="achievement-glow">
          <div className="popup-icon large">{achievement.icon}</div>
        </div>
        <h2>🏆 Achievement Unlocked!</h2>
        <p className="achievement-name">{achievement.name}</p>
        <p className="achievement-desc">{achievement.description}</p>
        
        <div className="achievement-rewards">
          {achievement.reward.money > 0 && (
            <span className="reward">💰 +${achievement.reward.money}</span>
          )}
          {achievement.reward.xp > 0 && (
            <span className="reward">⭐ +{achievement.reward.xp} XP</span>
          )}
          {achievement.reward.reputation > 0 && (
            <span className="reward">⭐ +{achievement.reward.reputation} Rep</span>
          )}
        </div>

        <button className="continue-btn" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}

export function LevelUpPopup({ newLevel, rewards, onDismiss }) {
  return (
    <div className="popup-overlay">
      <div className="popup levelup-popup">
        <div className="level-glow">
          <div className="level-icon">⬆️</div>
          <div className="level-number">{newLevel}</div>
        </div>
        <h2>🎉 Shop Level Up!</h2>
        <p className="level-message">Your shop has grown!</p>
        
        <div className="level-rewards">
          <h3>New Unlocks:</h3>
          <ul>
            {rewards.includes('queue') && <li>👥 +1 Queue Slot</li>}
            {rewards.includes('assistant') && <li>🔓 New Assistants Available</li>}
            {rewards.includes('marketing') && <li>📢 New Marketing Campaigns</li>}
            <li>📈 Faster Customer Spawns</li>
          </ul>
        </div>

        <button className="continue-btn" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
