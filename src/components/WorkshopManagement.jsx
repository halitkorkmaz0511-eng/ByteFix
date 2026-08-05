import { useState, useEffect, useCallback } from 'react';
import { upgrades, getXpForLevel, getTotalXpForLevel } from '../data/upgrades';
import { soundSystem } from '../utils/soundSystem';
import './WorkshopManagement.css';

// Define shop level benefits
const SHOP_LEVEL_BENEFITS = {
  1: {
    name: 'Small Workshop',
    capacity: 2,
    spawnRate: 'Normal',
    tools: 'Basic',
    features: ['Standard diagnostics', 'Basic repairs']
  },
  2: {
    name: 'Growing Shop',
    capacity: 3,
    spawnRate: 'Faster',
    tools: 'Standard',
    features: ['Improved queue', 'Faster customers', 'New upgrades unlocked']
  },
  3: {
    name: 'Established Repair Shop',
    capacity: 4,
    spawnRate: 'Fast',
    tools: 'Professional',
    features: ['Larger waiting area', 'Advanced diagnostics', 'Better efficiency']
  },
  4: {
    name: 'Professional Workshop',
    capacity: 6,
    spawnRate: 'Very Fast',
    tools: 'Advanced',
    features: ['Premium equipment', 'High customer flow', 'Special repairs']
  },
  5: {
    name: 'Elite Tech Center',
    capacity: 8,
    spawnRate: 'Intense',
    tools: 'State-of-the-art',
    features: ['Maximum capacity', 'Expert level', 'All repairs unlocked']
  }
};

