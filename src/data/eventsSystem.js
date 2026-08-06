// Special Customers, Contracts, Opportunities & Live Events System

// Special Customer Types
export const SPECIAL_CUSTOMER_TYPES = {
  vip: {
    id: 'vip',
    name: 'VIP Customer',
    icon: '⭐',
    color: '#f59e0b',
    paymentMultiplier: 1.8,
    patienceMultiplier: 0.6,
    reputationImpact: 1.5,
    frequency: 0.08,
    description: 'A high-value customer with higher expectations'
  },
  streamer: {
    id: 'streamer',
    name: 'Streamer',
    icon: '📺',
    color: '#8b5cf6',
    paymentMultiplier: 1.3,
    patienceMultiplier: 0.8,
    reputationImpact: 2.0,
    bonusEffect: 'streamBoost',
    frequency: 0.06,
    description: 'Your repair might get mentioned to thousands of viewers'
  },
  localBusiness: {
    id: 'localBusiness',
    name: 'Local Business Owner',
    icon: '👔',
    color: '#3b82f6',
    paymentMultiplier: 1.5,
    patienceMultiplier: 1.0,
    reputationImpact: 1.2,
    bonusEffect: 'offerContract',
    frequency: 0.05,
    description: 'May have business opportunities for you'
  },
  influencer: {
    id: 'influencer',
    name: 'Influencer',
    icon: '🌟',
    color: '#ec4899',
    paymentMultiplier: 1.4,
    patienceMultiplier: 0.7,
    reputationImpact: 2.5,
    frequency: 0.04,
    description: 'High social media reach - great for reputation'
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Customer',
    icon: '🚨',
    color: '#ef4444',
    paymentMultiplier: 2.5,
    patienceMultiplier: 0.3,
    reputationImpact: 1.0,
    frequency: 0.07,
    description: 'Needs help NOW - willing to pay premium'
  },
  returning: {
    id: 'returning',
    name: 'Returning Customer',
    icon: '🤝',
    color: '#22c55e',
    paymentMultiplier: 1.2,
    patienceMultiplier: 1.3,
    reputationImpact: 0.8,
    loyaltyBonus: true,
    frequency: 0.12,
    description: 'Remembers your good (or bad) service'
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate Client',
    icon: '🏢',
    color: '#1e40af',
    paymentMultiplier: 1.6,
    patienceMultiplier: 0.9,
    reputationImpact: 1.3,
    bonusEffect: 'volumeWork',
    frequency: 0.05,
    description: 'May have ongoing work for you'
  },
  student: {
    id: 'student',
    name: 'Budget Student',
    icon: '🎒',
    color: '#06b6d4',
    paymentMultiplier: 0.7,
    patienceMultiplier: 1.5,
    reputationImpact: 0.5,
    frequency: 0.15,
    description: 'Limited budget but patient and appreciative'
  }
};

// Contract Types
export const CONTRACT_TYPES = {
  school: {
    id: 'school',
    name: 'Educational Institution',
    icon: '🎓',
    color: '#3b82f6',
    clientType: 'institution',
    requirements: { repairs: 10, categories: ['general', 'virus', 'storage'] }
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming Cafe',
    icon: '🎮',
    color: '#8b5cf6',
    clientType: 'business',
    requirements: { repairs: 15, categories: ['gpu', 'cpu', 'cooling'] }
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate IT Support',
    icon: '💼',
    color: '#1e40af',
    clientType: 'corporate',
    requirements: { repairs: 20, categories: ['general', 'network', 'hardware'] }
  },
  hospital: {
    id: 'hospital',
    name: 'Medical Facility',
    icon: '🏥',
    color: '#dc2626',
    clientType: 'critical',
    requirements: { repairs: 12, categories: ['hardware', 'storage', 'general'], reputation: 60 }
  },
  retail: {
    id: 'retail',
    name: 'Retail Chain',
    icon: '🛒',
    color: '#059669',
    clientType: 'business',
    requirements: { repairs: 18, categories: ['general', 'virus'] }
  },
  realEstate: {
    id: 'realEstate',
    name: 'Real Estate Office',
    icon: '🏠',
    color: '#d97706',
    clientType: 'business',
    requirements: { repairs: 8, categories: ['general', 'network'] }
  },
  lawFirm: {
    id: 'lawFirm',
    name: 'Law Firm',
    icon: '⚖️',
    color: '#1f2937',
    clientType: 'corporate',
    requirements: { repairs: 10, categories: ['storage', 'hardware', 'security'], reputation: 70 }
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant Chain',
    icon: '🍽️',
    color: '#ea580c',
    clientType: 'business',
    requirements: { repairs: 14, categories: ['network', 'hardware', 'general'] }
  }
};

