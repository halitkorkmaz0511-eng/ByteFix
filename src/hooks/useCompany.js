import { useState, useEffect, useCallback, useRef } from 'react';
import {
  COMPANY_TIERS,
  COMPANY_UPGRADES,
  COMPANY_MILESTONES,
  LOCATIONS,
  BUSINESS_STRATEGIES,
  DEFAULT_COMPANY_STATE,
  calculateCompanyTier,
  calculateCompanyValue,
  detectBusinessStrategy,
  createBranch
} from '../data/companySystem';

const STORAGE_KEY = 'bytefix_company_save';

// Default company state
const defaultState = {
  ...DEFAULT_COMPANY_STATE,
  branches: [
    {
      id: 0,
      location: 'headquarters',
      locationName: 'Headquarters',
      level: 1,
      reputation: 20,
      customerDemand: 1,
      avgRepairValue: 1,
      rent: 1,
      competition: 1,
      expenses: 0,
      revenue: 0,
      activeRepairs: 0,
      inventoryValue: 0,
      lastActive: Date.now()
    }
  ]
};

export function useCompany(gameState, addMoney, idleState) {
  const [companyState, setCompanyState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure branches exist
        if (!parsed.branches || parsed.branches.length === 0) {
          parsed.branches = defaultState.branches;
        }
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load company state:', e);
    }
    return defaultState;
  });

  const [showMilestonePopup, setShowMilestonePopup] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(null);
  const [showBranchUnlockPopup, setShowBranchUnlockPopup] = useState(false);
  const [pendingBranchCost, setPendingBranchCost] = useState(0);
  const lastUpdateRef = useRef(Date.now());

  // Save company state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companyState));
    } catch (e) {
      console.error('Failed to save company state:', e);
    }
  }, [companyState]);

  // Calculate current company value
  const getCompanyValue = useCallback(() => {
    return calculateCompanyValue({
      cash: gameState.money,
      shopLevel: gameState.shopLevel,
      upgrades: companyState.upgrades,
      branches: companyState.branches,
      reputation: gameState.reputation,
      marketShare: companyState.marketShare || 15,
      totalRevenue: companyState.totalRevenue
    });
  }, [gameState, companyState]);

  // Get current tier
  const getCompanyTier = useCallback(() => {
    const stats = {
      shopLevel: gameState.shopLevel,
      reputation: gameState.reputation,
      totalRepairs: gameState.totalCustomers || 0,
      companyValue: getCompanyValue()
    };
    return calculateCompanyTier(stats);
  }, [gameState, getCompanyValue]);

  // Get available milestones
  const getAvailableMilestones = useCallback(() => {
    return COMPANY_MILESTONES.filter(m => !companyState.unlockedMilestones.includes(m.id));
  }, [companyState.unlockedMilestones]);

  // Check for milestone unlocks
  const checkMilestones = useCallback(() => {
    const stats = {
      totalRepairs: gameState.totalCustomers || 0,
      companyValue: getCompanyValue(),
      reputation: gameState.reputation,
      marketRanking: companyState.playerRanking || 4,
      totalBranches: companyState.branches.length,
      totalRevenue: companyState.totalRevenue
    };

    const availableMilestones = getAvailableMilestones();
    
    for (const milestone of availableMilestones) {
      if (milestone.condition(stats)) {
        // Unlock milestone
        setCompanyState(prev => ({
          ...prev,
          unlockedMilestones: [...prev.unlockedMilestones, milestone.id],
          milestones: [...prev.milestones, { ...milestone, unlockedAt: Date.now() }]
        }));

        // Apply reward
        if (milestone.reward) {
          if (milestone.reward.money) addMoney(milestone.reward.money);
        }

        // Show popup
        setShowMilestonePopup(milestone);
        setTimeout(() => setShowMilestonePopup(null), 5000);
        
        break; // Only show one at a time
      }
    }
  }, [gameState, getCompanyValue, getAvailableMilestones, addMoney, companyState.playerRanking]);

  // Record revenue/expense
  const recordTransaction = useCallback((amount, type = 'revenue') => {
    setCompanyState(prev => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const dayStart = Math.floor(now / dayMs);
      const lastDay = Math.floor(lastUpdateRef.current / dayMs);
      
      let newState = { ...prev };
      
      if (type === 'revenue') {
        newState.totalRevenue = (prev.totalRevenue || 0) + amount;
        newState.financials = {
          ...prev.financials,
          dailyRevenue: dayStart === lastDay 
            ? prev.financials.dailyRevenue + amount 
            : amount,
          weeklyRevenue: prev.financials.weeklyRevenue + amount
        };
      } else {
        newState.totalExpenses = (prev.totalExpenses || 0) + Math.abs(amount);
        newState.financials = {
          ...prev.financials,
          dailyExpenses: dayStart === lastDay 
            ? prev.financials.dailyExpenses + Math.abs(amount) 
            : Math.abs(amount),
          weeklyExpenses: prev.financials.weeklyExpenses + Math.abs(amount)
        };
      }
      
      lastUpdateRef.current = now;
      
      // Update history
      if (dayStart !== lastDay) {
        newState.financials = {
          ...newState.financials,
          history: [
            {
              day: dayStart,
              revenue: newState.financials.dailyRevenue,
              expenses: newState.financials.dailyExpenses
            },
            ...newState.financials.history.slice(0, 29) // Keep last 30 days
          ],
          weeklyRevenue: 0,
          weeklyExpenses: 0
        };
      }
      
      return newState;
    });
  }, []);

  // Update strategy metrics
  const updateStrategyMetrics = useCallback((metric, value) => {
    setCompanyState(prev => ({
      ...prev,
      strategyMetrics: {
        ...prev.strategyMetrics,
        [metric]: value
      }
    }));
  }, []);

  // Detect and update current strategy
  const updateCurrentStrategy = useCallback(() => {
    const strategy = detectBusinessStrategy(companyState.strategyMetrics);
    if (strategy.id !== companyState.currentStrategy) {
      setCompanyState(prev => ({ ...prev, currentStrategy: strategy.id }));
    }
    return strategy;
  }, [companyState.strategyMetrics, companyState.currentStrategy]);

  // Purchase company upgrade
  const purchaseUpgrade = useCallback((upgradeId) => {
    const upgrade = COMPANY_UPGRADES[upgradeId];
    if (!upgrade) return { success: false, reason: 'Upgrade not found' };
    
    if (companyState.upgrades.includes(upgradeId)) {
      return { success: false, reason: 'Already owned' };
    }
    
    const currentTier = getCompanyTier();
    if (upgrade.tier && currentTier.id < upgrade.tier) {
      return { success: false, reason: `Requires Tier ${upgrade.tier}` };
    }
    
    if (gameState.money < upgrade.cost) {
      return { success: false, reason: 'Insufficient funds' };
    }
    
    addMoney(-upgrade.cost);
    recordTransaction(upgrade.cost, 'expense');
    
    setCompanyState(prev => ({
      ...prev,
      upgrades: [...prev.upgrades, upgradeId]
    }));
    
    setShowUpgradePopup(upgrade);
    setTimeout(() => setShowUpgradePopup(null), 3000);
    
    return { success: true, upgrade };
  }, [companyState.upgrades, companyState.upgrades, getCompanyTier, gameState.money, addMoney, recordTransaction]);

  // Check if can open branch
  const canOpenBranch = useCallback((locationId) => {
    const location = LOCATIONS[locationId];
    if (!location) return { canOpen: false, reason: 'Invalid location' };
    
    const currentTier = getCompanyTier();
    const maxBranches = currentTier.benefits.maxBranches;
    
    if (companyState.branches.length >= maxBranches) {
      return { canOpen: false, reason: `Max ${maxBranches} branches at Tier ${currentTier.id}` };
    }
    
    // Check if already have this location
    if (companyState.branches.some(b => b.location === locationId)) {
      return { canOpen: false, reason: 'Already have this location' };
    }
    
    if (gameState.money < location.unlockCost) {
      return { canOpen: false, reason: `Need $${location.unlockCost.toLocaleString()}` };
    }
    
    return { canOpen: true, cost: location.unlockCost };
  }, [companyState.branches, getCompanyTier, gameState.money]);

  // Open a new branch
  const openBranch = useCallback((locationId) => {
    const check = canOpenBranch(locationId);
    if (!check.canOpen) return check;
    
    const location = LOCATIONS[locationId];
    const newBranch = createBranch(
      companyState.branches.length,
      locationId,
      location
    );
    
    addMoney(-check.cost);
    recordTransaction(check.cost, 'expense');
    
    setCompanyState(prev => ({
      ...prev,
      branches: [...prev.branches, newBranch]
    }));
    
    // Check for expansion milestone
    setTimeout(() => {
      setShowBranchUnlockPopup(true);
      setPendingBranchCost(check.cost);
      setTimeout(() => setShowBranchUnlockPopup(false), 3000);
    }, 100);
    
    return { success: true, branch: newBranch };
  }, [companyState.branches, canOpenBranch, addMoney, recordTransaction]);

  // Get available locations for expansion
  const getAvailableLocations = useCallback(() => {
    return Object.entries(LOCATIONS)
      .filter(([id]) => !companyState.branches.some(b => b.location === id))
      .map(([id, loc]) => ({
        ...loc,
        canAfford: gameState.money >= loc.unlockCost,
        currentTier: getCompanyTier(),
        meetsTierRequirement: getCompanyTier().id >= 2 // Unlock at tier 2
      }));
  }, [companyState.branches, gameState.money, getCompanyTier]);

  // Get company-wide upgrade effects
  const getUpgradeEffects = useCallback(() => {
    const effects = {
      partsDiscount: 0,
      employeeEfficiency: 0,
      reputationGain: 0,
      operatingCostReduction: 0,
      deliverySpeed: 0,
      idleEarningsBonus: 0,
      advancedRepairs: false,
      branchProfitBoost: 0
    };
    
    companyState.upgrades.forEach(id => {
      const upgrade = COMPANY_UPGRADES[id];
      if (upgrade?.effect) {
        Object.entries(upgrade.effect).forEach(([key, value]) => {
          if (typeof effects[key] === 'number') {
            effects[key] += value;
          } else {
            effects[key] = value;
          }
        });
      }
    });
    
    return effects;
  }, [companyState.upgrades]);

  // Get financial summary
  const getFinancialSummary = useCallback(() => {
    const { financials } = companyState;
    return {
      dailyRevenue: financials.dailyRevenue || 0,
      dailyExpenses: financials.dailyExpenses || 0,
      dailyProfit: (financials.dailyRevenue || 0) - (financials.dailyExpenses || 0),
      weeklyRevenue: financials.weeklyRevenue || 0,
      weeklyExpenses: financials.weeklyExpenses || 0,
      weeklyProfit: (financials.weeklyRevenue || 0) - (financials.weeklyExpenses || 0),
      totalRevenue: companyState.totalRevenue || 0,
      totalExpenses: companyState.totalExpenses || 0,
      totalProfit: (companyState.totalRevenue || 0) - (companyState.totalExpenses || 0)
    };
  }, [companyState]);

  // Reset company state
  const resetCompany = useCallback(() => {
    setCompanyState(defaultState);
  }, []);

  // Get current strategy object
  const getCurrentStrategy = useCallback(() => {
    return BUSINESS_STRATEGIES[companyState.currentStrategy] || BUSINESS_STRATEGIES.balanced;
  }, [companyState.currentStrategy]);

  return {
    // State
    companyState,
    
    // Computed values
    getCompanyValue,
    getCompanyTier,
    getCurrentStrategy,
    getUpgradeEffects,
    getFinancialSummary,
    
    // Milestones
    getAvailableMilestones,
    checkMilestones,
    
    // Transactions
    recordTransaction,
    updateStrategyMetrics,
    updateCurrentStrategy,
    
    // Upgrades
    purchaseUpgrade,
    
    // Branches
    canOpenBranch,
    openBranch,
    getAvailableLocations,
    
    // Popups
    showMilestonePopup,
    showUpgradePopup,
    showBranchUnlockPopup,
    pendingBranchCost,
    
    // Reset
    resetCompany
  };
}
