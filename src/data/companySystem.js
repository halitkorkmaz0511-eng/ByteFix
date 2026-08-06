// Company Progression, Expansion & Strategy System

// Company Tiers
export const COMPANY_TIERS = {
  1: {
    id: 1,
    name: 'Small Repair Shop',
    icon: '🏪',
    requirements: {
      shopLevel: 1,
      reputation: 20,
      totalRepairs: 10,
      companyValue: 500
    },
    benefits: {
      maxBranches: 1,
      baseRent: 50
    }
  },
  2: {
    id: 2,
    name: 'Established Workshop',
    icon: '🔧',
    requirements: {
      shopLevel: 2,
      reputation: 35,
      totalRepairs: 50,
      companyValue: 5000
    },
    benefits: {
      maxBranches: 1,
      baseRent: 100
    }
  },
  3: {
    id: 3,
    name: 'Local PC Business',
    icon: '🏢',
    requirements: {
      shopLevel: 3,
      reputation: 50,
      totalRepairs: 150,
      companyValue: 20000
    },
    benefits: {
      maxBranches: 2,
      baseRent: 200
    }
  },
  4: {
    id: 4,
    name: 'Regional Tech Company',
    icon: '🌐',
    requirements: {
      shopLevel: 4,
      reputation: 65,
      totalRepairs: 400,
      companyValue: 75000
    },
    benefits: {
      maxBranches: 3,
      baseRent: 400
    }
  },
  5: {
    id: 5,
    name: 'Major Tech Company',
    icon: '🏛️',
    requirements: {
      shopLevel: 5,
      reputation: 80,
      totalRepairs: 1000,
      companyValue: 200000
    },
    benefits: {
      maxBranches: 5,
      baseRent: 800
    }
  },
  6: {
    id: 6,
    name: 'Technology Empire',
    icon: '👑',
    requirements: {
      shopLevel: 6,
      reputation: 90,
      totalRepairs: 2500,
      companyValue: 500000
    },
    benefits: {
      maxBranches: 8,
      baseRent: 1500
    }
  }
};

// Locations for branches
export const LOCATIONS = {
  downtown: {
    id: 'downtown',
    name: 'Downtown',
    icon: '🏙️',
    description: 'High foot traffic, business customers',
    characteristics: {
      customerDemand: 1.3,
      avgRepairValue: 1.2,
      rent: 1.5,
      competition: 1.2
    },
    specializations: ['business', 'general'],
    unlockCost: 15000
  },
  university: {
    id: 'university',
    name: 'University District',
    icon: '🎓',
    description: 'Students need laptop repairs',
    characteristics: {
      customerDemand: 1.2,
      avgRepairValue: 0.85,
      rent: 1.1,
      competition: 0.9
    },
    specializations: ['laptop', 'storage'],
    unlockCost: 10000
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Zone',
    icon: '🏭',
    description: 'Heavy equipment, factories',
    characteristics: {
      customerDemand: 0.9,
      avgRepairValue: 1.4,
      rent: 0.8,
      competition: 0.7
    },
    specializations: ['hardware', 'power'],
    unlockCost: 12000
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming District',
    icon: '🎮',
    description: 'PC gamers everywhere',
    characteristics: {
      customerDemand: 1.4,
      avgRepairValue: 1.5,
      rent: 1.8,
      competition: 1.4
    },
    specializations: ['gpu', 'cooling', 'cpu'],
    unlockCost: 25000
  },
  residential: {
    id: 'residential',
    name: 'Residential Area',
    icon: '🏠',
    description: 'Families and home users',
    characteristics: {
      customerDemand: 1.1,
      avgRepairValue: 0.75,
      rent: 0.7,
      competition: 0.8
    },
    specializations: ['general', 'virus'],
    unlockCost: 8000
  },
  business: {
    id: 'business',
    name: 'Business District',
    icon: '💼',
    description: 'Corporate clients, volume work',
    characteristics: {
      customerDemand: 1.0,
      avgRepairValue: 1.6,
      rent: 2.0,
      competition: 1.0
    },
    specializations: ['server', 'network'],
    unlockCost: 30000
  }
};

