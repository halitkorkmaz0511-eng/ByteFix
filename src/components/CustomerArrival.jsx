import { useState, useEffect } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './CustomerArrival.css';

export function CustomerArrival({ customer, onInspect, isFromQueue }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleInspect = () => {
    soundSystem.playClick();
    setIsExiting(true);
    setTimeout(() => onInspect(), 300);
  };

  if (!customer) return null;

  return (
    <div className={`customer-arrival ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}>
      <div className="customer-card">
        <div className="customer-avatar">
          {customer.avatar}
        </div>
        
        <div className="customer-info">
          <h2 className="customer-name">{customer.name}</h2>
          <span className="customer-type">{customer.type.replace('_', ' ')}</span>
        </div>

        <div className="customer-dialogue">
          <span className="quote-mark">"</span>
          <p>{customer.dialogue}</p>
          <span className="quote-mark end">"</span>
        </div>

        <button className="inspect-btn" onClick={handleInspect}>
          <span>🔍</span>
          INSPECT PC
        </button>
      </div>
    </div>
  );
}
