import './StatsScreen.css';

export function StatsScreen({ stats, onBack }) {
  const successRate = stats.totalCustomers > 0
    ? Math.round((stats.successfulRepairs / stats.totalCustomers) * 100)
    : 0;

  return (
    <div className="stats-screen">
      <div className="stats-container">
        <div className="stats-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>📊 STATISTICS</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <span className="stat-value">{stats.totalCustomers}</span>
            <span className="stat-label">Total Customers</span>
          </div>

          <div className="stat-card success">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{stats.successfulRepairs}</span>
            <span className="stat-label">Successful Repairs</span>
          </div>

          <div className="stat-card failure">
            <span className="stat-icon">❌</span>
            <span className="stat-value">{stats.failedRepairs}</span>
            <span className="stat-label">Failed Repairs</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <span className="stat-value">${stats.totalMoneyEarned.toLocaleString()}</span>
            <span className="stat-label">Total Money Earned</span>
          </div>

          <div className="stat-card combo">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">x{stats.bestCombo}</span>
            <span className="stat-label">Best Combo</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🔧</span>
            <span className="stat-value">Lv.{stats.shopLevel}</span>
            <span className="stat-label">Shop Level</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{stats.reputation}</span>
            <span className="stat-label">Reputation</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <span className="stat-value">{successRate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
