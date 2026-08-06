import { useState, useEffect, useCallback, useRef } from 'react';
import {
  REPAIR_CATEGORIES,
  COMPETITOR_TEMPLATES,
  MARKET_EVENTS,
  PRICING_TIERS,
  SPECIALIZATIONS,
  NEWS_TYPES,
  DEFAULT_MARKET_STATE,
  initializeCompetitors,
  calculateMarketShare,
  getEffectiveDemand,
  getEffectivePrice
} from '../data/marketSystem';

const STORAGE_KEY = 'bytefix_market_save';

// Default market state
const defaultState = {
  ...DEFAULT_MARKET_STATE,
  competitors: initializeCompetitors(),
  playerPricing: {
    cpu: 'normal',
    gpu: 'normal',
    storage: 'normal',
    virus: 'normal',
    cooling: 'normal',
    general: 'normal'
  },
  playerSpecialization: 'none',
  lastSimulationDay: 1,
  totalSimulatedDays: 0
};

export function useMarket(gameState) {
  const [marketState, setMarketState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure competitors exist
        if (!parsed.competitors || parsed.competitors.length === 0) {
          parsed.competitors = initializeCompetitors();
        }
        // Merge with defaults for missing fields
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load market state:', e);
    }
    return defaultState;
  });

  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newNews, setNewNews] = useState(null);
  const simulationRef = useRef(false);

  // Save market state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(marketState));
    } catch (e) {
      console.error('Failed to save market state:', e);
    }
  }, [marketState]);

  // Initialize competitors on first load
  useEffect(() => {
    if (marketState.competitors.length === 0) {
      setMarketState(prev => ({
        ...prev,
        competitors: initializeCompetitors()
      }));
    }
  }, []);

  // Add news item
  const addNews = useCallback((text, type = NEWS_TYPES.GENERAL, data = {}) => {
    const newsItem = {
      id: Date.now(),
      day: marketState.currentDay,
      text,
      type,
      data,
      timestamp: Date.now()
    };
    
    setMarketState(prev => ({
      ...prev,
      news: [newsItem, ...prev.news].slice(0, 50) // Keep last 50 news items
    }));
    
    setNewNews(newsItem);
    setShowNewsPopup(true);
    setTimeout(() => setShowNewsPopup(false), 5000);
  }, [marketState.currentDay]);

  // Simulate competitor for one day
  const simulateCompetitor = useCallback((competitor, daysSimulated) => {
    const strategy = COMPETITOR_TEMPLATES.find(t => t.id === competitor.id)?.strategy || 'budget';
    const strategyDef = {
      budget: { repChange: 0.5, shareChange: 0.3, income: 150 },
      premium: { repChange: 1.0, shareChange: -0.2, income: 300 },
      specialist: { repChange: 0.7, shareChange: 0.1, income: 200 },
      marketing: { repChange: 0.4, shareChange: 0.5, income: 180 },
      automation: { repChange: 0.3, shareChange: 0.2, income: 220 }
    }[strategy] || { repChange: 0.5, shareChange: 0.1, income: 180 };
    
    // Reputation changes slowly
    const repChange = (Math.random() - 0.4) * strategyDef.repChange;
    let newRep = Math.max(20, Math.min(95, competitor.reputation + repChange));
    
    // Market share fluctuates
    const shareChange = (Math.random() - 0.5) * strategyDef.shareChange;
    let newShare = Math.max(3, Math.min(35, competitor.marketShare + shareChange));
    
    // Money changes based on performance
    const customers = Math.round(competitor.level * 2 * (newRep / 50) * (1 + strategyDef.shareChange * 0.5));
    const income = customers * strategyDef.income;
    const expenses = competitor.level * 100 + competitor.employeeCount * 50;
    const newMoney = competitor.money + income - expenses;
    
    // Level up occasionally
    let newLevel = competitor.level;
    if (Math.random() < 0.02 && newRep > 70 && newMoney > 5000) {
      newLevel++;
      addNews(`${competitor.name} expanded to Level ${newLevel}!`, NEWS_TYPES.COMPETITOR_ACTION);
    }
    
    return {
      ...competitor,
      reputation: Math.round(newRep),
      marketShare: Math.round(newShare * 10) / 10,
      level: newLevel,
      money: Math.max(0, newMoney),
      recentPerformance: [
        { day: daysSimulated, rep: newRep, share: newShare },
        ...(competitor.recentPerformance || []).slice(0, 6)
      ]
    };
  }, [addNews]);

  // Run daily simulation
  const runDailySimulation = useCallback(() => {
    setMarketState(prev => {
      if (prev.currentDay <= prev.lastSimulationDay) {
        return prev;
      }
      
      let newState = { ...prev };
      
      // 1. Update day
      newState.currentDay = prev.currentDay;
      newState.lastSimulationDay = prev.currentDay;
      newState.totalSimulatedDays = (prev.totalSimulatedDays || 0) + 1;
      
      // 2. Simulate competitors
      newState.competitors = prev.competitors.map(c => 
        simulateCompetitor(c, newState.totalSimulatedDays)
      );
      
      // 3. Update market share
      const playerShare = calculateMarketShare(
        gameState.reputation,
        gameState.shopLevel,
        1.0 // Average price
      );
      newState.playerMarketShare = playerShare;
      
      // Update ranking
      const allShares = [
        { name: 'ByteFix', share: playerShare },
        ...newState.competitors.map(c => ({ name: c.name, share: c.marketShare }))
      ].sort((a, b) => b.share - a.share);
      
      const playerRank = allShares.findIndex(s => s.name === 'ByteFix') + 1;
      newState.playerRanking = playerRank;
      
      // 4. Calculate market growth
      const avgCompetitorGrowth = newState.competitors.reduce((sum, c) => {
        const prev = c.recentPerformance?.[1];
        if (!prev) return sum;
        return sum + (c.reputation - prev.rep);
      }, 0) / (newState.competitors.length || 1);
      
      newState.marketGrowth = avgCompetitorGrowth > 0 ? Math.round(avgCompetitorGrowth * 10) / 10 : 0;
      
      // 5. Process active event
      if (newState.activeEvent && newState.eventDaysRemaining > 0) {
        newState.eventDaysRemaining = prev.eventDaysRemaining - 1;
        
        if (newState.eventDaysRemaining <= 0) {
          addNews(`${newState.activeEvent.name} has ended.`, NEWS_TYPES.MARKET_EVENT);
          newState.activeEvent = null;
        }
      }
      
      // 6. Chance to start new event
      if (!newState.activeEvent && Math.random() < 0.15) {
        const possibleEvents = MARKET_EVENTS.filter(e => e.id !== prev.activeEvent?.id);
        const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        newState.activeEvent = event;
        newState.eventDaysRemaining = event.duration;
        addNews(event.news, NEWS_TYPES.MARKET_EVENT, { event });
      }
      
      // 7. Generate occasional news
      if (Math.random() < 0.3) {
        const categoryKeys = Object.keys(REPAIR_CATEGORIES);
        const catId = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        const cat = REPAIR_CATEGORIES[catId];
        const demandChange = prev.categoryDemand[catId] || 1;
        
        if (Math.random() < 0.5 && demandChange < 1.5) {
          newState.categoryDemand = {
            ...prev.categoryDemand,
            [catId]: Math.min(2, demandChange + 0.1)
          };
          addNews(`${cat.name} demand increased.`, NEWS_TYPES.DEMAND_CHANGE, { category: catId });
        } else if (demandChange > 0.5) {
          newState.categoryDemand = {
            ...prev.categoryDemand,
            [catId]: Math.max(0.3, demandChange - 0.1)
          };
          addNews(`${cat.name} demand decreased.`, NEWS_TYPES.DEMAND_CHANGE, { category: catId });
        }
      }
      
      return newState;
    });
  }, [gameState.reputation, gameState.shopLevel, simulateCompetitor, addNews]);

  // Advance game day
  const advanceDay = useCallback(() => {
    setMarketState(prev => ({
      ...prev,
      currentDay: prev.currentDay + 1
    }));
  }, []);

  // Set pricing for a category
  const setPricing = useCallback((categoryId, tier) => {
    if (!PRICING_TIERS[tier]) return;
    
    setMarketState(prev => ({
      ...prev,
      playerPricing: {
        ...prev.playerPricing,
        [categoryId]: tier
      }
    }));
    
    const cat = REPAIR_CATEGORIES[categoryId];
    const tierDef = PRICING_TIERS[tier];
    addNews(`Changed ${cat?.name || categoryId} pricing to ${tierDef.name}.`, NEWS_TYPES.PRICE_CHANGE);
  }, [addNews]);

  // Set specialization
  const setSpecialization = useCallback((specId) => {
    if (!SPECIALIZATIONS[specId]) return;
    
    const prevSpec = SPECIALIZATIONS[marketState.playerSpecialization];
    const newSpec = SPECIALIZATIONS[specId];
    
    setMarketState(prev => ({
      ...prev,
      playerSpecialization: specId
    }));
    
    if (prevSpec.id !== specId) {
      addNews(`Now specializing in ${newSpec.name}!`, NEWS_TYPES.GENERAL);
    }
  }, [marketState.playerSpecialization, addNews]);

  // Get demand for a repair category
  const getCategoryDemand = useCallback((categoryId) => {
    if (categoryId) {
      return getEffectiveDemand(categoryId, marketState, marketState.activeEvent?.effects || {});
    }
    // Return all category demands as a dictionary
    const demands = {};
    Object.keys(REPAIR_CATEGORIES).forEach(catId => {
      demands[catId] = getEffectiveDemand(catId, marketState, marketState.activeEvent?.effects || {});
    });
    return demands;
  }, [marketState]);

  // Get price for a repair category
  const getCategoryPrice = useCallback((categoryId) => {
    const cat = REPAIR_CATEGORIES[categoryId];
    if (!cat) return 100;
    
    const tier = marketState.playerPricing[categoryId] || 'normal';
    return getEffectivePrice(categoryId, cat.basePrice, tier, marketState.activeEvent?.effects || {});
  }, [marketState]);

  // Get specialization bonus
  const getSpecializationBonus = useCallback((categoryId) => {
    const spec = SPECIALIZATIONS[marketState.playerSpecialization];
    if (!spec || spec.id === 'none') return 1.0;
    
    if (spec.bonus[categoryId]) return spec.bonus[categoryId];
    if (spec.bonus.all) return spec.bonus.all;
    return 1.0;
  }, [marketState.playerSpecialization]);

  // Get pricing tier effect
  const getPricingEffect = useCallback((categoryId) => {
    const tier = marketState.playerPricing[categoryId] || 'normal';
    return PRICING_TIERS[tier] || PRICING_TIERS.normal;
  }, [marketState.playerPricing]);

  // Calculate effective customer attraction
  const getCustomerAttraction = useCallback(() => {
    let attraction = (gameState.reputation / 50) * (gameState.shopLevel * 0.5 + 1);
    
    // Average pricing bonus
    const avgTier = Object.values(marketState.playerPricing).reduce((a, b) => {
      return a + (PRICING_TIERS[b]?.demandBonus || 1);
    }, 0) / Object.keys(marketState.playerPricing).length;
    attraction *= avgTier;
    
    // Marketing bonus
    if (gameState.hiredAssistants?.includes('marketing_guru')) {
      attraction *= 1.15;
    }
    
    // Total demand modifier
    if (marketState.totalDemand) {
      attraction *= marketState.totalDemand;
    }
    
    return attraction;
  }, [gameState, marketState]);

  // Dismiss news popup
  const dismissNews = useCallback(() => {
    setShowNewsPopup(false);
  }, []);

  // Reset market state
  const resetMarket = useCallback(() => {
    setMarketState({
      ...defaultState,
      competitors: initializeCompetitors()
    });
  }, []);

  // Get competitor by ID
  const getCompetitor = useCallback((id) => {
    return marketState.competitors.find(c => c.id === id);
  }, [marketState.competitors]);

  // Get market summary
  const getMarketSummary = useCallback(() => {
    return {
      currentDay: marketState.currentDay,
      marketShare: marketState.playerMarketShare,
      ranking: marketState.playerRanking,
      marketGrowth: marketState.marketGrowth,
      activeEvent: marketState.activeEvent,
      totalCompetitors: marketState.competitors.length,
      averageCompetitorRep: Math.round(
        marketState.competitors.reduce((sum, c) => sum + c.reputation, 0) / (marketState.competitors.length || 1)
      )
    };
  }, [marketState]);

  return {
    // State
    marketState,
    
    // Actions
    runDailySimulation,
    advanceDay,
    setPricing,
    setSpecialization,
    addNews,
    resetMarket,
    
    // Getters
    getCategoryDemand,
    getCategoryPrice,
    getSpecializationBonus,
    getPricingEffect,
    getCustomerAttraction,
    getCompetitor,
    getMarketSummary,
    
    // News
    showNewsPopup,
    newNews,
    dismissNews,
    
    // Constants
    REPAIR_CATEGORIES,
    PRICING_TIERS,
    SPECIALIZATIONS
  };
}
