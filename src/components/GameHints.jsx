import { useState, useEffect, useRef, useCallback } from 'react';
import './GameHints.css';

const HINT_COOLDOWN_MS = 60000; // 1 minute between hints
const HINT_DISPLAY_DURATION = 6000; // Show for 6 seconds
const HINT_SHOW_DELAY = 3000; // Delay before showing

export function GameHints({ 
  marketState, 
  inventoryState, 
  companyState,
  eventsState,
  gameState,
  currentScreen
}) {
  const [currentHint, setCurrentHint] = useState(null);
  const [visible, setVisible] = useState(false);
  const lastHintTimeRef = useRef(0);
  const shownHintsRef = useRef(new Set());
  
  // Don't show hints during active gameplay
  const shouldShowHints = currentScreen === 'workshop' || currentScreen === 'diagnostic';
  
  const showNextHint = useCallback(() => {
    if (!shouldShowHints) return;
    
    const now = Date.now();
    if (now - lastHintTimeRef.current < HINT_COOLDOWN_MS) return;
    
    const hint = generateHint({ marketState, inventoryState, companyState, eventsState, gameState });
    
    if (!hint) return;
    
    // Avoid repeating the same hint
    if (shownHintsRef.current.has(hint)) return;
    
    shownHintsRef.current.add(hint);
    if (shownHintsRef.current.size > 10) {
      // Clear old hints after 10 unique hints
      shownHintsRef.current.clear();
    }
    
    setCurrentHint(hint);
    lastHintTimeRef.current = now;
    
    // Show hint
    setTimeout(() => setVisible(true), HINT_SHOW_DELAY);
    setTimeout(() => setVisible(false), HINT_SHOW_DELAY + HINT_DISPLAY_DURATION);
  }, [shouldShowHints, marketState, inventoryState, companyState, eventsState, gameState]);

  // Show hints periodically when on workshop
  useEffect(() => {
    if (!shouldShowHints) {
      setVisible(false);
      return;
    }
    
    const interval = setInterval(() => {
      showNextHint();
    }, HINT_COOLDOWN_MS + HINT_SHOW_DELAY + HINT_DISPLAY_DURATION);
    
    // Show first hint after a delay
    const initialTimer = setTimeout(() => showNextHint(), 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [shouldShowHints, showNextHint]);

  if (!visible || !currentHint) return null;

  return (
    <div className="game-hint visible">
      <span className="hint-icon">💡</span>
      <span className="hint-text">{currentHint}</span>
    </div>
  );
}

function generateHint({ marketState, inventoryState, companyState, eventsState, gameState }) {
  const hints = [];
  const now = Date.now();

  // Contract hints - HIGH PRIORITY
  if (eventsState?.activeContracts?.length > 0) {
    const contract = eventsState.activeContracts[0];
    const remaining = contract.requiredRepairs - contract.completedRepairs;
    const daysLeft = contract.deadline ? Math.ceil((contract.deadline - now) / (24 * 60 * 60 * 1000)) : 999;
    
    if (daysLeft <= 2 && remaining > 0) {
      hints.push(`⚠️ Contract deadline approaching! ${remaining} more repairs needed.`);
    } else if (remaining <= 2 && remaining > 0) {
      hints.push(`🎯 Almost done! Just ${remaining} more ${contract.name} repairs.`);
    }
  }

  // Active buff hints
  if (eventsState?.activeBuffs?.length > 0) {
    const buff = eventsState.activeBuffs[0];
    const timeLeft = Math.ceil((buff.expiresAt - now) / (60 * 1000));
    hints.push(`${buff.icon} ${buff.name} active (${timeLeft}m remaining)`);
  }

  // Low inventory hints
  if (inventoryState?.inventory) {
    const lowStock = getLowStockItems(inventoryState);
    if (lowStock.length > 0) {
      hints.push(`📦 Low stock: ${lowStock[0]}. Order more parts!`);
    }
  }

  // High demand hints
  if (marketState?.categoryDemand) {
    const highDemand = Object.entries(marketState.categoryDemand)
      .filter(([_, demand]) => demand > 1.3)
      .map(([cat]) => cat);
    
    if (highDemand.length > 0) {
      hints.push(`📈 High demand for ${highDemand[0]} repairs!`);
    }
  }

  // Expensive parts hint
  if (inventoryState?.inventory) {
    const expensive = getExpensivePartNeeded(inventoryState, gameState);
    if (expensive) {
      hints.push(`💎 ${expensive} could boost profits. Consider stocking up.`);
    }
  }

  // Market trends hints
  if (marketState?.playerPricing?.general === 'budget' && marketState.playerMarketShare < 15) {
    hints.push(`📉 Budget pricing reducing profits. Consider adjusting.`);
  }

  // Reputation hints
  if (gameState?.reputation < 25 && (gameState?.successfulRepairs || 0) > 5) {
    hints.push(`⭐ Focus on quality repairs to build reputation.`);
  } else if (gameState?.reputation > 75) {
    hints.push(`🌟 High reputation! You can use premium pricing.`);
  }

  // New contract available
  if (eventsState?.availableContracts?.length > 0) {
    hints.push(`📑 New contract available! Check the Events tab.`);
  }

  // Marketing opportunity
  if (!eventsState?.activeBuffs?.some(b => b.name?.includes('Marketing')) && 
      !inventoryState?.activeMarketing) {
    hints.push(`📢 Marketing can attract more customers.`);
  }

  // Specialization hint
  if (marketState?.playerSpecialization === 'none' && (gameState?.successfulRepairs || 0) > 10) {
    hints.push(`🎯 Specializing can attract more customers.`);
  }

  // Assistant hint
  if ((gameState?.successfulRepairs || 0) > 20 && !eventsState?.hiredAssistants?.length) {
    hints.push(`👥 Hiring an assistant can boost efficiency.`);
  }

  // Return a random hint if we have any
  if (hints.length > 0) {
    // Prioritize contract hints
    const priorityHint = hints.find(h => h.includes('⚠️'));
    return priorityHint || hints[Math.floor(Math.random() * hints.length)];
  }

  return null;
}

function getLowStockItems(inventoryState) {
  if (!inventoryState?.inventory) return [];
  
  return Object.entries(inventoryState.inventory)
    .filter(([_, item]) => item.quantity < 3)
    .map(([name]) => name);
}

function getExpensivePartNeeded(inventoryState, gameState) {
  const valuableParts = ['GPU', 'RAM', 'SSD', 'CPU'];
  if (!inventoryState?.inventory) return null;
  
  for (const part of valuableParts) {
    if (inventoryState.inventory[part]?.quantity < 2) {
      return part;
    }
  }
  return null;
}