// Generate contract based on type and parameters
export function generateContract(typeId, difficulty = 1) {
  const type = CONTRACT_TYPES[typeId];
  if (!type) return null;
  
  const baseReward = {
    school: 4000,
    gaming: 7500,
    corporate: 12000,
    hospital: 9000,
    retail: 6000,
    realEstate: 3500,
    lawFirm: 11000,
    restaurant: 5500
  };
  
  const baseDuration = {
    school: 5,
    gaming: 6,
    corporate: 7,
    hospital: 5,
    retail: 5,
    realEstate: 4,
    lawFirm: 6,
    restaurant: 5
  };
  
  const baseRepairs = {
    school: 10,
    gaming: 15,
    corporate: 20,
    hospital: 12,
    retail: 18,
    realEstate: 8,
    lawFirm: 10,
    restaurant: 14
  };
  
  const reward = Math.round(baseReward[typeId] * (0.9 + difficulty * 0.2));
  const duration = Math.round(baseDuration[typeId] * (0.8 + difficulty * 0.3));
  const requiredRepairs = Math.round(baseRepairs[typeId] * (0.8 + difficulty * 0.4));
  
  return {
    id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    typeId,
    name: `${type.name} Contract`,
    icon: type.icon,
    color: type.color,
    clientType: type.clientType,
    reward,
    duration,
    requiredRepairs,
    completedRepairs: 0,
    startDay: 0,
    deadline: 0,
    status: 'available', // available, active, completed, expired, failed
    requirements: type.requirements,
    bonus: difficulty > 1 ? { reputation: 10, money: Math.round(reward * 0.2) } : null,
    difficulty,
    expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000 // Expires in 2 days if not accepted
  };
}

