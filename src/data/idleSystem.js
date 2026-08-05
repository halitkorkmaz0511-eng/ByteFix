// Idle/Management System Data

// Assistant/Helpers
export const assistants = {
  apprentice: {
    id: 'apprentice',
    name: 'Apprentice Tech',
    description: 'Helps with easy repairs and reduces customer impatience by 10%',
    icon: '👨‍🔧',
    cost: 2000,
    salary: 50, // Daily salary
    effect: {
      type: 'patience_bonus',
      value: 0.9, // 10% more patience
      autoRepairChance: 0.1 // 10% chance to auto-complete easy repairs
    },
    unlockLevel: 2
  },
  specialist: {
    id: 'specialist',
    name: 'Hardware Specialist',
    description: 'Expert in hardware repairs. Increases CPU repair success by 20%',
    icon: '🔧',
    cost: 5000,
    salary: 100,
    effect: {
      type: 'repair_bonus',
      repairType: 'clean_cooling',
      successBonus: 0.2
    },
    unlockLevel: 3
  },
  security_expert: {
    id: 'security_expert',
    name: 'Security Expert',
    description: 'Virus removal expert. Increases virus scan efficiency by 25%',
    icon: '🔒',
    cost: 6000,
    salary: 120,
    effect: {
      type: 'repair_bonus',
      repairType: 'virus_scan',
      successBonus: 0.25
    },
    unlockLevel: 3
  },
  manager: {
    id: 'manager',
    name: 'Shop Manager',
    description: 'Improves customer satisfaction and reduces impatience by 25%',
    icon: '👔',
    cost: 10000,
    salary: 200,
    effect: {
      type: 'patience_bonus',
      value: 0.75,
      satisfactionBonus: 10
    },
    unlockLevel: 4
  },
  expert_technician: {
    id: 'expert_technician',
    name: 'Expert Technician',
    description: 'Can handle any repair. Auto-completes medium repairs 30% of time',
    icon: '🧠',
    cost: 15000,
    salary: 300,
    effect: {
      type: 'auto_repair',
      difficulty: 2,
      chance: 0.3
    },
    unlockLevel: 5
  },
  marketing_guru: {
    id: 'marketing_guru',
    name: 'Marketing Guru',
    description: 'Boosts customer flow by 40% and increases tip probability',
    icon: '📢',
    cost: 12000,
    salary: 180,
    effect: {
      type: 'customer_boost',
      value: 1.4,
      tipChance: 0.15,
      tipMultiplier: 1.5
    },
    unlockLevel: 4
  }
};

// Marketing campaigns
export const marketingCampaigns = {
  flyers: {
    id: 'flyers',
    name: 'Local Flyers',
    description: 'Basic advertising in the neighborhood',
    cost: 100,
    duration: 3600000, // 1 hour in ms
    effect: {
      type: 'customer_rate',
      multiplier: 1.1
    },
    cooldown: 300000 // 5 min cooldown
  },
  social_media: {
    id: 'social_media',
    name: 'Social Media Ads',
    description: 'Reach more customers online',
    cost: 300,
    duration: 7200000, // 2 hours
    effect: {
      type: 'customer_rate',
      multiplier: 1.2
    },
    cooldown: 600000 // 10 min
  },
  referral_program: {
    id: 'referral_program',
    name: 'Customer Referral Program',
    description: 'Happy customers bring friends',
    cost: 500,
    duration: 14400000, // 4 hours
    effect: {
      type: 'reputation_boost',
      value: 2
    },
    cooldown: 3600000 // 1 hour
  },
  radio_ad: {
    id: 'radio_ad',
    name: 'Local Radio Ad',
    description: 'Reach thousands of potential customers',
    cost: 1000,
    duration: 28800000, // 8 hours
    effect: {
      type: 'customer_rate',
      multiplier: 1.5,
      reputationBoost: 5
    },
    cooldown: 7200000 // 2 hours
  },
  grand_opening: {
    id: 'grand_opening',
    name: 'Grand Re-Opening Event',
    description: 'Huge promotional event with discounts',
    cost: 2500,
    duration: 43200000, // 12 hours
    effect: {
      type: 'rush_hour',
      multiplier: 2.0,
      bonusPayments: 1.5
    },
    cooldown: 86400000 // 24 hours
  }
};

