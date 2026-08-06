// Dynamic Market, Competitors & Living Economy System

// Repair Categories
export const REPAIR_CATEGORIES = {
  cpu: {
    id: 'cpu',
    name: 'CPU',
    icon: '🔲',
    baseDemand: 15,
    basePrice: 180,
    difficulty: 2
  },
  gpu: {
    id: 'gpu',
    name: 'GPU',
    icon: '🎮',
    baseDemand: 20,
    basePrice: 220,
    difficulty: 3
  },
  storage: {
    id: 'storage',
    name: 'Storage',
    icon: '💾',
    baseDemand: 25,
    basePrice: 120,
    difficulty: 1
  },
  virus: {
    id: 'virus',
    name: 'Security',
    icon: '🦠',
    baseDemand: 30,
    basePrice: 80,
    difficulty: 1
  },
  cooling: {
    id: 'cooling',
    name: 'Cooling',
    icon: '🌀',
    baseDemand: 20,
    basePrice: 90,
    difficulty: 1
  },
  general: {
    id: 'general',
    name: 'General',
    icon: '🔧',
    baseDemand: 35,
    basePrice: 100,
    difficulty: 1
  }
};

// Competitor Templates
export const COMPETITOR_TEMPLATES = [
  {
    id: 'techfix_pro',
    name: 'TechFix Pro',
    icon: '🏢',
    strategy: 'premium',
    baseLevel: 4,
    baseReputation: 75,
    baseMarketShare: 22,
    specialization: 'gpu',
    marketingLevel: 2,
    employeeCount: 2
  },
  {
    id: 'budget_pc',
    name: 'Budget PC Center',
    icon: '💰',
    strategy: 'budget',
    baseLevel: 3,
    baseReputation: 55,
    baseMarketShare: 18,
    specialization: 'storage',
    marketingLevel: 1,
    employeeCount: 1
  },
  {
    id: 'pc_rescue',
    name: 'PC Rescue',
    icon: '🛟',
    strategy: 'specialist',
    baseLevel: 3,
    baseReputation: 68,
    baseMarketShare: 15,
    specialization: 'virus',
    marketingLevel: 1,
    employeeCount: 2
  },
  {
    id: 'cybercare',
    name: 'CyberCare',
    icon: '🔒',
    strategy: 'specialist',
    baseLevel: 5,
    baseReputation: 80,
    baseMarketShare: 20,
    specialization: 'security',
    marketingLevel: 3,
    employeeCount: 3
  },
  {
    id: 'quickrepair',
    name: 'QuickRepair',
    icon: '⚡',
    strategy: 'automation',
    baseLevel: 2,
    baseReputation: 50,
    baseMarketShare: 12,
    specialization: null,
    marketingLevel: 2,
    employeeCount: 1
  },
  {
    id: 'tech_express',
    name: 'Tech Express',
    icon: '🚀',
    strategy: 'marketing',
    baseLevel: 3,
    baseReputation: 60,
    baseMarketShare: 16,
    specialization: null,
    marketingLevel: 4,
    employeeCount: 2
  }
];

// Strategy definitions
export const STRATEGIES = {
  budget: {
    id: 'budget',
    name: 'Budget',
    description: 'Low prices, high volume',
    priceMultiplier: 0.75,
    volumeBonus: 1.3,
    reputationGrowth: 0.8,
    customerRequirement: 0.6
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'High prices, high reputation',
    priceMultiplier: 1.35,
    volumeBonus: 0.7,
    reputationGrowth: 1.2,
    customerRequirement: 1.2
  },
  specialist: {
    id: 'specialist',
    name: 'Specialist',
    description: 'Focus on specific repairs',
    priceMultiplier: 1.1,
    volumeBonus: 0.9,
    reputationGrowth: 1.0,
    customerRequirement: 1.0,
    specializationBonus: 1.5
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Aggressive marketing focus',
    priceMultiplier: 1.0,
    volumeBonus: 1.2,
    reputationGrowth: 0.9,
    customerRequirement: 0.9,
    marketingBonus: 1.5
  },
  automation: {
    id: 'automation',
    name: 'Automation',
    description: 'Efficient, low overhead',
    priceMultiplier: 0.9,
    volumeBonus: 1.1,
    reputationGrowth: 0.95,
    customerRequirement: 0.8,
    idleBonus: 1.4
  }
};

