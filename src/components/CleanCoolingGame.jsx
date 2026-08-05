import { useState, useEffect, useCallback, useRef } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './MiniGame.css';

export function CleanCoolingGame({ onComplete, speedMultiplier = 1 }) {
  console.log('CleanCoolingGame rendering, speedMultiplier:', speedMultiplier);
  const [dustParticles, setDustParticles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [particlesLeft, setParticlesLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [temperature, setTemperature] = useState(98);
  const gameLoopRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  const totalParticles = 10;
  const adjustedTime = Math.floor(15 * speedMultiplier);
  console.log('adjustedTime:', adjustedTime);

  // Initialize dust particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < totalParticles; i++) {
      particles.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 20 + Math.random() * 15,
        rotation: Math.random() * 360,
        clicked: false
      });
    }
    setDustParticles(particles);
    setParticlesLeft(totalParticles);
  }, []);

  // Timer countdown
  useEffect(() => {
    lastTickRef.current = Date.now();
    
    const tick = () => {
      const now = Date.now();
      if (now - lastTickRef.current >= 1000) {
        lastTickRef.current = now;
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(gameLoopRef.current);
            return 0;
          }
          soundSystem.playTick();
          return prev - 1;
        });
      }
      gameLoopRef.current = requestAnimationFrame(tick);
    };
    
    gameLoopRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Check for timeout
  useEffect(() => {
    if (timeLeft === 0 && !isComplete) {
      onComplete(false);
    }
  }, [timeLeft, isComplete, onComplete]);

  const handleParticleClick = useCallback((id) => {
    setDustParticles(prev => 
      prev.map(p => p.id === id ? { ...p, clicked: true } : p)
    );
    
    soundSystem.playClick();
    
    setParticlesLeft(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsComplete(true);
        soundSystem.playSuccess();
        setTimeout(() => onComplete(true), 1500);
      }
      return newCount;
    });

    // Cool down the CPU
    setTemperature(prev => Math.max(45, prev - 6));
  }, [onComplete]);

  const timeProgress = (timeLeft / adjustedTime) * 100;

  return (
    <div className="mini-game">
      <div className="mini-game-header">
        <h2>🧹 CLEAN THE COOLING SYSTEM</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">TIME</span>
            <div className="time-bar">
              <div className="time-fill" style={{ width: `${timeProgress}%` }}></div>
            </div>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">DUST LEFT</span>
            <span className="stat-value">{particlesLeft}</span>
          </div>
        </div>
      </div>

      <div className="fan-container">
        <div className={`fan ${isComplete ? 'fan-slow' : ''}`}>
          <div className="fan-blade"></div>
          <div className="fan-blade"></div>
          <div className="fan-blade"></div>
          <div className="fan-center"></div>
        </div>

        {dustParticles.map(particle => (
          !particle.clicked && (
            <div
              key={particle.id}
              className="dust-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                transform: `rotate(${particle.rotation}deg)`
              }}
              onClick={() => handleParticleClick(particle.id)}
            />
          )
        ))}
      </div>

      {isComplete && (
        <div className="completion-message">
          <h3>COOLING RESTORED! 🔧</h3>
          <div className="temp-display">
            <span className="temp-old">{temperature + 53}°C</span>
            <span className="temp-arrow">→</span>
            <span className="temp-new">{temperature}°C</span>
          </div>
        </div>
      )}

      {timeLeft === 0 && (
        <div className="timeout-message">
          <h3>⏰ TIME'S UP!</h3>
          <p>The fan wasn't cleaned in time.</p>
        </div>
      )}
    </div>
  );
}
