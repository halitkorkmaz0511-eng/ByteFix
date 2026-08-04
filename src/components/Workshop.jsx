import { soundSystem } from '../utils/soundSystem';
import './Workshop.css';

export function Workshop({ onNewCustomer, onOpenShop, onOpenStats, onOpenSettings, hasActiveCustomer }) {
  const handleNewCustomer = () => {
    soundSystem.playCustomerArrival();
    onNewCustomer();
  };

  return (
    <div className="workshop">
      {/* Background decorations */}
      <div className="workshop-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
      </div>

      {/* Workshop elements */}
      <div className="workshop-scene">
        {/* Monitor */}
        <div className="workshop-element monitor">
          <div className="monitor-screen">
            <div className="screen-content">
              <div className="code-lines">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div className="monitor-stand"></div>
        </div>

        {/* Computer tower */}
        <div className="workshop-element tower">
          <div className="tower-case">
            <div className="tower-led"></div>
            <div className="tower-vents"></div>
          </div>
        </div>

        {/* Workbench */}
        <div className="workshop-element workbench">
          <div className="bench-surface">
            <div className="tools">
              <span className="tool">🔧</span>
              <span className="tool">🪛</span>
              <span className="tool">🔩</span>
            </div>
          </div>
        </div>

        {/* Toolbox */}
        <div className="workshop-element toolbox">
          <div className="toolbox-body">
            <span className="toolbox-icon">🧰</span>
          </div>
        </div>

        {/* PC Components */}
        <div className="workshop-element components">
          <span className="component">💾</span>
          <span className="component">🔌</span>
          <span className="component">🖥️</span>
        </div>

        {/* Decorative shelf */}
        <div className="workshop-element shelf">
          <div className="shelf-content">
            <span>📱</span>
            <span>🎧</span>
            <span>⌨️</span>
          </div>
        </div>

        {/* Animated dust particles */}
        <div className="dust-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="dust" style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Main action button */}
      <div className="workshop-actions">
        <button 
          className={`new-customer-btn ${hasActiveCustomer ? 'disabled' : ''}`}
          onClick={handleNewCustomer}
          disabled={hasActiveCustomer}
        >
          <span className="btn-icon">👤</span>
          <span className="btn-text">{hasActiveCustomer ? 'CUSTOMER BUSY' : 'NEW CUSTOMER'}</span>
        </button>

        <div className="secondary-actions">
          <button className="secondary-btn" onClick={onOpenShop}>
            <span>🛒</span> SHOP
          </button>
          <button className="secondary-btn" onClick={onOpenStats}>
            <span>📊</span> STATS
          </button>
          <button className="secondary-btn" onClick={onOpenSettings}>
            <span>⚙️</span> SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