// Market Events
export const MARKET_EVENTS = [
  {
    id: 'gpu_shortage',
    name: 'GPU Shortage',
    description: 'Graphics card supply issues',
    duration: 7,
    effects: {
      categoryDemand: { gpu: 1.3 },
      categoryPrice: { gpu: 1.35 }
    },
    news: 'GPU supply shortage causing prices to surge'
  },
  {
    id: 'school_season',
    name: 'School Season',
    description: 'Students need laptop repairs',
    duration: 14,
    effects: {
      categoryDemand: { storage: 1.25, general: 1.15 }
    },
    news: 'School season driving laptop repair demand'
  },
  {
    id: 'gaming_boom',
    name: 'Gaming Boom',
    description: 'PC gaming popularity surge',
    duration: 10,
    effects: {
      categoryDemand: { gpu: 1.35, cpu: 1.2, cooling: 1.15 }
    },
    news: 'PC gaming boom increasing component repairs'
  },
  {
    id: 'security_wave',
    name: 'Security Wave',
    description: 'Virus outbreak awareness',
    duration: 8,
    effects: {
      categoryDemand: { virus: 1.5 }
    },
    news: 'Security concerns driving virus scan demand'
  },
  {
    id: 'economic_slowdown',
    name: 'Economic Slowdown',
    description: 'Customers cutting spending',
    duration: 12,
    effects: {
      totalDemand: 0.85,
      priceSensitivity: 1.3
    },
    news: 'Economic downturn reducing repair spending'
  },
  {
    id: 'tech_expo',
    name: 'Tech Expo Week',
    description: 'Technology showcase event',
    duration: 5,
    effects: {
      totalDemand: 1.25,
      reputationGrowth: 1.2
    },
    news: 'Tech expo driving technology awareness'
  },
  {
    id: 'supply_glut',
    name: 'Supply Glut',
    description: 'Parts oversupply',
    duration: 10,
    effects: {
      categoryPrice: { gpu: 0.8, cpu: 0.85, storage: 0.75 }
    },
    news: 'Parts oversupply driving prices down'
  },
  {
    id: 'competitor_expansion',
    name: 'Competitor Expansion',
    description: 'Rival opens new location',
    duration: 0,
    effects: {
      competitorBoost: 1.2
    },
    news: 'Competitor opening new location nearby'
  }
];

// Pricing Tiers
export const PRICING_TIERS = {
  low: {
    id: 'low',
    name: 'Budget',
    multiplier: 0.7,
    demandBonus: 1.4,
    reputationPenalty: -2,
    description: '-30% prices, +40% demand, -2 rep/repair'
  },
  normal: {
    id: 'normal',
    name: 'Standard',
    multiplier: 1.0,
    demandBonus: 1.0,
    reputationPenalty: 0,
    description: 'Market average prices'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    multiplier: 1.4,
    demandBonus: 0.6,
    reputationPenalty: 3,
    description: '+40% prices, -40% demand, +3 rep/repair'
  }
};

// Specialization Options
export const SPECIALIZATIONS = {
  none: {
    id: 'none',
    name: 'General',
    icon: '🔧',
    bonus: { all: 1.0 },
    description: 'No specialization'
  },
  gpu: {
    id: 'gpu',
    name: 'GPU Specialist',
    icon: '🎮',
    bonus: { gpu: 1.25, cpu: 1.1 },
    description: '+25% GPU, +10% CPU success'
  },
  storage: {
    id: 'storage',
    name: 'Storage Expert',
    icon: '💾',
    bonus: { storage: 1.25, general: 1.1 },
    description: '+25% Storage, +10% General success'
  },
  virus: {
    id: 'virus',
    name: 'Security Expert',
    icon: '🦠',
    bonus: { virus: 1.25, cooling: 1.1 },
    description: '+25% Virus, +10% Cooling success'
  },
  cooling: {
    id: 'cooling',
    name: 'Cooling Specialist',
    icon: '🌀',
    bonus: { cooling: 1.25, cpu: 1.1 },
    description: '+25% Cooling, +10% CPU success'
  },
  performance: {
    id: 'performance',
    name: 'Performance Pro',
    icon: '⚡',
    bonus: { cpu: 1.2, gpu: 1.2, cooling: 1.15 },
    description: '+20% CPU/GPU, +15% Cooling'
  }
};

