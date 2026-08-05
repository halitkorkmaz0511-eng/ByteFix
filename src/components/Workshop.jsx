import { useState, useEffect, useMemo } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './Workshop.css';

// Get queue capacity based on shop level
export function getQueueCapacity(shopLevel) {
  if (shopLevel >= 5) return 8;
  if (shopLevel >= 4) return 6;
  if (shopLevel >= 3) return 4;
  if (shopLevel >= 2) return 3;
  return 2;
}

export function Workshop({ 
  activeCustomer,
  customerQueue,
  newCustomerArriving,
  totalCustomers,
  onCustomerReady,
  onInspect,
  shopLevel,
  exitingCustomer
}) {
  const [showEntrance, setShowEntrance] = useState(false);
  const [entranceCustomer, setEntranceCustomer] = useState(null);
  const [entrancePhase, setEntrancePhase] = useState('door');

  const queueCapacity = useMemo(() => getQueueCapacity(shopLevel || 1), [shopLevel]);

  // Show entrance animation when new customer arrives
  useEffect(() => {
    if (newCustomerArriving) {
      setEntranceCustomer(newCustomerArriving);
      setShowEntrance(true);
      setEntrancePhase('door');
      
      setTimeout(() => {
        setEntrancePhase('walking');
      }, 500);
    }
  }, [newCustomerArriving]);

  const handleEntranceComplete = () => {
    setShowEntrance(false);
    setEntranceCustomer(null);
    setEntrancePhase('door');
  };

  const handleCustomerClick = () => {
    if (activeCustomer) {
      soundSystem.playClick();
      if (onCustomerReady) {
        onCustomerReady();
      } else {
        onInspect();
      }
    }
  };

  return (
    <div className="workshop">
      {/* Background decorations */}
      <div className="workshop-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
      </div>

      {/* Shop Layout - Immersive Flow */}
      <div className="shop-layout">
        
        {/* Shop Entrance Area */}
        <div className="shop-entrance">
          <div className="entrance-door">
            <div className="door-frame">
              <div className="door-window"></div>
              <div className="door-handle"></div>
            </div>
            <div className="door-step"></div>
          </div>
          <div className="entrance-sign">
            <span className="sign-icon">🔧</span>
            <span className="sign-text">BYTEFIX</span>
            <span className="sign-subtext">PC Repair Shop</span>
          </div>
          <div className="entrance-bell">
            <span>🔔</span>
          </div>
        </div>

        {/* Customer Entrance Animation */}
        <div className="entrance-area">
          <div className={`door-animation ${showEntrance ? 'door-open' : ''}`}>
            <div className="door-left"></div>
            <div className="door-right"></div>
          </div>
          
          {showEntrance && entranceCustomer && (
            <div className={`customer-walking ${entrancePhase === 'walking' ? 'walking' : ''}`} onAnimationEnd={handleEntranceComplete}>
              <div className="walking-avatar">{entranceCustomer.avatar}</div>
              <div className="walking-name">{entranceCustomer.name}</div>
              <div className="walking-sparkles">✨</div>
            </div>
          )}
          
          {exitingCustomer && (
            <div className="customer-exiting">
              <div className="exiting-avatar">{exitingCustomer.avatar}</div>
              <div className="exiting-name">{exitingCustomer.name}</div>
              <div className="exiting-coins">💰</div>
            </div>
          )}
        </div>

        {/* Service Counter */}
        <div className="service-counter">
          <div className="counter-surface">
            <div className="counter-badge">SERVICE COUNTER</div>
            
            {activeCustomer ? (
              <div className="counter-customer" onClick={handleCustomerClick}>
                <div className="customer-avatar-large">
                  {activeCustomer.avatar}
                  <div className="customer-ready-indicator"></div>
                </div>
                <div className="customer-details">
                  <span className="customer-name">{activeCustomer.name}</span>
                  <span className="customer-type-badge">{activeCustomer.type.replace('_', ' ')}</span>
                </div>
                <div className="customer-dialogue-preview">
                  "{activeCustomer.dialogue.substring(0, 30)}..."
                </div>
                <button className="serve-btn">
                  <span>🔍</span> SERVE CUSTOMER
                </button>
              </div>
            ) : (
              <div className="counter-empty">
                <span className="empty-icon">💤</span>
                <span className="empty-text">
                  {customerQueue.length > 0 ? 'Next customer approaching...' : 'Waiting for customers...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Waiting Area */}
        <div className="waiting-area">
          <div className="waiting-header">
            <span className="waiting-icon">🪑</span>
            <span className="waiting-title">WAITING AREA</span>
            <span className="waiting-capacity">{customerQueue.length}/{queueCapacity}</span>
          </div>
          
          <div className="waiting-seats">
            {customerQueue.length === 0 ? (
              <div className="waiting-empty">
                <span className="seat-placeholder">🪑</span>
                <span className="seat-placeholder">🪑</span>
                <span className="seat-placeholder">🪑</span>
              </div>
            ) : (
              customerQueue.map((customer, index) => (
                <div 
                  key={customer.id} 
                  className={`waiting-customer ${index === 0 ? 'next-up' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="waiting-avatar">{customer.avatar}</div>
                  <div className="waiting-info">
                    <span className="waiting-name">{customer.name}</span>
                    <span className="waiting-type">{customer.type.replace('_', ' ')}</span>
                  </div>
                  <div className="waiting-patience">
                    <div 
                      className={`patience-fill ${customer.patience < 30 ? 'low' : customer.patience < 60 ? 'medium' : 'high'}`}
                      style={{ width: `${customer.patience}%` }}
                    />
                  </div>
                  {index === 0 && <span className="next-badge">NEXT</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workshop Scene - Decorative */}
        <div className="workshop-scene">
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

          <div className="workshop-element tower">
            <div className="tower-case">
              <div className="tower-led"></div>
              <div className="tower-vents"></div>
            </div>
          </div>

          <div className="workshop-element workbench">
            <div className="bench-surface">
              <div className="tools">
                <span className="tool">🔧</span>
                <span className="tool">🪛</span>
                <span className="tool">🔩</span>
              </div>
            </div>
          </div>

          <div className="workshop-element toolbox">
            <div className="toolbox-body">
              <span className="toolbox-icon">🧰</span>
            </div>
          </div>

          <div className="workshop-element components">
            <span className="component">💾</span>
            <span className="component">🔌</span>
            <span className="component">🖥️</span>
          </div>

          <div className="workshop-element shelf">
            <div className="shelf-content">
              <span>📱</span>
              <span>🎧</span>
              <span>⌨️</span>
            </div>
          </div>

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
      </div>

      {/* Status Bar */}
      <div className="workshop-status">
        {totalCustomers > 0 && (
          <div className="status-customers">
            <span className="status-icon">🏪</span>
            <span>Shop Level {shopLevel}</span>
            <span className="status-divider">•</span>
            <span>{totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} today</span>
          </div>
        )}
        {totalCustomers === 0 && (
          <div className="status-waiting">
            <span className="status-icon">🚪</span>
            <span>Door is open - customers incoming...</span>
          </div>
        )}
      </div>
    </div>
  );
}
