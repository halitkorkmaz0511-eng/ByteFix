import { useState, useEffect } from 'react';
import { assistants, marketingCampaigns, achievements } from '../data/idleSystem';
import { PARTS, SUPPLIERS, getStorageCapacity } from '../data/inventorySystem';
import './BusinessDashboard.css';

export function BusinessDashboard({
  gameState,
  idleState,
  onClose,
  onHireAssistant,
  onFireAssistant,
  onStartMarketing,
  onCollectAchievement,
  inventory,
  market
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showHireConfirm, setShowHireConfirm] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSupplier, setOrderSupplier] = useState('tech_supply');
  const [orderResult, setOrderResult] = useState(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const dailyExpenses = idleState.getDailyExpenses;
  const assistantEffects = idleState.getAssistantEffects;
  const marketingEffect = idleState.getMarketingEffect;

  // Calculate business health
  const successRate = gameState.totalCustomers > 0
    ? Math.round((gameState.successfulRepairs / gameState.totalCustomers) * 100)
    : 0;

  const avgEarnings = gameState.totalCustomers > 0
    ? Math.round(gameState.totalMoneyEarned / gameState.totalCustomers)
    : 0;

  // Inventory data
  const inventoryItems = inventory?.inventoryState?.items || {};
  const totalItems = inventory?.getTotalItems?.() || 0;
  const capacity = inventory?.getCapacity?.() || 50;
  const lowStockItems = inventory?.getLowStockItems?.() || [];
  const activeOrders = inventory?.getActiveOrders?.() || [];

  // Market data
  const marketState = market?.marketState || {};
  const getMarketSummary = market?.getMarketSummary || (() => ({}));
  const REPAIR_CATEGORIES = market?.REPAIR_CATEGORIES || {};
  const PRICING_TIERS = market?.PRICING_TIERS || {};
  const SPECIALIZATIONS = market?.SPECIALIZATIONS || {};

  return (
    <div className="business-dashboard">
      <div className="dashboard-header">
        <h2>📊 Business Dashboard</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={activeTab === 'team' ? 'active' : ''}
          onClick={() => setActiveTab('team')}
        >
          👥 Team
        </button>
        <button 
          className={activeTab === 'marketing' ? 'active' : ''}
          onClick={() => setActiveTab('marketing')}
        >
          📢 Marketing
        </button>
        <button 
          className={activeTab === 'achievements' ? 'active' : ''}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Achievements
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={activeTab === 'market' ? 'active' : ''}
          onClick={() => setActiveTab('market')}
        >
          📈 Market
        </button>
        <button 
          className={activeTab === 'competitors' ? 'active' : ''}
          onClick={() => setActiveTab('competitors')}
        >
          🏢 Competitors
        </button>
        <button 
          className={activeTab === 'news' ? 'active' : ''}
          onClick={() => setActiveTab('news')}
        >
          📰 News
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Business Health */}
            <div className="dashboard-card health-card">
              <h3>🏥 Business Health</h3>
              <div className="health-meters">
                <div className="meter">
                  <span>Success Rate</span>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill success" 
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <span className="meter-value">{successRate}%</span>
                </div>
                <div className="meter">
                  <span>Reputation</span>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill reputation" 
                      style={{ width: `${gameState.reputation}%` }}
                    />
                  </div>
                  <span className="meter-value">{gameState.reputation}/100</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="dashboard-card finance-card">
              <h3>💰 Financial Summary</h3>
              <div className="finance-grid">
                <div className="finance-item">
                  <span className="finance-label">Total Earned</span>
                  <span className="finance-value money">${gameState.totalMoneyEarned.toLocaleString()}</span>
                </div>
                <div className="finance-item">
                  <span className="finance-label">Current Balance</span>
                  <span className="finance-value">${gameState.money.toLocaleString()}</span>
                </div>
                <div className="finance-item">
                  <span className="finance-label">Avg per Customer</span>
                  <span className="finance-value">${avgEarnings}</span>
                </div>
                <div className="finance-item">
                  <span className="finance-label">Daily Expenses</span>
                  <span className="finance-value expense">-${dailyExpenses}/day</span>
                </div>
              </div>
            </div>

            {/* Active Bonuses */}
            <div className="dashboard-card bonuses-card">
              <h3>⚡ Active Bonuses</h3>
              <div className="bonuses-list">
                {idleState.hiredAssistants.length > 0 && (
                  <div className="bonus-item">
                    <span>👥 Team ({idleState.hiredAssistants.length})</span>
                    <span className="bonus-value">+{Math.round((assistantEffects.patienceMultiplier - 1) * 100)}% patience</span>
                  </div>
                )}
                {assistantEffects.customerBoost > 1 && (
                  <div className="bonus-item">
                    <span>📈 Customer Boost</span>
                    <span className="bonus-value">+{Math.round((assistantEffects.customerBoost - 1) * 100)}% customers</span>
                  </div>
                )}
                {assistantEffects.autoRepairChance > 0 && (
                  <div className="bonus-item">
                    <span>🤖 Auto Repair</span>
                    <span className="bonus-value">{Math.round(assistantEffects.autoRepairChance * 100)}% chance</span>
                  </div>
                )}
                {marketingEffect && (
                  <div className="bonus-item marketing">
                    <span>📢 Marketing Active</span>
                    <span className="bonus-value">
                      {marketingEffect.multiplier && `+${Math.round((marketingEffect.multiplier - 1) * 100)}% customers`}
                      {marketingEffect.reputationBoost && ` +${marketingEffect.reputationBoost} rep`}
                    </span>
                  </div>
                )}
                {!idleState.hiredAssistants.length && !marketingEffect && (
                  <div className="bonus-empty">
                    No active bonuses. Hire staff or start marketing!
                  </div>
                )}
              </div>
            </div>

            {/* Idle Earnings Info */}
            {idleState.totalOfflineEarnings > 0 && (
              <div className="dashboard-card idle-card">
                <h3>🌙 Idle Earnings</h3>
                <div className="idle-stats">
                  <div className="idle-stat">
                    <span className="idle-label">Total Earned While Away</span>
                    <span className="idle-value">${idleState.totalOfflineEarnings.toLocaleString()}</span>
                  </div>
                  <div className="idle-stat">
                    <span className="idle-label">Best Session</span>
                    <span className="idle-value">${idleState.maxOfflineEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="team-tab">
            <div className="team-section">
              <h3>👥 Your Team ({idleState.hiredAssistants.length})</h3>
              {idleState.hiredAssistants.length === 0 ? (
                <div className="no-team">
                  <p>No staff hired yet. Hire assistants to boost your business!</p>
                </div>
              ) : (
                <div className="team-list">
                  {idleState.hiredAssistants.map(id => {
                    const assistant = assistants[id];
                    return (
                      <div key={id} className="team-member hired">
                        <div className="member-icon">{assistant.icon}</div>
                        <div className="member-info">
                          <span className="member-name">{assistant.name}</span>
                          <span className="member-desc">{assistant.description}</span>
                          <span className="member-salary">Salary: ${assistant.salary}/day</span>
                        </div>
                        <button 
                          className="fire-btn"
                          onClick={() => onFireAssistant(id)}
                        >
                          Fire
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="team-section">
              <h3>💼 Available for Hire</h3>
              <div className="hire-list">
                {Object.values(assistants)
                  .filter(a => gameState.shopLevel >= a.unlockLevel)
                  .filter(a => !idleState.hiredAssistants.includes(a.id))
                  .map(assistant => (
                    <div key={assistant.id} className="hire-card">
                      <div className="hire-icon">{assistant.icon}</div>
                      <div className="hire-info">
                        <span className="hire-name">{assistant.name}</span>
                        <span className="hire-desc">{assistant.description}</span>
                        <div className="hire-costs">
                          <span>Cost: ${assistant.cost.toLocaleString()}</span>
                          <span>Salary: ${assistant.salary}/day</span>
                        </div>
                      </div>
                      <button 
                        className="hire-btn"
                        disabled={gameState.money < assistant.cost}
                        onClick={() => onHireAssistant(assistant.id)}
                      >
                        {gameState.money < assistant.cost ? 'Need More' : 'Hire'}
                      </button>
                    </div>
                  ))}
                {Object.values(assistants).filter(a => 
                  gameState.shopLevel < a.unlockLevel && 
                  !idleState.hiredAssistants.includes(a.id)
                ).length > 0 && (
                  <div className="locked-assistants">
                    <h4>🔒 Locked (Reach Higher Shop Level)</h4>
                    {Object.values(assistants)
                      .filter(a => gameState.shopLevel < a.unlockLevel)
                      .filter(a => !idleState.hiredAssistants.includes(a.id))
                      .map(assistant => (
                        <div key={assistant.id} className="locked-card">
                          <span>{assistant.icon} {assistant.name}</span>
                          <span>Unlocks at Level {assistant.unlockLevel}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="team-expenses">
              <h3>💸 Daily Team Expenses</h3>
              <div className="expense-breakdown">
                <div className="expense-row">
                  <span>Rent & Utilities</span>
                  <span>Included in daily expenses</span>
                </div>
                {idleState.hiredAssistants.map(id => {
                  const assistant = assistants[id];
                  return (
                    <div key={id} className="expense-row">
                      <span>{assistant.icon} {assistant.name}</span>
                      <span>${assistant.salary}/day</span>
                    </div>
                  );
                })}
                <div className="expense-total">
                  <span>Total Daily Salary</span>
                  <span>${idleState.hiredAssistants.reduce((sum, id) => {
                    const a = assistants[id];
                    return sum + (a ? a.salary : 0);
                  }, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="marketing-tab">
            <div className="marketing-intro">
              <p>Invest in marketing to attract more customers and boost your reputation!</p>
              {marketingEffect && (
                <div className="active-marketing">
                  <span>📢 Active Campaign: {marketingCampaigns[idleState.activeMarketing.id]?.name}</span>
                  <span className="time-remaining">
                    {Math.max(0, Math.ceil((idleState.marketingEndTime - Date.now()) / 60000))} min remaining
                  </span>
                </div>
              )}
            </div>

            <div className="campaign-list">
              {Object.values(marketingCampaigns).map(campaign => {
                const onCooldown = idleState.marketingCooldowns[campaign.id] > Date.now();
                const cooldownRemaining = onCooldown 
                  ? Math.ceil((idleState.marketingCooldowns[campaign.id] - Date.now()) / 60000)
                  : 0;
                const isActive = idleState.activeMarketing?.id === campaign.id;

                return (
                  <div key={campaign.id} className={`campaign-card ${isActive ? 'active' : ''} ${onCooldown ? 'cooldown' : ''}`}>
                    <div className="campaign-icon">
                      {campaign.id === 'flyers' && '📄'}
                      {campaign.id === 'social_media' && '📱'}
                      {campaign.id === 'referral_program' && '👥'}
                      {campaign.id === 'radio_ad' && '📻'}
                      {campaign.id === 'grand_opening' && '🎉'}
                    </div>
                    <div className="campaign-info">
                      <span className="campaign-name">{campaign.name}</span>
                      <span className="campaign-desc">{campaign.description}</span>
                      <div className="campaign-effect">
                        {campaign.effect.multiplier && (
                          <span>+{Math.round((campaign.effect.multiplier - 1) * 100)}% customers</span>
                        )}
                        {campaign.effect.reputationBoost && (
                          <span>+{campaign.effect.reputationBoost} reputation</span>
                        )}
                        <span>Duration: {campaign.duration / 3600000}h</span>
                      </div>
                    </div>
                    <div className="campaign-action">
                      {isActive ? (
                        <span className="active-badge">Active</span>
                      ) : onCooldown ? (
                        <button className="cooldown-btn" disabled>
                          Cooldown: {cooldownRemaining}m
                        </button>
                      ) : (
                        <button 
                          className="run-btn"
                          disabled={gameState.money < campaign.cost}
                          onClick={() => onStartMarketing(campaign.id)}
                        >
                          ${campaign.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="marketing-stats">
              <h3>📊 Marketing Stats</h3>
              <div className="stat-row">
                <span>Total Campaigns Run</span>
                <span>{idleState.totalCampaigns}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <div className="achievements-progress">
              <span>🏆 {idleState.unlockedAchievements.length} / {Object.keys(achievements).length} Achievements</span>
            </div>
            <div className="achievements-grid">
              {Object.values(achievements).map(achievement => {
                const unlocked = idleState.unlockedAchievements.includes(achievement.id);
                return (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <span className="achievement-name">{achievement.name}</span>
                      <span className="achievement-desc">{achievement.description}</span>
                      {unlocked && (
                        <span className="achievement-reward">
                          +${achievement.reward.money} • +{achievement.reward.xp}XP
                        </span>
                      )}
                    </div>
                    {unlocked && <span className="unlocked-badge">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            {/* Storage Overview */}
            <div className="dashboard-card storage-card">
              <h3>📦 Storage Capacity</h3>
              <div className="storage-meter">
                <span>Used: {totalItems} / {capacity}</span>
                <div className="storage-bar">
                  <div 
                    className="storage-fill" 
                    style={{ width: `${Math.min(100, (totalItems / capacity) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Low Stock Warnings */}
            {lowStockItems.length > 0 && (
              <div className="dashboard-card low-stock-card">
                <h3>⚠️ Low Stock Warnings</h3>
                <div className="low-stock-list">
                  {lowStockItems.map(item => (
                    <div key={item.partId} className="low-stock-item">
                      <span className="item-icon">{PARTS[item.partId]?.icon || '🔧'}</span>
                      <span className="item-name">{PARTS[item.partId]?.name || item.partId}</span>
                      <span className="item-qty">{item.quantity} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Inventory */}
            <div className="dashboard-card inventory-card">
              <h3>🔧 Parts Inventory</h3>
              <div className="parts-grid">
                {Object.keys(PARTS).map(partId => {
                  const part = PARTS[partId];
                  const qty = inventoryItems[partId] || 0;
                  const isLow = lowStockItems.some(i => i.partId === partId);
                  return (
                    <div key={partId} className={`part-card ${isLow ? 'low' : ''} ${qty === 0 ? 'empty' : ''}`}>
                      <span className="part-icon">{part.icon}</span>
                      <span className="part-name">{part.name}</span>
                      <span className="part-qty">{qty}</span>
                      {isLow && qty > 0 && <span className="low-badge">Low</span>}
                      {qty === 0 && <span className="empty-badge">Empty</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Order */}
            <div className="dashboard-card order-card">
              <h3>🛒 Quick Order</h3>
              <div className="order-controls">
                <select 
                  value={orderSupplier}
                  onChange={(e) => setOrderSupplier(e.target.value)}
                  className="supplier-select"
                >
                  <option value="budget_parts">BudgetParts (-15%, 3 days)</option>
                  <option value="tech_supply">TechSupply (normal, 1 day)</option>
                  <option value="pro_hardware">ProHardware (+20%, same day) {gameState.shopLevel < 3 ? '(Lvl 3+)' : ''}</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="qty-input"
                />
              </div>
              
              <div className="order-parts">
                {Object.keys(PARTS).map(partId => {
                  const part = PARTS[partId];
                  const supplier = SUPPLIERS[orderSupplier];
                  const price = Math.floor(part.basePrice * (supplier?.priceMultiplier || 1));
                  const isAvailable = !supplier?.unlockLevel || gameState.shopLevel >= supplier.unlockLevel;
                  
                  return (
                    <div key={partId} className="order-row">
                      <span className="order-icon">{part.icon}</span>
                      <span className="order-name">{part.name}</span>
                      <span className="order-price">${price * orderQuantity}</span>
                      <button
                        className="order-btn"
                        disabled={!isAvailable || gameState.money < price * orderQuantity}
                        onClick={() => {
                          if (inventory?.placeOrder) {
                            const result = inventory.placeOrder(partId, orderQuantity, orderSupplier);
                            setOrderResult(result.success ? `Ordered ${orderQuantity}x ${part.name}` : result.reason);
                            setTimeout(() => setOrderResult(null), 3000);
                          }
                        }}
                      >
                        Order
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {orderResult && (
                <div className={`order-result ${orderResult.includes('Ordered') ? 'success' : 'error'}`}>
                  {orderResult}
                </div>
              )}
            </div>

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div className="dashboard-card orders-card">
                <h3>📬 Active Orders</h3>
                <div className="orders-list">
                  {activeOrders.map(order => {
                    const part = PARTS[order.partId];
                    const supplier = SUPPLIERS[order.supplierId];
                    const eta = inventory?.getOrderETA?.(order) || 1;
                    
                    return (
                      <div key={order.id} className="order-item">
                        <span className="order-icon">{part?.icon || '🔧'}</span>
                        <div className="order-info">
                          <span className="order-name">{order.quantity}x {part?.name || order.partId}</span>
                          <span className="order-supplier">via {supplier?.name || order.supplierId}</span>
                        </div>
                        <span className="order-eta">{eta > 0 ? `${eta} day(s)` : 'Today!'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Status */}
            <div className="dashboard-card delivery-card">
              <h3>📅 Current Day</h3>
              <div className="day-info">
                <span className="day-number">Day {inventory?.inventoryState?.currentDay || 1}</span>
                <p className="day-hint">Orders arrive based on supplier delivery times</p>
              </div>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="market-tab">
            <div className="dashboard-card market-overview-card">
              <h3>📊 Market Overview</h3>
              <div className="market-stats">
                <div className="market-stat">
                  <span className="stat-label">Day</span>
                  <span className="stat-value">{marketState.currentDay || 1}</span>
                </div>
                <div className="market-stat">
                  <span className="stat-label">Your Market Share</span>
                  <span className="stat-value highlight">{marketState.playerMarketShare?.toFixed(1) || 15}%</span>
                </div>
                <div className="market-stat">
                  <span className="stat-label">Your Ranking</span>
                  <span className="stat-value">#{marketState.playerRanking || 4}</span>
                </div>
                <div className="market-stat">
                  <span className="stat-label">Market Growth</span>
                  <span className={`stat-value ${(marketState.marketGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {(marketState.marketGrowth || 0) >= 0 ? '+' : ''}{marketState.marketGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Active Event */}
            {marketState.activeEvent && (
              <div className="dashboard-card event-card">
                <h3>🎯 Active Event: {marketState.activeEvent.name}</h3>
                <p className="event-desc">{marketState.activeEvent.description}</p>
                <div className="event-timer">
                  <span>Time remaining: {marketState.eventDaysRemaining} day(s)</span>
                </div>
              </div>
            )}

            {/* Category Demand */}
            <div className="dashboard-card demand-card">
              <h3>📈 Repair Category Demand</h3>
              <div className="demand-grid">
                {Object.keys(REPAIR_CATEGORIES).map(catId => {
                  const cat = REPAIR_CATEGORIES[catId];
                  const demand = marketState.categoryDemand?.[catId] || 1;
                  const level = demand > 1.2 ? 'high' : demand < 0.8 ? 'low' : 'normal';
                  return (
                    <div key={catId} className={`demand-item ${level}`}>
                      <span className="demand-icon">{cat.icon}</span>
                      <span className="demand-name">{cat.name}</span>
                      <span className="demand-level">{level.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Strategy */}
            <div className="dashboard-card pricing-card">
              <h3>💰 Pricing Strategy</h3>
              <div className="pricing-options">
                {Object.keys(REPAIR_CATEGORIES).map(catId => {
                  const cat = REPAIR_CATEGORIES[catId];
                  const currentTier = marketState.playerPricing?.[catId] || 'normal';
                  return (
                    <div key={catId} className="pricing-row">
                      <span className="pricing-icon">{cat.icon}</span>
                      <span className="pricing-name">{cat.name}</span>
                      <select
                        value={currentTier}
                        onChange={(e) => market?.setPricing?.(catId, e.target.value)}
                        className="pricing-select"
                      >
                        <option value="low">Budget (-30%)</option>
                        <option value="normal">Standard</option>
                        <option value="premium">Premium (+40%)</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specialization */}
            <div className="dashboard-card specialization-card">
              <h3>🎯 Specialization</h3>
              <p className="spec-hint">Focus on specific repairs for bonus success rates</p>
              <div className="specialization-grid">
                {Object.keys(SPECIALIZATIONS).map(specId => {
                  const spec = SPECIALIZATIONS[specId];
                  const isActive = marketState.playerSpecialization === specId;
                  return (
                    <button
                      key={specId}
                      className={`spec-btn ${isActive ? 'active' : ''}`}
                      onClick={() => market?.setSpecialization?.(specId)}
                    >
                      <span className="spec-icon">{spec.icon}</span>
                      <span className="spec-name">{spec.name}</span>
                      <span className="spec-desc">{spec.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="competitors-tab">
            <div className="dashboard-card competitors-header">
              <h3>🏢 Competitor Landscape</h3>
              <p>Your rank: #{marketState.playerRanking || 4} with {marketState.playerMarketShare?.toFixed(1) || 15}% market share</p>
            </div>
            
            <div className="competitors-grid">
              {marketState.competitors?.map(comp => {
                const isSelected = selectedCompetitor === comp.id;
                return (
                  <div
                    key={comp.id}
                    className={`competitor-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCompetitor(isSelected ? null : comp.id)}
                  >
                    <div className="comp-header">
                      <span className="comp-icon">{comp.icon}</span>
                      <span className="comp-name">{comp.name}</span>
                    </div>
                    <div className="comp-stats">
                      <div className="comp-stat">
                        <span>Lvl</span>
                        <span>{comp.level}</span>
                      </div>
                      <div className="comp-stat">
                        <span>Rep</span>
                        <span>{comp.reputation}</span>
                      </div>
                      <div className="comp-stat">
                        <span>Share</span>
                        <span>{comp.marketShare}%</span>
                      </div>
                    </div>
                    <div className="comp-strategy">{comp.strategy}</div>
                    
                    {isSelected && (
                      <div className="comp-details">
                        <div className="comp-detail-row">
                          <span>Specialization:</span>
                          <span>{comp.specialization || 'General'}</span>
                        </div>
                        <div className="comp-detail-row">
                          <span>Employees:</span>
                          <span>{comp.employeeCount}</span>
                        </div>
                        <div className="comp-detail-row">
                          <span>Marketing:</span>
                          <span>Level {comp.marketingLevel}</span>
                        </div>
                        <div className="comp-performance">
                          <span>Recent Performance:</span>
                          {comp.recentPerformance?.slice(0, 5).map((p, i) => (
                            <span key={i} className="perf-item">
                              Rep: {Math.round(p.rep)}, Share: {p.share?.toFixed(1)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="news-tab">
            <div className="dashboard-card news-header">
              <h3>📰 Market News</h3>
              <p>Day {marketState.currentDay || 1}</p>
            </div>
            
            <div className="news-list">
              {marketState.news?.length > 0 ? (
                marketState.news.map(item => (
                  <div key={item.id} className={`news-item ${item.type}`}>
                    <span className="news-day">Day {item.day}</span>
                    <span className="news-text">{item.text}</span>
                  </div>
                ))
              ) : (
                <div className="news-empty">
                  <p>No news yet. Complete repairs to see market updates!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