export function WorkshopManagement({
  gameState,
  effects,
  onPurchaseUpgrade,
  onOpenShop,
  onOpenStats,
  onOpenSettings,
  customerQueueLength,
  activeCustomer,
  queueCapacity
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(null);

  const levelBenefits = SHOP_LEVEL_BENEFITS[gameState.shopLevel] || SHOP_LEVEL_BENEFITS[1];
  const xpForCurrentLevel = getXpForLevel(gameState.shopLevel);
  const xpProgress = Math.min(100, (gameState.xp / xpForCurrentLevel) * 100);
  const xpNeeded = xpForCurrentLevel - gameState.xp;

  // Quick upgrade definitions for the management panel
  const quickUpgrades = [
    {
      id: 'better_tools',
      ...upgrades.better_tools,
      priority: 1
    },
    {
      id: 'better_workbench',
      ...upgrades.better_workbench,
      priority: 2
    },
    {
      id: 'extra_station',
      ...upgrades.extra_station,
      priority: 3
    },
    {
      id: 'gaming_section',
      ...upgrades.gaming_section,
      priority: 4
    },
    {
      id: 'premium_workshop',
      ...upgrades.premium_workshop,
      priority: 5
    }
  ];

  const handlePurchase = (upgradeId, cost) => {
    if (gameState.money >= cost && !gameState.purchasedUpgrades.includes(upgradeId)) {
      soundSystem.playUpgrade();
      onPurchaseUpgrade(upgradeId, cost);
    }
  };

  const getUpgradeStatus = (upgradeId) => {
    if (gameState.purchasedUpgrades.includes(upgradeId)) return 'owned';
    if (gameState.money >= upgrades[upgradeId].cost) return 'available';
    return 'locked';
  };

  // Get available upgrades (not yet purchased)
  const availableUpgrades = quickUpgrades.filter(u => 
    !gameState.purchasedUpgrades.includes(u.id)
  );

  return (
    <div className="workshop-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-title">
          <span className="title-icon">📊</span>
          <span className="title-text">SHOP MANAGEMENT</span>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={onOpenShop}>
            🛒 Shop
          </button>
          <button className="header-btn" onClick={onOpenStats}>
            📈 Stats
          </button>
          <button className="header-btn" onClick={onOpenSettings}>
            ⚙️
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrades')}
        >
          🔧 Upgrades
        </button>
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📈 Progress
        </button>
      </div>

      {/* Tab Content */}
      <div className="management-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-panel overview-panel">
            {/* Shop Status Card */}
            <div className="status-card">
              <div className="card-header">
                <span className="card-icon">🏪</span>
                <span className="card-title">Current Status</span>
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-icon">💰</span>
                  <span className="status-value">${gameState.money.toLocaleString()}</span>
                  <span className="status-label">Money</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">⭐</span>
                  <span className="status-value">{gameState.reputation}%</span>
                  <span className="status-label">Reputation</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">🔥</span>
                  <span className="status-value">x{gameState.combo}</span>
                  <span className="status-label">Combo</span>
                </div>
                <div className="status-item highlight">
                  <span className="status-icon">👥</span>
                  <span className="status-value">{customerQueueLength}/{queueCapacity}</span>
                  <span className="status-label">Queue</span>
                </div>
              </div>
            </div>

            {/* Shop Level Card */}
            <div className="level-card">
              <div className="card-header">
                <span className="card-icon">🏆</span>
                <span className="card-title">Shop Level {gameState.shopLevel}</span>
              </div>
              <div className="level-name">{levelBenefits.name}</div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
                </div>
                <div className="progress-text">
                  {gameState.xp} / {xpForCurrentLevel} XP to Level {gameState.shopLevel + 1}
                </div>
              </div>
              <div className="level-benefits">
                {levelBenefits.features.map((feature, i) => (
                  <div key={i} className="benefit-item">
                    <span className="benefit-check">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-card">
              <div className="card-header">
                <span className="card-icon">📊</span>
                <span className="card-title">Today's Stats</span>
              </div>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{gameState.totalCustomers}</span>
                  <span className="stat-label">Customers</span>
                </div>
                <div className="stat-item success">
                  <span className="stat-value">{gameState.successfulRepairs}</span>
                  <span className="stat-label">Fixed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{gameState.purchasedUpgrades.length}</span>
                  <span className="stat-label">Upgrades</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrades Tab */}
        {activeTab === 'upgrades' && (
          <div className="tab-panel upgrades-panel">
            <div className="upgrades-intro">
              Purchase upgrades to improve your repair shop capabilities!
            </div>
            
            <div className="upgrades-list">
              {quickUpgrades.map(upgrade => {
                const status = getUpgradeStatus(upgrade.id);
                const canAfford = gameState.money >= upgrade.cost;
                
                return (
                  <div 
                    key={upgrade.id} 
                    className={`upgrade-item ${status}`}
                    onClick={() => status === 'available' && handlePurchase(upgrade.id, upgrade.cost)}
                  >
                    <div className="upgrade-icon-large">{upgrade.icon}</div>
                    <div className="upgrade-info">
                      <div className="upgrade-name">{upgrade.name}</div>
                      <div className="upgrade-desc">{upgrade.description}</div>
                    </div>
                    <div className="upgrade-action">
                      {status === 'owned' && (
                        <span className="owned-badge">✓ OWNED</span>
                      )}
                      {status === 'available' && (
                        <span className="price-tag">${upgrade.cost.toLocaleString()}</span>
                      )}
                      {status === 'locked' && (
                        <span className="locked-badge">
                          Need ${(upgrade.cost - gameState.money).toLocaleString()} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {availableUpgrades.length === 0 && (
              <div className="all-upgrades-owned">
                🎉 You've purchased all available upgrades!
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="tab-panel progress-panel">
            {/* XP Progress */}
            <div className="progress-card xp-card">
              <div className="card-header">
                <span className="card-icon">✨</span>
                <span className="card-title">Experience Points</span>
              </div>
              <div className="xp-display">
                <span className="xp-current">{gameState.xp}</span>
                <span className="xp-separator">/</span>
                <span className="xp-total">{xpForCurrentLevel}</span>
              </div>
              <div className="xp-bar-container">
                <div className="xp-bar" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <div className="xp-to-next">
                {xpNeeded} XP until Level {gameState.shopLevel + 1}
              </div>
            </div>

            {/* Shop Level Progression */}
            <div className="progression-card">
              <div className="card-header">
                <span className="card-icon">📈</span>
                <span className="card-title">Shop Level Progression</span>
              </div>
              <div className="level-track">
                {[1, 2, 3, 4, 5].map(level => {
                  const isCurrentLevel = level === gameState.shopLevel;
                  const isUnlocked = level <= gameState.shopLevel;
                  const benefits = SHOP_LEVEL_BENEFITS[level];
                  
                  return (
                    <div 
                      key={level} 
                      className={`level-step ${isCurrentLevel ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="level-indicator">
                        {isUnlocked ? (isCurrentLevel ? '★' : '✓') : level}
                      </div>
                      <div className="level-details">
                        <div className="level-title">Level {level}</div>
                        <div className="level-capacity">Queue: {benefits.capacity} customers</div>
                        {isCurrentLevel && (
                          <div className="level-current-features">
                            {benefits.features.map((f, i) => (
                              <span key={i} className="feature-tag">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="benefits-card">
              <div className="card-header">
                <span className="card-icon">🎁</span>
                <span className="card-title">Current Benefits</span>
              </div>
              <div className="benefits-grid">
                <div className="benefit-box">
                  <div className="benefit-icon">⚡</div>
                  <div className="benefit-value">{Math.round((1 - effects.miniGameSpeed) * 100)}%</div>
                  <div className="benefit-label">Faster Repairs</div>
                </div>
                <div className="benefit-box">
                  <div className="benefit-icon">💵</div>
                  <div className="benefit-value">+{Math.round((effects.paymentBonus - 1) * 100)}%</div>
                  <div className="benefit-label">Better Pay</div>
                </div>
                <div className="benefit-box">
                  <div className="benefit-icon">📊</div>
                  <div className="benefit-value">Lvl {effects.maxDifficulty}</div>
                  <div className="benefit-label">Max Difficulty</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
