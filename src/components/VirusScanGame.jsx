import { useState, useEffect, useCallback } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './MiniGame.css';

export function VirusScanGame({ onComplete, speedMultiplier = 1 }) {
  const [scanProgress, setScanProgress] = useState(0);
  const [viruses, setViruses] = useState([]);
  const [virusesRemoved, setVirusesRemoved] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [missedViruses, setMissedViruses] = useState(0);

  const totalViruses = 6;
  const scanDuration = 6000; // 6 seconds

  useEffect(() => {
    const startTime = Date.now();
    let virusSpawnTimer;

    const spawnVirus = () => {
      if (viruses.length < totalViruses && Date.now() - startTime < scanDuration) {
        const newVirus = {
          id: Date.now() + Math.random(),
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 30 + Math.random() * 20,
          createdAt: Date.now()
        };
        setViruses(prev => [...prev, newVirus]);
        
        // Schedule next virus spawn
        const delay = 800 + Math.random() * 1200;
        virusSpawnTimer = setTimeout(spawnVirus, delay / speedMultiplier);
      }
    };

    // Start spawning viruses after a delay
    virusSpawnTimer = setTimeout(spawnVirus, 1000 / speedMultiplier);

    // Scan progress
    const scanInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / scanDuration) * 100);
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(scanInterval);
        setIsScanning(false);
        
        // Count missed viruses
        setMissedViruses(viruses.length - virusesRemoved);
        
        // Complete after showing results
        setTimeout(() => {
          setIsComplete(true);
          soundSystem.playSuccess();
          setTimeout(() => {
            onComplete(virusesRemoved >= totalViruses * 0.5);
          }, 2000);
        }, 1000);
      }
    }, 50);

    return () => {
      clearTimeout(virusSpawnTimer);
      clearInterval(scanInterval);
    };
  }, []);

  const handleVirusClick = useCallback((virusId) => {
    soundSystem.playClick();
    
    setViruses(prev => prev.filter(v => v.id !== virusId));
    setVirusesRemoved(prev => prev + 1);
  }, []);

  return (
    <div className="mini-game virus-scan">
      <div className="mini-game-header">
        <h2>🔒 VIRUS SCAN IN PROGRESS</h2>
        <div className="scan-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(scanProgress)}%</span>
        </div>
        <div className="virus-counter">
          <span className="virus-label">VIRUSES FOUND:</span>
          <span className="virus-count">{totalViruses}</span>
        </div>
        <div className="removed-counter">
          <span className="removed-label">REMOVED:</span>
          <span className="removed-count">{virusesRemoved}</span>
        </div>
      </div>

      <div className="scan-area">
        {/* Scanning lines animation */}
        {isScanning && (
          <div className="scan-lines">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="scan-line" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        )}

        {/* File icons being scanned */}
        <div className="file-icons">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="file-icon-scan" style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${10 + Math.floor(i / 4) * 30}%`,
              animationDelay: `${i * 0.3}s`
            }}>
              📄
            </div>
          ))}
        </div>

        {/* Viruses */}
        {viruses.map(virus => (
          <div
            key={virus.id}
            className="virus"
            style={{
              left: `${virus.x}%`,
              top: `${virus.y}%`,
              fontSize: virus.size
            }}
            onClick={() => handleVirusClick(virus.id)}
          >
            🦠
          </div>
        ))}

        {/* Click instruction */}
        {viruses.length > 0 && isScanning && (
          <div className="click-instruction">
            Click the viruses to remove them!
          </div>
        )}
      </div>

      {isComplete && (
        <div className="completion-message">
          <h3>SYSTEM CLEAN!</h3>
          <div className="scan-results">
            <div className="result-item">
              <span>Threats Removed:</span>
              <span className="result-value success">{virusesRemoved}/{totalViruses}</span>
            </div>
            <div className="result-item">
              <span>Threats Missed:</span>
              <span className="result-value error">{missedViruses}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
