import './DecisionModal.css';

export function DecisionModal({ decision, onDecision, onClose }) {
  if (!decision) return null;

  const { title, description, choices, event } = decision;

  return (
    <div className="decision-overlay" onClick={onClose}>
      <div className="decision-modal" onClick={e => e.stopPropagation()}>
        <div className="decision-header">
          <span className="decision-icon">{event?.icon || '⚠️'}</span>
          <h2>{title}</h2>
          <button className="decision-close" onClick={onClose}>✕</button>
        </div>

        <div className="decision-content">
          <p className="decision-description">{description}</p>

          <div className="decision-choices">
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                className={`decision-choice ${choice.cost > 0 ? 'has-cost' : 'free'}`}
                onClick={() => onDecision(choice.id)}
              >
                <span className="choice-index">{index + 1}</span>
                <span className="choice-label">{choice.label}</span>
                {choice.cost > 0 && (
                  <span className="choice-cost">-${choice.cost.toLocaleString()}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="decision-footer">
          <p>Choose wisely - your decision will affect your business</p>
        </div>
      </div>
    </div>
  );
}

export function Notification({ notification, onDismiss }) {
  if (!notification) return null;

  const typeColors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  return (
    <div 
      className="notification-toast"
      style={{ borderColor: typeColors[notification.type] || typeColors.info }}
      onClick={onDismiss}
    >
      <span className="notification-icon">{notification.icon}</span>
      <span className="notification-message">{notification.message}</span>
      <span className="notification-dismiss">Click to dismiss</span>
    </div>
  );
}

export function EventIndicator({ buffs }) {
  if (!buffs || buffs.length === 0) return null;

  return (
    <div className="event-indicator">
      {buffs.slice(0, 3).map(buff => (
        <span 
          key={buff.id} 
          className={`buff-badge ${buff.type}`}
          title={buff.name}
        >
          {buff.icon}
        </span>
      ))}
      {buffs.length > 3 && (
        <span className="buff-more">+{buffs.length - 3}</span>
      )}
    </div>
  );
}