// Business expenses
export const calculateDailyRent = (shopLevel) => {
  // Rent scales with shop level
  const baseRent = 50;
  return baseRent * Math.pow(shopLevel, 1.5);
};

export const calculateUtilities = (shopLevel) => {
  const baseUtilities = 20;
  return baseUtilities * shopLevel;
};

export const calculateTotalDailyExpenses = (shopLevel, hiredAssistants) => {
  const rent = calculateDailyRent(shopLevel);
  const utilities = calculateUtilities(shopLevel);
  const salaries = hiredAssistants.reduce((sum, id) => {
    const assistant = assistants[id];
    return sum + (assistant ? assistant.salary : 0);
  }, 0);
  return Math.floor(rent + utilities + salaries);
};

// Achievements
export const achievements = {
  first_repair: {
    id: 'first_repair',
    name: 'First Fix',
    description: 'Complete your first repair',
    icon: '🔧',
    requirement: { type: 'repairs', value: 1 },
    reward: { money: 50, xp: 25 }
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a repair with 100% patience remaining',
    icon: '⚡',
    requirement: { type: 'perfect_repair', value: 1 },
    reward: { money: 100, xp: 50, reputation: 5 }
  },
  combo_master: {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 10x combo',
    icon: '🔥',
    requirement: { type: 'combo', value: 10 },
    reward: { money: 500, xp: 200 }
  },
  money_maker: {
    id: 'money_maker',
    name: 'Money Maker',
    description: 'Earn $5,000 total',
    icon: '💰',
    requirement: { type: 'total_earned', value: 5000 },
    reward: { money: 0, xp: 500, reputation: 10 }
  },
  reputation_king: {
    id: 'reputation_king',
    name: 'Reputation King',
    description: 'Reach 90+ reputation',
    icon: '👑',
    requirement: { type: 'reputation', value: 90 },
    reward: { money: 1000, xp: 300 }
  },
  hundred_repairs: {
    id: 'hundred_repairs',
    name: 'Century Technician',
    description: 'Complete 100 successful repairs',
    icon: '💯',
    requirement: { type: 'repairs', value: 100 },
    reward: { money: 2000, xp: 1000 }
  },
  team_leader: {
    id: 'team_leader',
    name: 'Team Leader',
    description: 'Hire your first assistant',
    icon: '👥',
    requirement: { type: 'assistants', value: 1 },
    reward: { money: 500, xp: 200 }
  },
  marketing_genius: {
    id: 'marketing_genius',
    name: 'Marketing Genius',
    description: 'Run 50 marketing campaigns',
    icon: '📊',
    requirement: { type: 'campaigns', value: 50 },
    reward: { money: 3000, xp: 500 }
  },
  shop_owner: {
    id: 'shop_owner',
    name: 'Shop Owner',
    description: 'Reach Shop Level 10',
    icon: '🏪',
    requirement: { type: 'level', value: 10 },
    reward: { money: 10000, xp: 2000, reputation: 25 }
  },
  idle_master: {
    id: 'idle_master',
    name: 'Idle Master',
    description: 'Earn $1,000 while away',
    icon: '🌙',
    requirement: { type: 'offline_earnings', value: 1000 },
    reward: { money: 2000, xp: 400 }
  },
  no_mistakes: {
    id: 'no_mistakes',
    name: 'Perfectionist',
    description: 'Complete 10 repairs without wrong answers',
    icon: '✨',
    requirement: { type: 'streak', value: 10 },
    reward: { money: 750, xp: 300 }
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran Tech',
    description: 'Play for 7 days total',
    icon: '🎖️',
    requirement: { type: 'days_played', value: 7 },
    reward: { money: 5000, xp: 1500, reputation: 15 }
  }
};

