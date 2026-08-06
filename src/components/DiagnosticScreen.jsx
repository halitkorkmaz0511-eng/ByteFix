import { useState, useEffect } from 'react';
import { getDiagnosticData, problems } from '../data/problems';
import { soundSystem } from '../utils/soundSystem';
import './DiagnosticScreen.css';

export function DiagnosticScreen({ customer, onBack, onRepair, inventory }) {
  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showRepairOptions, setShowRepairOptions] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [showPartsInfo, setShowPartsInfo] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSupplier, setOrderSupplier] = useState('tech_supply');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const { getRequiredParts, canPerformRepair, getItemQuantity, placeOrder, gameState } = inventory || {};

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
    setShowPartsInfo(false);
    setOrderSuccess(null);
  };

  const handleRepairSelect = (repairId) => {
    try {
      soundSystem.playClick();
    } catch (e) {
      console.error('Sound error:', e);
    }
    
    // Check inventory if this is the correct repair
    if (canPerformRepair) {
      const repairCheck = canPerformRepair(selectedProblem);
      if (!repairCheck.canRepair) {
        // Can't repair due to missing parts
        setShowPartsInfo(true);
        return;
      }
    }
    
    onRepair(selectedProblem, repairId);
  };

  const handlePlaceOrder = (partId) => {
    const result = placeOrder(partId, orderQuantity, orderSupplier);
    if (result.success) {
      setOrderSuccess({ partId, ...result });
      soundSystem.playMoney?.();
    } else {
      setOrderSuccess({ error: result.reason });
    }
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

  // Get required parts for selected problem
  const requiredParts = selectedProblem && getRequiredParts ? getRequiredParts(selectedProblem) : [];
  const repairCheck = selectedProblem && canPerformRepair ? canPerformRepair(selectedProblem) : { canRepair: true, requiredParts: [] };

  // Calculate part prices for suppliers
  const getPartPrice = (partId, supplierId) => {
    const basePrices = {
      ram: { budget_parts: 43, tech_supply: 50, pro_hardware: 60 },
      ssd: { budget_parts: 68, tech_supply: 80, pro_hardware: 96 },
      hdd: { budget_parts: 51, tech_supply: 60, pro_hardware: 72 },
      cpu: { budget_parts: 170, tech_supply: 200, pro_hardware: 240 },
      gpu: { budget_parts: 298, tech_supply: 350, pro_hardware: 420 },
      cooling_fan: { budget_parts: 21, tech_supply: 25, pro_hardware: 30 },
      thermal_paste: { budget_parts: 13, tech_supply: 15, pro_hardware: 18 },
      motherboard: { budget_parts: 128, tech_supply: 150, pro_hardware: 180 },
      power_supply: { budget_parts: 68, tech_supply: 80, pro_hardware: 96 }
    };
    return basePrices[partId]?.[supplierId] || 50;
  };

  const suppliers = [
    { id: 'budget_parts', name: 'BudgetParts', delivery: '3 days', priceMod: '-15%', reliable: '75%' },
    { id: 'tech_supply', name: 'TechSupply', delivery: '1 day', priceMod: 'normal', reliable: '95%' },
    { id: 'pro_hardware', name: 'ProHardware', delivery: 'Same day', priceMod: '+20%', reliable: '99%', unlockLevel: 3 }
  ];

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
                const partsInfo = getRequiredParts ? getRequiredParts(problemId) : [];
                const hasRequiredParts = partsInfo.every(p => p.available || p.optional);
                
                return (
                  <button
                    key={problemId}
                    className={`problem-btn ${!hasRequiredParts ? 'needs-parts' : ''}`}
                    onClick={() => handleProblemClick(problemId)}
                  >
                    <span className="problem-icon">
                      {problemId === 'cpu_overheating' && '🌡️'}
                      {problemId === 'storage_full' && '💾'}
                      {problemId === 'virus' && '🦠'}
                    </span>
                    <span className="problem-name">{problem.name}</span>
                    {!hasRequiredParts && (
                      <span className="parts-warning">⚠️ Need parts</span>
                    )}
                    {hasRequiredParts && partsInfo.length > 0 && (
                      <span className="parts-ready">✓ Parts ready</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showRepairOptions && selectedProblem && (
          <div className="repair-options">
            <h3>Choose repair action:</h3>
            
            {/* Parts Required Info */}
            {showPartsInfo && requiredParts.length > 0 && (
              <div className="parts-required">
                <h4>⚠️ Missing Required Parts</h4>
                <div className="parts-list">
                  {requiredParts.filter(p => !p.optional).map(part => (
                    <div key={part.partId} className={`part-item ${part.available ? 'in-stock' : 'out-stock'}`}>
                      <span className="part-icon">{part.part?.icon || '🔧'}</span>
                      <span className="part-name">{part.part?.name || part.partId}</span>
                      <span className="part-qty">Need: {part.quantity}</span>
                      <span className="part-stock">Stock: {getItemQuantity ? getItemQuantity(part.partId) : 0}</span>
                    </div>
                  ))}
                </div>
                
                {/* Order Form */}
                <div className="order-form">
                  <h5>Quick Order</h5>
                  <div className="order-row">
                    <select 
                      value={orderSupplier} 
                      onChange={(e) => setOrderSupplier(e.target.value)}
                      className="supplier-select"
                    >
                      {suppliers.map(s => (
                        <option 
                          key={s.id} 
                          value={s.id}
                          disabled={s.unlockLevel && gameState?.shopLevel < s.unlockLevel}
                        >
                          {s.name} {s.unlockLevel && `(Lvl ${s.unlockLevel}+)`}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                      className="quantity-input"
                    />
                    <span className="qty-label">qty</span>
                  </div>
                  
                  {requiredParts.filter(p => !p.available).map(part => (
                    <div key={part.partId} className="order-part">
                      <span>{part.part?.name}: </span>
                      <span className="order-price">
                        ${getPartPrice(part.partId, orderSupplier) * orderQuantity}
                      </span>
                      <button 
                        className="order-btn"
                        onClick={() => handlePlaceOrder(part.partId)}
                      >
                        Order
                      </button>
                    </div>
                  ))}
                  
                  {orderSuccess && (
                    <div className={`order-result ${orderSuccess.error ? 'error' : 'success'}`}>
                      {orderSuccess.error || `Order placed! Arrives in ${orderSupplier === 'budget_parts' ? '3' : orderSupplier === 'tech_supply' ? '1' : '0'} day(s)`}
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
                className={`repair-btn correct ${!repairCheck.canRepair && !showPartsInfo ? 'disabled' : ''}`}
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
                {selectedProblem !== 'virus' && (
                  <span className="parts-needed">
                    {requiredParts.some(p => !p.available && !p.optional) ? '⚠️ Need parts' : '✓ Ready'}
                  </span>
                )}
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
