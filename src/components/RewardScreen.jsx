import { useState, useEffect } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './RewardScreen.css';

export function RewardScreen({ 
  payment, 
  speedBonus, 
  perfectBonus, 
  xp, 
  reputation, 
  combo,
  isLevelUp,
  newLevel,
  onContinue 
}) {
  const [displayedMoney, setDisplayedMoney] = useState(0);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [displayedRep, setDisplayedRep] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const totalMoney = payment + speedBonus + perfectBonus;

  useEffect(() => {
    soundSystem.playMoney();
    
    // Animate money counter
    const moneyDuration = 1500;
    const moneySteps = 30;
    const moneyIncrement = totalMoney / moneySteps;
    let currentMoney = 0;
    
    const moneyInterval = setInterval(() => {
      currentMoney += moneyIncrement;
      if (currentMoney >= totalMoney) {
        setDisplayedMoney(totalMoney);
        clearInterval(moneyInterval);
      } else {
        setDisplayedMoney(Math.floor(currentMoney));
      }
    }, moneyDuration / moneySteps);

    // Animate XP
    const xpDuration = 2000;
    const xpSteps = 40;
    const xpIncrement = xp / xpSteps;
    let currentXp = 0;
    
    setTimeout(() => {
      const xpInterval = setInterval(() => {
        currentXp += xpIncrement;
        if (currentXp >= xp) {
          setDisplayedXp(xp);
          clearInterval(xpInterval);
        } else {
          setDisplayedXp(Math.floor(currentXp));
        }
      }, xpDuration / xpSteps);
    }, 500);

    // Animate reputation
    setTimeout(() => {
      const repInterval = setInterval(() => {
        setDisplayedRep(prev => {
          if (prev >= reputation) {
            clearInterval(repInterval);
            return reputation;
          }
          return prev + 1;
        });
      }, 50);
    }, 1000);

    // Show level up if applicable
    if (isLevelUp) {
      setTimeout(() => {
        setShowLevelUp(true);
        soundSystem.playLevelUp();
      }, 2500);
    }

    return () => {
      clearInterval(moneyInterval);
    };
  }, [totalMoney, xp, reputation, isLevelUp]);

  return (
    <div className="reward-screen">
      <div className="reward-card">
        <div className="success-icon">🔧</div>
        <h2>PC FIXED!</h2>

        <div className="rewards-list">
          <div className="reward-item base">
            <span className="reward-label">Base Payment</span>
            <span className="reward-value">+${payment}</span>
          </div>
          
          {speedBonus > 0 && (
            <div className="reward-item bonus">
              <span className="reward-label">Speed Bonus</span>
              <span className="reward-value">+${speedBonus}</span>
            </div>
          )}
          
          {perfectBonus > 0 && (
            <div className="reward-item bonus">
              <span className="reward-label">Perfect Repair</span>
              <span className="reward-value">+${perfectBonus}</span>
            </div>
          )}
          
          {combo > 1 && (
            <div className="reward-item combo">
              <span className="reward-label">🔥 Combo x{combo}</span>
              <span className="reward-value">x{combo > 3 ? '1.5' : '1.2'}</span>
            </div>
          )}

          <div className="reward-divider"></div>

          <div className="reward-total">
            <span className="total-label">TOTAL</span>
            <span className="total-value">${displayedMoney}</span>
          </div>
        </div>

        <div className="xp-rep-gains">
          <div className="gain-item">
            <span className="gain-icon">✨</span>
            <span className="gain-value">+{displayedXp} XP</span>
          </div>
          {reputation > 0 && (
            <div className="gain-item">
              <span className="gain-icon">⭐</span>
              <span className="gain-value">+{displayedRep}</span>
            </div>
          )}
        </div>

        {showLevelUp && (
          <div className="level-up">
            <h3>🔥 SHOP LEVEL UP!</h3>
            <span className="new-level">Level {newLevel}</span>
          </div>
        )}

        <button className="continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
