import { useState, useEffect, useRef } from 'react';
import './PatienceTimer.css';

export function PatienceTimer({ 
  maxPatience, 
  currentPatience, 
  onPatienceChange,
  onTimeout,
  isPaused 
}) {
  const [displayPatience, setDisplayPatience] = useState(currentPatience);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Update every 100ms for smooth countdown
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      // Decrease patience based on elapsed time
      // Max patience decreases over 60 seconds
      const decreaseRate = maxPatience / 60;
      const newPatience = Math.max(0, displayPatience - (decreaseRate * elapsed));
      
      setDisplayPatience(newPatience);
      onPatienceChange(Math.round(newPatience));

      if (newPatience <= 0) {
        clearInterval(intervalRef.current);
        onTimeout();
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, maxPatience, onPatienceChange, onTimeout, displayPatience]);

  const percentage = (displayPatience / maxPatience) * 100;
  
  const getStatusClass = () => {
    if (percentage > 60) return 'high';
    if (percentage > 30) return 'medium';
    return 'low';
  };

  return (
    <div className="patience-timer">
      <div className="patience-label">
        <span>❤️</span>
        <span>Customer Patience</span>
      </div>
      <div className="patience-bar-container">
        <div className={`patience-bar-fill ${getStatusClass()}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="patience-hearts">
        {[...Array(5)].map((_, i) => {
          const threshold = (i + 1) * 20;
          return (
            <span 
              key={i} 
              className={`heart ${percentage >= threshold ? 'full' : 'empty'}`}
            >
              ❤️
            </span>
          );
        })}
      </div>
    </div>
  );
}