// Random Business Events
export const RANDOM_EVENTS = {
  equipmentFailure: {
    id: 'equipmentFailure',
    name: 'Equipment Failure',
    icon: '⚠️',
    color: '#ef4444',
    category: 'negative',
    description: 'One of your workshop tools has malfunctioned',
    effect: { workshopEfficiency: -0.25 },
    duration: 2, // days
    decision: true,
    choices: [
      { id: 'repair', label: 'Repair Equipment', cost: 1500, effect: { duration: 0 }, outcome: 'good' },
      { id: 'workaround', label: 'Work Around It', cost: 0, effect: { workshopEfficiency: -0.15 }, outcome: 'neutral' },
      { id: 'ignore', label: 'Ignore', cost: 0, effect: { workshopEfficiency: -0.25 }, outcome: 'bad' }
    ]
  },
  supplierDiscount: {
    id: 'supplierDiscount',
    name: 'Supplier Discount',
    icon: '💰',
    color: '#22c55e',
    category: 'positive',
    description: 'A supplier is offering a special discount',
    effect: { partsDiscount: 0.25 },
    duration: 2,
    decision: true,
    choices: [
      { id: 'accept', label: 'Accept Discount', cost: 0, effect: { partsDiscount: 0.25 }, outcome: 'good' },
      { id: 'decline', label: 'Decline', cost: 0, effect: {}, outcome: 'neutral' }
    ]
  },
  competitorPromotion: {
    id: 'competitorPromotion',
    name: 'Competitor Promotion',
    icon: '📢',
    color: '#f59e0b',
    category: 'threat',
    description: 'A competitor is running aggressive marketing',
    effect: { customerFlow: -0.15 },
    duration: 3,
    decision: true,
    choices: [
      { id: 'match', label: 'Match Their Offer', cost: 2000, effect: { customerFlow: 0.1 }, outcome: 'neutral' },
      { id: 'ignore', label: 'Stay Steady', cost: 0, effect: { customerFlow: -0.15 }, outcome: 'bad' },
      { id: 'double', label: 'Double Down', cost: 4000, effect: { customerFlow: 0.2, reputation: 5 }, outcome: 'good' }
    ]
  },
  demandSurge: {
    id: 'demandSurge',
    name: 'Unexpected Demand',
    icon: '📈',
    color: '#22c55e',
    category: 'opportunity',
    description: 'Demand for a repair type has surged!',
    effect: { categoryDemand: { category: 'random', multiplier: 1.5 } },
    duration: 3,
    decision: false
  },
  powerOutage: {
    id: 'powerOutage',
    name: 'Power Outage',
    icon: '⚡',
    color: '#ef4444',
    category: 'negative',
    description: 'A power outage has affected one of your branches',
    effect: { branchEfficiency: -0.5 },
    duration: 1,
    decision: true,
    choices: [
      { id: 'generator', label: 'Rent Generator', cost: 800, effect: { duration: 0 }, outcome: 'good' },
      { id: 'wait', label: 'Wait It Out', cost: 0, effect: { branchEfficiency: -0.5 }, outcome: 'bad' }
    ]
  },
  viralExposure: {
    id: 'viralExposure',
    name: 'Viral Exposure',
    icon: '🔥',
    color: '#f59e0b',
    category: 'opportunity',
    description: 'A customer shared their experience online!',
    effect: { reputation: 15, customerFlow: 0.2 },
    duration: 2,
    decision: false
  },
  supplierShortage: {
    id: 'supplierShortage',
    name: 'Supplier Shortage',
    icon: '📦',
    color: '#ef4444',
    category: 'threat',
    description: 'A key part is becoming hard to find',
    effect: { partAvailability: 'random', partCost: 0.3 },
    duration: 4,
    decision: true,
    choices: [
      { id: 'stockpile', label: 'Buy Emergency Stock', cost: 4000, effect: { partAvailability: 1 }, outcome: 'good' },
      { id: 'wait', label: 'Wait for Supply', cost: 0, effect: { partAvailability: 0.5 }, outcome: 'neutral' },
      { id: 'alternative', label: 'Find Alternative', cost: 1500, effect: { partAvailability: 0.8, partCost: 0.15 }, outcome: 'neutral' }
    ]
  },
  bulkOrder: {
    id: 'bulkOrder',
    name: 'Bulk Order Opportunity',
    icon: '📋',
    color: '#3b82f6',
    category: 'opportunity',
    description: 'Someone wants to place a large parts order',
    effect: { inventoryDiscount: 0.2 },
    duration: 2,
    decision: true,
    choices: [
      { id: 'accept', label: 'Accept Order', cost: 3000, effect: { inventoryDiscount: 0.2, parts: 20 }, outcome: 'good' },
      { id: 'counter', label: 'Negotiate', cost: 1000, effect: { inventoryDiscount: 0.15, parts: 15 }, outcome: 'neutral' },
      { id: 'decline', label: 'Decline', cost: 0, effect: {}, outcome: 'neutral' }
    ]
  },
  newPartnership: {
    id: 'newPartnership',
    name: 'New Partnership',
    icon: '🤝',
    color: '#22c55e',
    category: 'opportunity',
    description: 'A new supplier wants to work with you',
    effect: { supplierBonus: 'new', reputation: 5 },
    duration: 0,
    decision: true,
    choices: [
      { id: 'accept', label: 'Partner Up', cost: 0, effect: { supplierBonus: 'new', reputation: 5 }, outcome: 'good' },
      { id: 'decline', label: 'Keep Current', cost: 0, effect: {}, outcome: 'neutral' }
    ]
  },
  taxAudit: {
    id: 'taxAudit',
    name: 'Tax Notice',
    icon: '📄',
    color: '#f59e0b',
    category: 'threat',
    description: 'You need to pay some unexpected business taxes',
    effect: { expense: 2500 },
    duration: 3,
    decision: true,
    choices: [
      { id: 'pay', label: 'Pay Full Amount', cost: 2500, effect: {}, outcome: 'good' },
      { id: 'negotiate', label: 'Negotiate', cost: 500, effect: { expense: 1500 }, outcome: 'neutral' },
      { id: 'appeal', label: 'File Appeal (Risky)', cost: 200, effect: { expense: 0 }, risk: 0.5, outcome: 'random' }
    ]
  }
};

// Opportunities
export const OPPORTUNITY_TYPES = {
  contract: {
    id: 'contract',
    name: 'Contract Opportunity',
    icon: '📑',
    leadTo: 'contract'
  },
  supplier: {
    id: 'supplier',
    name: 'Supplier Deal',
    icon: '🚚',
    leadTo: 'event'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Opportunity',
    icon: '📢',
    leadTo: 'marketing'
  },
  expansion: {
    id: 'expansion',
    name: 'Expansion Opportunity',
    icon: '🏗️',
    leadTo: 'expansion'
  },
  investment: {
    id: 'investment',
    name: 'Investment Offer',
    icon: '💵',
    leadTo: 'decision'
  },
  specialCustomer: {
    id: 'specialCustomer',
    name: 'Special Customer',
    icon: '⭐',
    leadTo: 'customer'
  }
};

