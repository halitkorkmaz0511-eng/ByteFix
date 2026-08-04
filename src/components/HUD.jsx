import { getTotalXpForLevel } from '../data/upgrades';
import './HUD.css';

export function HUD({ gameState }) {
  const currentLevelXp = getTotalXpForLevel(gameState.shopLevel);
  const previousLevelXp = getTotalXpForLevel(gameState.shopLevel - 1);
  const xpProgress = currentLevelXp > previousLevelXp 
    ? ((gameState.xp - previousLevelXp) / (currentLevelXp - previousLevelXp)) * 100 
    : 0;

  return (
    <div className="hud">
      <div className="hud-item money">
        <span className="hud-icon">💰</span>
        <span className="hud-value">${gameState.money.toLocaleString()}</span>
      </div>
      
      <div className="hud-item reputation">
        <span className="hud-icon">⭐</span>
        <span className="hud-value">{gameState.reputation}</span>
      </div>
      
      <div className="hud-item level">
        <span className="hud-icon">🔧</span>
        <span className="hud-value">Lv.{gameState.shopLevel}</span>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
        </div>
      </div>
      
      {gameState.combo > 1 && (
        <div className="hud-item combo">
          <span className="combo-fire">🔥</span>
          <span className="combo-value">x{gameState.combo}</span>
        </div>
      )}
    </div>
  );
}