// News Types
export const NEWS_TYPES = {
  DEMAND_CHANGE: 'demand_change',
  PRICE_CHANGE: 'price_change',
  COMPETITOR_ACTION: 'competitor_action',
  MARKET_EVENT: 'market_event',
  PLAYER_ACHIEVEMENT: 'player_achievement',
  GENERAL: 'general'
};

// Helper: Calculate market share
export function calculateMarketShare(playerReputation, playerLevel, playerPrice, competitorCount = 5) {
  const baseShare = 15; // Player starts at 15%
  const repBonus = (playerReputation - 50) * 0.15;
  const levelBonus = playerLevel * 1.5;
  
  // Price factor (market avg is 1.0)
  const priceFactor = playerPrice > 1.1 ? -3 : playerPrice < 0.9 ? 2 : 0;
  
  const rawShare = baseShare + repBonus + levelBonus + priceFactor;
  return Math.max(5, Math.min(35, rawShare));
}

// Helper: Calculate customer attraction
export function calculateCustomerAttraction(playerState, marketState) {
  const {
    reputation,
    shopLevel,
    pricingTier,
    specialization,
    hiredAssistants
  } = playerState;
  
  const { categoryDemand, totalDemand } = marketState;
  
  // Base attraction from reputation
  let attraction = (reputation / 50) * (shopLevel * 0.5 + 1);
  
  // Pricing tier bonus
  const tier = PRICING_TIERS[pricingTier];
  attraction *= tier.demandBonus;
  
  // Specialization bonus for relevant categories
  if (specialization && specialization !== 'none') {
    const spec = SPECIALIZATIONS[specialization];
    Object.keys(spec.bonus).forEach(cat => {
      if (categoryDemand[cat]) {
        attraction *= spec.bonus[cat];
      }
    });
  }
  
  // Assistant bonus (marketing guru)
  if (hiredAssistants?.includes('marketing_guru')) {
    attraction *= 1.15;
  }
  
  // Total market demand modifier
  attraction *= (totalDemand || 1.0);
  
  return attraction;
}

// Helper: Get effective category demand
export function getEffectiveDemand(categoryId, marketState, eventEffects = {}) {
  const category = REPAIR_CATEGORIES[categoryId];
  if (!category) return 0;
  
  let demand = category.baseDemand;
  
  // Apply market category demand
  if (marketState.categoryDemand?.[categoryId]) {
    demand *= marketState.categoryDemand[categoryId];
  }
  
  // Apply event effects
  if (eventEffects.categoryDemand?.[categoryId]) {
    demand *= eventEffects.categoryDemand[categoryId];
  }
  
  // Apply total demand modifier
  if (marketState.totalDemand) {
    demand *= marketState.totalDemand;
  }
  if (eventEffects.totalDemand) {
    demand *= eventEffects.totalDemand;
  }
  
  return Math.round(demand);
}

// Helper: Get effective price for category
export function getEffectivePrice(categoryId, basePrice, pricingTier, eventEffects = {}) {
  let price = basePrice;
  
  // Apply pricing tier
  const tier = PRICING_TIERS[pricingTier];
  price *= tier.multiplier;
  
  // Apply event effects
  if (eventEffects.categoryPrice?.[categoryId]) {
    price *= eventEffects.categoryPrice[categoryId];
  }
  
  return Math.round(price);
}

// Default market state
export const DEFAULT_MARKET_STATE = {
  currentDay: 1,
  totalMarketCustomers: 0,
  categoryDemand: {
    cpu: 1.0,
    gpu: 1.0,
    storage: 1.0,
    virus: 1.0,
    cooling: 1.0,
    general: 1.0
  },
  averagePrice: 1.0,
  totalDemand: 1.0,
  marketGrowth: 0,
  activeEvent: null,
  eventDaysRemaining: 0,
  news: [],
  competitors: [],
  playerMarketShare: 15,
  playerRanking: 4
};

// Initialize competitors
export function initializeCompetitors() {
  return COMPETITOR_TEMPLATES.map(template => ({
    ...template,
    level: template.baseLevel,
    reputation: template.baseReputation,
    marketShare: template.baseMarketShare,
    money: template.baseLevel * 5000,
    lastMarketing: 0,
    recentPerformance: []
  }));
}
