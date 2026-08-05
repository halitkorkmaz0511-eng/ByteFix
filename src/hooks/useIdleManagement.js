import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  assistants, 
  marketingCampaigns, 
  premiumServices,
  achievements,
  calculateOfflineEarnings,
  checkAchievement,
  calculateTotalDailyExpenses
} from '../data/idleSystem';

const STORAGE_KEY = 'bytefix_idle_save';

// Extended default state for idle/management features
const defaultIdleState = {
  // Idle earnings
  lastSaveTime: Date.now(),
  totalOfflineEarnings: 0,
  maxOfflineEarnings: 0,
  perfectRepairs: 0,
  maxCorrectStreak: 0,
  currentCorrectStreak: 0,
  totalCampaigns: 0,
  daysPlayed: new Set(),
  
  // Assistants
  hiredAssistants: [],
  assistantEfficiency: 1.0,
  
  // Marketing
  activeMarketing: null,
  marketingEndTime: 0,
  marketingCooldowns: {},
  
  // Premium services
  unlockedServices: [],
  
  // Achievements
  unlockedAchievements: [],
  
  // Daily tracking
  dailyEarnings: 0,
  dailyRepairs: 0,
  lastDayReset: Date.now(),
  
  // Business metrics
  totalTips: 0,
  averageRating: 0,
  
  // New hire bonus tracking
  assistantHiringBonuses: {}
};

