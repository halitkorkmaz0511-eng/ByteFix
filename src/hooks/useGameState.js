import { useState, useEffect, useCallback } from 'react';
import { generateCustomer } from '../data/customerData';
import { calculateUpgradeEffects, getTotalXpForLevel } from '../data/upgrades';
import { loadAndMigrateSave, saveGameState, DEFAULT_STATES, GAME_VERSION } from '../utils/saveUtils';

// Default game state
const defaultState = {
  money: 500,
  xp: 0,
  reputation: 50,
  shopLevel: 1,
  combo: 0,
  bestCombo: 0,
  totalCustomers: 0,
  successfulRepairs: 0,
  failedRepairs: 0,
  totalMoneyEarned: 0,
  purchasedUpgrades: [],
  unlockedCustomers: ['GAMER', 'STUDENT', 'OFFICE_WORKER', 'PARENT', 'BUSINESS_OWNER'],
  settings: {
    sound: true,
    music: true
  },
  hasSeenWelcome: false
};

export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    const migrated = loadAndMigrateSave();
    if (migrated && migrated.game) {
      console.log('Loaded migrated save:', migrated.version);
      return { ...defaultState, ...migrated.game };
    }
    console.log('Using default state');
    return defaultState;
  });

  // Save to localStorage whenever state changes (full state save)
  useEffect(() => {
    const fullState = {
      version: GAME_VERSION,
      game: gameState,
      timestamp: Date.now()
    };
    saveGameState(fullState);
  }, [gameState]);

  // Update money
  const addMoney = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + amount,
      totalMoneyEarned: prev.totalMoneyEarned + amount
    }));
  }, []);

  // Add XP and check for level up
  const addXp = useCallback((amount) => {
    setGameState(prev => {
      const newXp = prev.xp + amount;
      const currentLevelXp = getTotalXpForLevel(prev.shopLevel);
      const previousLevelXp = getTotalXpForLevel(prev.shopLevel - 1);
      
      if (newXp >= currentLevelXp) {
        // Level up!
        return {
          ...prev,
          xp: newXp - currentLevelXp,
          shopLevel: prev.shopLevel + 1,
          reputation: Math.min(100, prev.reputation + 5)
        };
      }
      
      return { ...prev, xp: newXp };
    });
  }, []);

  // Update reputation
  const updateReputation = useCallback((change) => {
    setGameState(prev => ({
      ...prev,
      reputation: Math.max(0, Math.min(100, prev.reputation + change))
    }));
  }, []);

  // Increment combo
  const incrementCombo = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      combo: prev.combo + 1,
      bestCombo: Math.max(prev.bestCombo, prev.combo + 1)
    }));
  }, []);

  // Reset combo
  const resetCombo = useCallback(() => {
    setGameState(prev => ({ ...prev, combo: 0 }));
  }, []);

  // Record successful repair
  const recordSuccess = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      totalCustomers: prev.totalCustomers + 1,
      successfulRepairs: prev.successfulRepairs + 1
    }));
  }, []);

  // Record failed repair
  const recordFailure = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      totalCustomers: prev.totalCustomers + 1,
      failedRepairs: prev.failedRepairs + 1
    }));
  }, []);

  // Purchase upgrade
  const purchaseUpgrade = useCallback((upgradeId, cost) => {
    setGameState(prev => {
      if (prev.money < cost || prev.purchasedUpgrades.includes(upgradeId)) {
        return prev;
      }
      return {
        ...prev,
        money: prev.money - cost,
        purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
      };
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((key, value) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({ ...defaultState, settings: gameState.settings });
  }, [gameState.settings]);

  // Mark welcome seen
  const markWelcomeSeen = useCallback(() => {
    setGameState(prev => ({ ...prev, hasSeenWelcome: true }));
  }, []);

  // Calculate derived values
  const effects = calculateUpgradeEffects(gameState.purchasedUpgrades);
  
  // Calculate average repair time
  const averageRepairTime = gameState.successfulRepairs > 0
    ? (gameState.totalCustomers > 0 
        ? Math.round((gameState.successfulRepairs / gameState.totalCustomers) * 100)
        : 0)
    : 0;

  return {
    gameState,
    effects,
    averageRepairTime,
    addMoney,
    addXp,
    updateReputation,
    incrementCombo,
    resetCombo,
    recordSuccess,
    recordFailure,
    purchaseUpgrade,
    updateSettings,
    resetGame,
    markWelcomeSeen
  };
}