// Company-wide Upgrades
export const COMPANY_UPGRADES = {
  central_purchasing: {
    id: 'central_purchasing',
    name: 'Central Purchasing',
    icon: '📦',
    description: 'Bulk buying reduces parts costs by 10%',
    cost: 25000,
    effect: { partsDiscount: 0.1 },
    tier: 3
  },
  training_program: {
    id: 'training_program',
    name: 'Training Program',
    icon: '📚',
    description: 'All employees 15% more efficient',
    cost: 35000,
    effect: { employeeEfficiency: 0.15 },
    tier: 3
  },
  brand_development: {
    id: 'brand_development',
    name: 'Brand Development',
    icon: '📣',
    description: 'Reputation gains increased by 25%',
    cost: 30000,
    effect: { reputationGain: 0.25 },
    tier: 3
  },
  accounting_dept: {
    id: 'accounting_dept',
    name: 'Accounting Department',
    icon: '📊',
    description: 'Operating costs reduced by 10%',
    cost: 40000,
    effect: { operatingCostReduction: 0.1 },
    tier: 4
  },
  logistics_network: {
    id: 'logistics_network',
    name: 'Logistics Network',
    icon: '🚚',
    description: 'Supplier deliveries 1 day faster',
    cost: 50000,
    effect: { deliverySpeed: 1 },
    tier: 4
  },
  automation_platform: {
    id: 'automation_platform',
    name: 'Automation Platform',
    icon: '🤖',
    description: 'Idle earnings increased by 50%',
    cost: 75000,
    effect: { idleEarningsBonus: 0.5 },
    tier: 5
  },
  research_lab: {
    id: 'research_lab',
    name: 'Research Lab',
    icon: '🔬',
    description: 'Unlock advanced repair types',
    cost: 100000,
    effect: { advancedRepairs: true },
    tier: 5
  },
  franchise_rights: {
    id: 'franchise_rights',
    name: 'Franchise Rights',
    icon: '🏬',
    description: 'Branches are 25% more profitable',
    cost: 150000,
    effect: { branchProfitBoost: 0.25 },
    tier: 6
  }
};

// Company Milestones
export const COMPANY_MILESTONES = [
  {
    id: 'first_repair',
    name: 'First Repair',
    description: 'Complete your first repair',
    icon: '🔧',
    condition: (stats) => stats.totalRepairs >= 1,
    reward: { money: 50 }
  },
  {
    id: 'ten_repairs',
    name: 'Apprentice Technician',
    description: 'Complete 10 repairs',
    icon: '🛠️',
    condition: (stats) => stats.totalRepairs >= 10,
    reward: { xp: 100 }
  },
  {
    id: 'fifty_repairs',
    name: 'Journeyman Technician',
    description: 'Complete 50 repairs',
    icon: '⚙️',
    condition: (stats) => stats.totalRepairs >= 50,
    reward: { reputation: 5 }
  },
  {
    id: 'hundred_repairs',
    name: 'Master Technician',
    description: 'Complete 100 repairs',
    icon: '🏆',
    condition: (stats) => stats.totalRepairs >= 100,
    reward: { money: 500 }
  },
  {
    id: 'first_thousand',
    name: 'Century Club',
    description: 'Complete 1,000 repairs',
    icon: '💯',
    condition: (stats) => stats.totalRepairs >= 1000,
    reward: { money: 5000, reputation: 10 }
  },
  {
    id: 'first_branch',
    name: 'Expansion Ready',
    description: 'Open your first branch',
    icon: '🏪',
    condition: (stats) => stats.totalBranches >= 2,
    reward: { money: 1000 }
  },
  {
    id: 'multi_location',
    name: 'Chain Owner',
    description: 'Own 3 locations',
    icon: '🏢',
    condition: (stats) => stats.totalBranches >= 3,
    reward: { reputation: 15, money: 3000 }
  },
  {
    id: 'value_10k',
    name: 'Valuable Business',
    description: 'Reach $10,000 company value',
    icon: '💰',
    condition: (stats) => stats.companyValue >= 10000,
    reward: { money: 500 }
  },
  {
    id: 'value_50k',
    name: 'Growing Enterprise',
    description: 'Reach $50,000 company value',
    icon: '📈',
    condition: (stats) => stats.companyValue >= 50000,
    reward: { money: 2500 }
  },
  {
    id: 'value_100k',
    name: 'Million Dollar Dreams',
    description: 'Reach $100,000 company value',
    icon: '💎',
    condition: (stats) => stats.companyValue >= 100000,
    reward: { money: 10000 }
  },
  {
    id: 'market_leader',
    name: 'Market Leader',
    description: 'Reach #1 in market ranking',
    icon: '👑',
    condition: (stats) => stats.marketRanking === 1,
    reward: { reputation: 25, money: 5000 }
  },
  {
    id: 'rep_50',
    name: 'Trusted Name',
    description: 'Reach 50 reputation',
    icon: '⭐',
    condition: (stats) => stats.reputation >= 50,
    reward: { money: 1000 }
  },
  {
    id: 'rep_75',
    name: 'Highly Recommended',
    description: 'Reach 75 reputation',
    icon: '🌟',
    condition: (stats) => stats.reputation >= 75,
    reward: { money: 2500 }
  },
  {
    id: 'rep_90',
    name: 'Industry Legend',
    description: 'Reach 90 reputation',
    icon: '✨',
    condition: (stats) => stats.reputation >= 90,
    reward: { money: 10000 }
  },
  {
    id: 'first_million',
    name: 'Six Figure Revenue',
    description: 'Earn $1,000,000 total revenue',
    icon: '💵',
    condition: (stats) => stats.totalRevenue >= 1000000,
    reward: { money: 25000 }
  }
];

