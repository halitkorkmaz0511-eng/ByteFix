import { useState, useEffect } from 'react';
import './GameHints.css';

export function GameHints({ 
  marketState, 
  inventoryState, 
  companyState,
  eventsState,
  gameState 
}) {
  const [currentHint, setCurrentHint] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hint = generateHint();
    setCurrentHint(hint);
    
    // Show hint for 5 seconds every 30 seconds
    const showTimer = setTimeout(() => setVisible(true), 500);
    const hideTimer = setTimeout(() => setVisible(false), 8000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [marketState, inventoryState, companyState, eventsState, gameState]);

  if (!visible || !currentHint) return null;

  return (
    <div className={`game-hint ${visible ? 'visible' : ''}`}>
      <span className="hint-icon">💡</span>
      <span className="hint-text">{currentHint}</span>
    </div>
  );
}

function generateHint({ marketState, inventoryState, companyState, eventsState, gameState }) {
  const hints = [];

  // Market demand hints
  if (marketState?.categoryDemand) {
    Object.entries(marketState.categoryDemand).forEach(([cat, demand]) => {
      if (demand > 1.2) {
        hints.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)} repairs are in high demand!`);
      } else if (demand < 0.8) {
        hints.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)} repairs are less popular right now.`);
      }
    });
  }

  // Inventory hints
  if (inventoryState) {
    const lowStock = getLowStockItems(inventoryState);
    if (lowStock.length > 0) {
      hints.push(`Stock running low: ${lowStock[0]}. Consider ordering more.`);
    }
  }

  // Event hints
  if (eventsState?.activeBuffs?.length > 0) {
    const buffNames = eventsState.activeBuffs.map(b => b.name);
    hints.push(`Active effect: ${buffNames[0]}`);
  }

  if (eventsState?.activeContracts?.length > 0) {
    const contract = eventsState.activeContracts[0];
    const remaining = contract.requiredRepairs - contract.completedRepairs;
    hints.push(`Contract progress: ${remaining} more ${contract.name} repairs needed`);
  }

  // Branch hints
  if (companyState?.branches?.length > 0) {
    const branch = companyState.branches[0];
    if (branch.specializations?.length > 0) {
      hints.push(`${branch.name} attracts more ${branch.specializations[0]} repairs.`);
    }
  }

  // Pricing hints
  if (marketState?.playerPricing?.general === 'budget') {
    hints.push("Budget pricing brings more customers but lower profits.");
  } else if (marketState?.playerPricing?.general === 'premium') {
    hints.push("Premium pricing means fewer customers but higher rewards.");
  }

  // Reputation hints
  if (gameState?.reputation < 20) {
    hints.push("Focus on quality repairs to build reputation.");
  } else if (gameState?.reputation > 80) {
    hints.push("Great reputation! Consider premium pricing.");
  }

  // Specialization hints
  if (marketState?.playerSpecialization && marketState.playerSpecialization !== 'none') {
    hints.push(`Specializing in ${marketState.playerSpecialization} attracts related customers.`);
  }

  // Contract hints
  if (eventsState?.availableContracts?.length > 0) {
    hints.push("New contract available in the Events tab!");
  }

  // Supplier hints
  if (eventsState?.activeBuffs?.some(b => b.effect?.partsDiscount)) {
    hints.push("Supplier discount active! Good time to stock up.");
  }

  // Return a random hint if we have any
  if (hints.length > 0) {
    return hints[Math.floor(Math.random() * hints.length)];
  }

  return null;
}

function getLowStockItems(inventoryState) {
  if (!inventoryState?.inventory) return [];
  
  return Object.entries(inventoryState.inventory)
    .filter(([_, item]) => item.quantity < 5)
    .map(([name]) => name);
}
