import { useState, useEffect } from 'react';
import { getDiagnosticData, problems } from '../data/problems';
import { soundSystem } from '../utils/soundSystem';
import './DiagnosticScreen.css';

export function DiagnosticScreen({ customer, onBack, onRepair }) {
  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showRepairOptions, setShowRepairOptions] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Generate diagnostics with animation delay
    const data = getDiagnosticData(customer.problems);
    const timers = [];
    
    data.forEach((_, index) => {
      const timer = setTimeout(() => {
        setDiagnostics(prev => [...prev, data[index]]);
        if (index === data.length - 1) {
          setTimeout(() => setIsScanning(false), 500);
        }
      }, (index + 1) * 150);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [customer.problems]);

  const handleProblemClick = (problemId) => {
    soundSystem.playClick();
    setSelectedProblem(problemId);
    setShowRepairOptions(true);
  };

  const handleRepairSelect = (repairId) => {
    try {
      soundSystem.playClick();
    } catch (e) {
      console.error('Sound error:', e);
    }
    onRepair(selectedProblem, repairId);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'good': return 'status-good';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="diagnostic-screen">
      <div className="diagnostic-container">
        <div className="diagnostic-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>SYSTEM DIAGNOSTICS</h2>
          <div className="patience-meter">
            <span>Patience:</span>
            <div className="patience-bar">
              <div 
                className="patience-fill" 
                style={{ width: `${(customer.patience / customer.maxPatience) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="diagnostics-grid">
          {diagnostics.map((diag, index) => (
            <div key={index} className={`diagnostic-item ${getStatusClass(diag.status)}`}>
              <span className="diagnostic-icon">{getStatusIcon(diag.status)}</span>
              <div className="diagnostic-content">
                <span className="diagnostic-label">{diag.label}</span>
                <span className="diagnostic-value">{diag.value}</span>
              </div>
            </div>
          ))}
          
          {isScanning && (
            <div className="scanning-overlay">
              <div className="scanning-spinner"></div>
              <span>Scanning system...</span>
            </div>
          )}
        </div>

        {!showRepairOptions && !isScanning && (
          <div className="problem-section">
            <h3>Select the problem to repair:</h3>
            <div className="problems-list">
              {customer.problems.map(problemId => {
                const problem = problems[problemId];
                return (
                  <button 
                    key={problemId}
                    className="problem-btn"
                    onClick={() => handleProblemClick(problemId)}
                  >
                    <span className="problem-icon">
                      {problemId === 'cpu_overheating' && '🌡️'}
                      {problemId === 'storage_full' && '💾'}
                      {problemId === 'virus' && '🦠'}
                    </span>
                    <span className="problem-name">{problem.name}</span>
                    <span className="problem-hint">Click to inspect</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showRepairOptions && selectedProblem && (
          <div className="repair-options">
            <h3>Choose repair action:</h3>
            <div className="repair-list">
              {problems[selectedProblem].wrongRepairs.map(repairId => (
                <button 
                  key={repairId}
                  className="repair-btn wrong"
                  onClick={() => handleRepairSelect(repairId)}
                >
                  <span className="repair-icon">
                    {repairId === 'clean_cooling' && '🧹'}
                    {repairId === 'add_ram' && '💾'}
                    {repairId === 'clean_files' && '🗑️'}
                    {repairId === 'run_virus_scan' && '🔒'}
                  </span>
                  <span className="repair-name">
                    {repairId === 'clean_cooling' && 'Clean Cooling System'}
                    {repairId === 'add_ram' && 'Add More RAM'}
                    {repairId === 'clean_files' && 'Clean Files'}
                    {repairId === 'run_virus_scan' && 'Run Virus Scan'}
                  </span>
                </button>
              ))}
              <button 
                className="repair-btn correct"
                onClick={() => handleRepairSelect(problems[selectedProblem].correctRepair)}
              >
                <span className="repair-icon">
                  {selectedProblem === 'cpu_overheating' && '🧹'}
                  {selectedProblem === 'storage_full' && '🗑️'}
                  {selectedProblem === 'virus' && '🔒'}
                </span>
                <span className="repair-name">
                  {selectedProblem === 'cpu_overheating' && 'Clean Cooling System'}
                  {selectedProblem === 'storage_full' && 'Clean Files'}
                  {selectedProblem === 'virus' && 'Run Virus Scan'}
                </span>
              </button>
            </div>
            <button className="cancel-btn" onClick={() => setShowRepairOptions(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