// Business Strategy Types (detected from playstyle)
export const BUSINESS_STRATEGIES = {
  budget: {
    id: 'budget',
    name: 'Budget Master',
    icon: '💲',
    description: 'Low prices, high volume',
    metrics: {
      avgPriceRatio: '< 0.85',
      repairVolume: '> 50'
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium Provider',
    icon: '💎',
    description: 'High prices, quality focus',
    metrics: {
      avgPriceRatio: '> 1.2',
      repGain: '> 2/repair'
    }
  },
  specialist: {
    id: 'specialist',
    name: 'Specialist',
    icon: '🎯',
    description: 'Focused expertise',
    metrics: {
      specializationLevel: '> 0.7'
    }
  },
  automation: {
    id: 'automation',
    name: 'Automation Pro',
    icon: '🤖',
    description: 'Efficient idle operation',
    metrics: {
      idleEfficiency: '> 0.8',
      employeeCount: '> 3'
    }
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Guru',
    icon: '📣',
    description: 'Aggressive growth',
    metrics: {
      marketingSpend: '> 20%',
      customerGrowth: '> 10%'
    }
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced Growth',
    icon: '⚖️',
    description: 'Well-rounded approach',
    metrics: {}
  }
};

// Calculate company tier from stats
export function calculateCompanyTier(stats) {
  let currentTier = 1;
  
  for (let i = 6; i >= 1; i--) {
    const tier = COMPANY_TIERS[i];
    const meetsAll = Object.entries(tier.requirements).every(([key, value]) => {
      return stats[key] >= value;
    });
    
    if (meetsAll) {
      currentTier = i;
      break;
    }
  }
  
  return COMPANY_TIERS[currentTier];
}

// Calculate company value
export function calculateCompanyValue(companyData, inventoryValue = 0) {
  const {
    cash,
    shopLevel,
    upgrades = [],
    branches = [],
    reputation,
    marketShare,
    totalRevenue
  } = companyData;
  
  // Base value from cash
  let value = cash || 0;
  
  // Equipment value (based on shop level)
  value += shopLevel * 5000;
  
  // Inventory value
  value += inventoryValue;
  
  // Upgrade value
  const upgradeValue = upgrades.reduce((sum, id) => {
    const upgrade = COMPANY_UPGRADES[id];
    return sum + (upgrade?.cost || 0) * 0.5;
  }, 0);
  value += upgradeValue;
  
  // Branch value
  const branchValue = branches.reduce((sum, branch) => {
    return sum + branch.level * 3000 + (branch.inventoryValue || 0);
  }, 0);
  value += branchValue;
  
  // Reputation value
  value += reputation * 500;
  
  // Market share value
  value += marketShare * 2000;
  
  // Historical revenue (depreciated)
  value += Math.min(totalRevenue * 0.1, 100000);
  
  return Math.round(value);
}

// Detect player business strategy from metrics
export function detectBusinessStrategy(metrics) {
  const {
    avgPriceRatio = 1,
    repairVolume = 0,
    repGain = 0,
    specializationLevel = 0,
    idleEfficiency = 0,
    employeeCount = 0,
    marketingSpend = 0
  } = metrics;
  
  // Count strategy indicators
  const indicators = {
    budget: avgPriceRatio < 0.85 && repairVolume > 50,
    premium: avgPriceRatio > 1.2 && repGain > 2,
    specialist: specializationLevel > 0.7,
    automation: idleEfficiency > 0.8 && employeeCount > 3,
    marketing: marketingSpend > 0.2
  };
  
  // Find strongest match
  const matches = Object.entries(indicators).filter(([_, match]) => match);
  
  if (matches.length === 0) return BUSINESS_STRATEGIES.balanced;
  
  // Return the most significant strategy
  if (indicators.budget) return BUSINESS_STRATEGIES.budget;
  if (indicators.premium) return BUSINESS_STRATEGIES.premium;
  if (indicators.specialist) return BUSINESS_STRATEGIES.specialist;
  if (indicators.automation) return BUSINESS_STRATEGIES.automation;
  if (indicators.marketing) return BUSINESS_STRATEGIES.marketing;
  
  return BUSINESS_STRATEGIES.balanced;
}

// Default company state
export const DEFAULT_COMPANY_STATE = {
  tier: 1,
  companyValue: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  milestones: [],
  unlockedMilestones: [],
  branches: [], // Main shop is always branch 0
  upgrades: [],
  financials: {
    dailyRevenue: 0,
    dailyExpenses: 0,
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    history: []
  },
  strategyMetrics: {
    avgPriceRatio: 1,
    repairVolume: 0,
    repGain: 0,
    specializationLevel: 0,
    idleEfficiency: 0.5,
    employeeCount: 0,
    marketingSpend: 0
  },
  currentStrategy: 'balanced'
};

// Branch data template
export function createBranch(id, location, locationData) {
  return {
    id,
    location,
    locationName: locationData?.name || 'Unknown',
    level: 1,
    reputation: 20,
    customerDemand: locationData?.characteristics?.customerDemand || 1,
    avgRepairValue: locationData?.characteristics?.avgRepairValue || 1,
    rent: locationData?.characteristics?.rent || 1,
    competition: locationData?.characteristics?.competition || 1,
    expenses: 0,
    revenue: 0,
    activeRepairs: 0,
    inventoryValue: 0,
    lastActive: Date.now()
  };
}
