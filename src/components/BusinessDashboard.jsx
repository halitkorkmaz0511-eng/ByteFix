import { useState, useEffect } from 'react';
import { assistants, marketingCampaigns, achievements } from '../data/idleSystem';
import './BusinessDashboard.css';

export function BusinessDashboard({
  gameState,
  idleState,
  onClose,
  onHireAssistant,
  onFireAssistant,
  onStartMarketing,
  onCollectAchievement
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showHireConfirm, setShowHireConfirm] = useState(null);

  const dailyExpenses = idleState.getDailyExpenses();
  const assistantEffects = idleState.getAssistantEffects();
  const marketingEffect = idleState.getMarketingEffect();

  // Calculate business health
  const successRate = gameState.totalCustomers > 0
    ? Math.round((gameState.successfulRepairs / gameState.totalCustomers) * 100)
    : 0;

  const avgEarnings = gameState.totalCustomers > 0
    ? Math.round(gameState.totalMoneyEarned / gameState.totalCustomers)
    : 0;

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
      </div>
    </div>
  );
}