// Premium services (unlockable)
export const premiumServices = {
  emergency_repair: {
    id: 'emergency_repair',
    name: 'Emergency Service',
    description: 'Premium 24-hour service with 2x pricing',
    icon: '🚨',
    cost: 8000,
    unlockLevel: 5,
    effect: {
      type: 'premium_service',
      priceMultiplier: 2.0,
      customerPatience: 0.5 // 50% patience (rushed customers)
    }
  },
  data_recovery: {
    id: 'data_recovery',
    name: 'Data Recovery',
    description: 'Specialized data recovery services',
    icon: '💾',
    cost: 12000,
    unlockLevel: 6,
    effect: {
      type: 'new_service',
      payments: { min: 500, max: 1500 },
      reputationGain: 10
    }
  },
  network_setup: {
    id: 'network_setup',
    name: 'Network Setup',
    description: 'Home and office networking services',
    icon: '🌐',
    cost: 15000,
    unlockLevel: 7,
    effect: {
      type: 'new_service',
      payments: { min: 300, max: 800 },
      reputationGain: 8
    }
  },
  custom_builds: {
    id: 'custom_builds',
    name: 'Custom PC Builds',
    description: 'Build custom computers for customers',
    icon: '🖥️',
    cost: 20000,
    unlockLevel: 8,
    effect: {
      type: 'new_service',
      payments: { min: 1000, max: 3000 },
      reputationGain: 15
    }
  }
};

// Idle earnings calculation
export function calculateOfflineEarnings(gameState, lastSaveTime) {
  const now = Date.now();
  const timeAway = now - lastSaveTime;
  
  // Minimum 1 minute away to earn idle money
  if (timeAway < 60000) return null;
  
  // Maximum 24 hours of idle earnings
  const maxTime = 24 * 60 * 60 * 1000;
  const effectiveTime = Math.min(timeAway, maxTime);
  
  // Base earnings per hour
  const baseHourlyRate = 100;
  
  // Apply shop level multiplier
  const levelMultiplier = 1 + (gameState.shopLevel - 1) * 0.3;
  
  // Apply reputation multiplier
  const reputationMultiplier = gameState.reputation / 50; // 0.5x to 2x based on 0-100 rep
  
  // Calculate hourly earnings
  const hourlyEarnings = Math.floor(baseHourlyRate * levelMultiplier * reputationMultiplier);
  
  // Apply assistant bonuses if any
  const assistantBonus = gameState.hiredAssistants 
    ? 1 + (gameState.hiredAssistants.length * 0.2)
    : 1;
  
  const totalHourlyEarnings = Math.floor(hourlyEarnings * assistantBonus);
  
  // Calculate total
  const hoursAway = effectiveTime / (60 * 60 * 1000);
  const totalEarnings = Math.floor(totalHourlyEarnings * hoursAway);
  
  // Reputation decays slightly while away
  const repDecay = Math.floor(hoursAway * 2); // 2 rep per hour
  
  return {
    earnings: totalEarnings,
    hoursAway: hoursAway.toFixed(1),
    repDecay: Math.min(repDecay, gameState.reputation - 10), // Don't go below 10
    hourlyRate: totalHourlyEarnings
  };
}

// Check achievement progress
export function checkAchievement(achievement, gameState) {
  const req = achievement.requirement;
  
  switch (req.type) {
    case 'repairs':
      return gameState.successfulRepairs >= req.value;
    case 'perfect_repair':
      return gameState.perfectRepairs >= req.value;
    case 'combo':
      return gameState.bestCombo >= req.value;
    case 'total_earned':
      return gameState.totalMoneyEarned >= req.value;
    case 'reputation':
      return gameState.reputation >= req.value;
    case 'assistants':
      return (gameState.hiredAssistants?.length || 0) >= req.value;
    case 'campaigns':
      return gameState.totalCampaigns >= req.value;
    case 'level':
      return gameState.shopLevel >= req.value;
    case 'offline_earnings':
      return gameState.maxOfflineEarnings >= req.value;
    case 'streak':
      return gameState.maxCorrectStreak >= req.value;
    case 'days_played':
      return gameState.daysPlayed >= req.value;
    default:
      return false;
  }
}