// Temporary Buffs/Debuffs
export const TEMPORARY_BUFFS = {
  customerFlow: {
    id: 'customerFlow',
    name: 'Customer Rush',
    icon: '👥',
    color: '#22c55e',
    effect: { customerFlow: 0.2 },
    type: 'buff'
  },
  reputationBoost: {
    id: 'reputationBoost',
    name: 'Good Press',
    icon: '📰',
    color: '#3b82f6',
    effect: { reputationGain: 0.25 },
    type: 'buff'
  },
  partsDiscount: {
    id: 'partsDiscount',
    name: 'Supplier Deal',
    icon: '💰',
    color: '#22c55e',
    effect: { partsDiscount: 0.15 },
    type: 'buff'
  },
  workshopSlow: {
    id: 'workshopSlow',
    name: 'Equipment Issues',
    icon: '🔧',
    color: '#ef4444',
    effect: { workshopEfficiency: -0.2 },
    type: 'debuff'
  },
  demandDown: {
    id: 'demandDown',
    name: 'Slow Period',
    icon: '📉',
    color: '#ef4444',
    effect: { customerFlow: -0.15 },
    type: 'debuff'
  },
  premiumDemand: {
    id: 'premiumDemand',
    name: 'Premium Demand',
    icon: '💎',
    color: '#8b5cf6',
    effect: { premiumCustomerChance: 0.2 },
    type: 'buff'
  },
  discountDemand: {
    id: 'discountDemand',
    name: 'Budget Rush',
    icon: '💲',
    color: '#06b6d4',
    effect: { budgetCustomerChance: 0.3 },
    type: 'buff'
  }
};

// Event weights based on game state
export function getEventWeights(gameState, marketState) {
  const weights = {
    positive: 0.3,
    negative: 0.25,
    opportunity: 0.35,
    threat: 0.1
  };
  
  // Adjust based on company tier
  if (gameState.shopLevel >= 5) {
    weights.opportunity += 0.1;
    weights.negative += 0.05;
  }
  
  // Adjust based on market share
  if (marketState.playerMarketShare > 30) {
    weights.threat += 0.1;
    weights.opportunity += 0.05;
  }
  
  return weights;
}

// Generate random event based on weights
export function generateRandomEvent(gameState, marketState) {
  const weights = getEventWeights(gameState, marketState);
  const categories = Object.keys(weights);
  const category = weightedRandom(categories, weights);
  
  const eventsInCategory = Object.values(RANDOM_EVENTS).filter(e => e.category === category);
  if (eventsInCategory.length === 0) return null;
  
  return eventsInCategory[Math.floor(Math.random() * eventsInCategory.length)];
}

// Weighted random selection
function weightedRandom(items, weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    random -= weights[item];
    if (random <= 0) return item;
  }
  
  return items[0];
}

// Generate opportunity
export function generateOpportunity(gameState, companyState) {
  const opportunityPool = [];
  
  // Contract opportunity
  if (companyState.tier >= 2) {
    opportunityPool.push({
      type: 'contract',
      data: generateContract(
        ['school', 'retail', 'realEstate'][Math.floor(Math.random() * 3)],
        Math.min(gameState.shopLevel, 3)
      )
    });
  }
  
  // Supplier opportunity
  opportunityPool.push({
    type: 'supplier',
    data: {
      id: `supplier_${Date.now()}`,
      name: 'New Supplier Offer',
      icon: '🚚',
      discount: 0.15 + Math.random() * 0.1,
      duration: 3,
      cost: 500 + Math.floor(Math.random() * 1000)
    }
  });
  
  // Marketing opportunity
  opportunityPool.push({
    type: 'marketing',
    data: {
      id: `marketing_${Date.now()}`,
      name: 'Marketing Campaign',
      icon: '📢',
      cost: 1000 + Math.floor(Math.random() * 2000),
      effect: { customerFlow: 0.2 + Math.random() * 0.1 },
      duration: 5
    }
  });
  
  // Expansion opportunity (rare)
  if (companyState.tier >= 3 && companyState.branches?.length < (companyState.tier || 1) + 1) {
    opportunityPool.push({
      type: 'expansion',
      data: {
        id: `expansion_${Date.now()}`,
        name: 'Prime Location Available',
        icon: '🏗️',
        discount: 0.2,
        originalCost: 15000 + Math.floor(Math.random() * 10000)
      }
    });
  }
  
  // Pick random opportunity
  return opportunityPool[Math.floor(Math.random() * opportunityPool.length)];
}

// Default event state
export const DEFAULT_EVENT_STATE = {
  specialEvents: [],
  activeContracts: [],
  completedContracts: [],
  expiredContracts: [],
  availableContracts: [],
  activeBuffs: [],
  eventHistory: [],
  pendingDecisions: [],
  opportunities: [],
  specialCustomerQueue: [],
  streamBoostActive: false,
  loyaltyBonus: false
};

// Decision result types
export const DECISION_OUTCOMES = {
  good: { color: '#22c55e', label: 'Success!' },
  neutral: { color: '#f59e0b', label: 'Result' },
  bad: { color: '#ef4444', label: 'Consequences' },
  random: { color: '#8b5cf6', label: 'Outcome' }
};