export function useIdleManagement(gameState, addMoney, addXp, updateReputation) {
  const [idleState, setIdleState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle daysPlayed Set conversion
        if (parsed.daysPlayed && Array.isArray(parsed.daysPlayed)) {
          parsed.daysPlayed = new Set(parsed.daysPlayed);
        }
        return { ...defaultIdleState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load idle state:', e);
    }
    return defaultIdleState;
  });

  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState(null);
  
  const lastSaveRef = useRef(Date.now());

  // Save idle state
  useEffect(() => {
    try {
      const toSave = {
        ...idleState,
        daysPlayed: Array.from(idleState.daysPlayed || new Set())
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save idle state:', e);
    }
  }, [idleState]);

  // Check for offline earnings on mount
  useEffect(() => {
    const lastSave = idleState.lastSaveTime;
    const offline = calculateOfflineEarnings(gameState, lastSave);
    
    if (offline && offline.earnings > 0) {
      setOfflineEarnings(offline);
      setShowOfflinePopup(true);
    }
    
    // Update days played
    const today = new Date().toDateString();
    if (!idleState.daysPlayed.has(today)) {
      setIdleState(prev => ({
        ...prev,
        daysPlayed: new Set([...prev.daysPlayed, today])
      }));
    }
  }, []);

  // Collect offline earnings
  const collectOfflineEarnings = useCallback(() => {
    if (!offlineEarnings) return;
    
    addMoney(offlineEarnings.earnings);
    
    setIdleState(prev => ({
      ...prev,
      lastSaveTime: Date.now(),
      totalOfflineEarnings: prev.totalOfflineEarnings + offlineEarnings.earnings,
      maxOfflineEarnings: Math.max(prev.maxOfflineEarnings, offlineEarnings.earnings)
    }));
    
    setShowOfflinePopup(false);
    setOfflineEarnings(null);
    
    // Check for idle master achievement
    checkAndUnlockAchievement('idle_master');
  }, [offlineEarnings, addMoney]);

  // Dismiss offline popup without collecting
  const dismissOfflinePopup = useCallback(() => {
    setIdleState(prev => ({ ...prev, lastSaveTime: Date.now() }));
    setShowOfflinePopup(false);
    setOfflineEarnings(null);
  }, []);

  // Hire assistant
  const hireAssistant = useCallback((assistantId) => {
    const assistant = assistants[assistantId];
    if (!assistant) return false;
    
    if (gameState.money < assistant.cost) return false;
    if (idleState.hiredAssistants.includes(assistantId)) return false;
    
    addMoney(-assistant.cost);
    
    setIdleState(prev => ({
      ...prev,
      hiredAssistants: [...prev.hiredAssistants, assistantId],
      assistantEfficiency: Math.min(2.0, prev.assistantEfficiency + 0.15)
    }));
    
    // Check team leader achievement
    checkAndUnlockAchievement('team_leader');
    
    return true;
  }, [gameState.money, idleState.hiredAssistants, addMoney]);

  // Fire assistant
  const fireAssistant = useCallback((assistantId) => {
    setIdleState(prev => ({
      ...prev,
      hiredAssistants: prev.hiredAssistants.filter(id => id !== assistantId)
    }));
  }, []);

  // Start marketing campaign
  const startMarketing = useCallback((campaignId) => {
    const campaign = marketingCampaigns[campaignId];
    if (!campaign) return false;
    
    // Check cooldown
    const cooldown = idleState.marketingCooldowns[campaignId] || 0;
    if (Date.now() < cooldown) return false;
    
    if (gameState.money < campaign.cost) return false;
    
    addMoney(-campaign.cost);
    
    const endTime = Date.now() + campaign.duration;
    
    setIdleState(prev => ({
      ...prev,
      activeMarketing: { id: campaignId, endTime },
      marketingEndTime: endTime,
      totalCampaigns: prev.totalCampaigns + 1,
      marketingCooldowns: {
        ...prev.marketingCooldowns,
        [campaignId]: endTime + campaign.cooldown
      }
    }));
    
    return true;
  }, [gameState.money, idleState.marketingCooldowns, addMoney]);

  // Check and unlock achievements
  const checkAndUnlockAchievement = useCallback((achievementId) => {
    const achievement = achievements[achievementId];
    if (!achievement) return false;
    if (idleState.unlockedAchievements.includes(achievementId)) return false;
    
    if (checkAchievement(achievement, gameState)) {
      setIdleState(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId]
      }));
      
      // Give rewards
      if (achievement.reward.money) addMoney(achievement.reward.money);
      if (achievement.reward.xp) addXp(achievement.reward.xp);
      if (achievement.reward.reputation) updateReputation(achievement.reward.reputation);
      
      setPendingAchievement(achievement);
      return true;
    }
    return false;
  }, [idleState.unlockedAchievements, gameState, addMoney, addXp, updateReputation]);

  // Check all achievements
  const checkAllAchievements = useCallback(() => {
    Object.keys(achievements).forEach(id => {
      checkAndUnlockAchievement(id);
    });
  }, [checkAndUnlockAchievement]);

  // Dismiss achievement popup
  const dismissAchievement = useCallback(() => {
    setPendingAchievement(null);
  }, []);

  // Record perfect repair
  const recordPerfectRepair = useCallback(() => {
    setIdleState(prev => ({
      ...prev,
      perfectRepairs: prev.perfectRepairs + 1,
      currentCorrectStreak: prev.currentCorrectStreak + 1,
      maxCorrectStreak: Math.max(prev.maxCorrectStreak, prev.currentCorrectStreak + 1)
    }));
    checkAndUnlockAchievement('perfect_repair');
    checkAndUnlockAchievement('no_mistakes');
  }, [checkAndUnlockAchievement]);

  // Record wrong answer (breaks streak)
  const recordWrongAnswer = useCallback(() => {
    setIdleState(prev => ({
      ...prev,
      currentCorrectStreak: 0
    }));
  }, []);

  // Record tip
  const recordTip = useCallback((amount) => {
    setIdleState(prev => ({
      ...prev,
      totalTips: prev.totalTips + amount
    }));
  }, []);

  // Get assistant effects
  const getAssistantEffects = useCallback(() => {
    const effects = {
      patienceMultiplier: 1.0,
      autoRepairChance: 0,
      customerBoost: 1.0,
      tipBonus: 0
    };
    
    idleState.hiredAssistants.forEach(id => {
      const assistant = assistants[id];
      if (!assistant) return;
      
      if (assistant.effect.type === 'patience_bonus') {
        effects.patienceMultiplier *= assistant.effect.value;
      }
      if (assistant.effect.autoRepairChance) {
        effects.autoRepairChance += assistant.effect.autoRepairChance;
      }
      if (assistant.effect.type === 'customer_boost') {
        effects.customerBoost *= assistant.effect.value;
      }
      if (assistant.effect.tipChance) {
        effects.tipBonus += assistant.effect.tipChance;
      }
    });
    
    return effects;
  }, [idleState.hiredAssistants]);

  // Get marketing effect
  const getMarketingEffect = useCallback(() => {
    if (!idleState.activeMarketing) return null;
    if (Date.now() > idleState.marketingEndTime) return null;
    
    const campaign = marketingCampaigns[idleState.activeMarketing.id];
    return campaign ? campaign.effect : null;
  }, [idleState.activeMarketing, idleState.marketingEndTime]);

  // Get daily expenses
  const getDailyExpenses = useCallback(() => {
    return calculateTotalDailyExpenses(gameState.shopLevel, idleState.hiredAssistants);
  }, [gameState.shopLevel, idleState.hiredAssistants]);

  // Calculate effective customer patience
  const getEffectivePatience = useCallback((basePatience) => {
    const effects = getAssistantEffects();
    return Math.floor(basePatience * effects.patienceMultiplier);
  }, [getAssistantEffects]);

  // Update save time periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setIdleState(prev => ({ ...prev, lastSaveTime: Date.now() }));
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, []);

  // Update last save time on unmount
  useEffect(() => {
    return () => {
      setIdleState(prev => ({ ...prev, lastSaveTime: Date.now() }));
    };
  }, []);

  // Reset idle state
  const resetIdleState = useCallback(() => {
    setIdleState({ ...defaultIdleState, lastSaveTime: Date.now() });
  }, []);

  return {
    idleState,
    offlineEarnings,
    showOfflinePopup,
    pendingAchievement,
    
    // Actions
    collectOfflineEarnings,
    dismissOfflinePopup,
    hireAssistant,
    fireAssistant,
    startMarketing,
    checkAndUnlockAchievement,
    checkAllAchievements,
    dismissAchievement,
    recordPerfectRepair,
    recordWrongAnswer,
    recordTip,
    resetIdleState,
    
    // Getters
    getAssistantEffects,
    getMarketingEffect,
    getDailyExpenses,
    getEffectivePatience
  };
}
