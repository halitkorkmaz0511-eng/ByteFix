import { upgrades } from '../data/upgrades';
import { soundSystem } from '../utils/soundSystem';
import './ShopScreen.css';

export function ShopScreen({ money, purchasedUpgrades, onPurchase, onBack }) {
  const handlePurchase = (upgradeId, cost) => {
    if (money >= cost && !purchasedUpgrades.includes(upgradeId)) {
      soundSystem.playUpgrade();
      onPurchase(upgradeId, cost);
    } else if (money < cost) {
      soundSystem.playError();
    }
  };

  return (
    <div className="shop-screen">
      <div className="shop-container">
        <div className="shop-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>🛒 SHOP UPGRADES</h2>
          <div className="money-display">
            <span>💰</span>
            <span>${money.toLocaleString()}</span>
          </div>
        </div>

        <div className="upgrades-grid">
          {Object.values(upgrades).map(upgrade => {
            const isPurchased = purchasedUpgrades.includes(upgrade.id);
            const canAfford = money >= upgrade.cost;

            return (
              <div 
                key={upgrade.id} 
                className={`upgrade-card ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'locked' : ''}`}
              >
                <div className="upgrade-icon">{upgrade.icon}</div>
                <h3 className="upgrade-name">{upgrade.name}</h3>
                <p className="upgrade-desc">{upgrade.description}</p>
                
                {isPurchased ? (
                  <div className="upgrade-status purchased">
                    <span>✓</span> OWNED
                  </div>
                ) : (
                  <>
                    <div className="upgrade-cost">
                      <span className="cost-icon">💰</span>
                      <span className="cost-value">${upgrade.cost.toLocaleString()}</span>
                    </div>
                    <button 
                      className={`buy-btn ${canAfford ? '' : 'disabled'}`}
                      onClick={() => handlePurchase(upgrade.id, upgrade.cost)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'BUY' : 'NEED MORE'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
