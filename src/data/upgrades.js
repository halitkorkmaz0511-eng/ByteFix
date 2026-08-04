// Shop upgrades
export const upgrades = {
  better_tools: {
    id: 'better_tools',
    name: 'Better Tools',
    description: 'Repair mini-games become easier and faster',
    cost: 500,
    icon: '🔧',
    effect: {
      type: 'mini_game_speed',
      value: 0.8 // 20% faster mini-games
    }
  },
  better_workbench: {
    id: 'better_workbench',
    name: 'Better Workbench',
    description: 'Increase customer payments by 25%',
    cost: 1500,
    icon: '🪑',
    effect: {
      type: 'payment_bonus',
      value: 1.25
    }
  },
  extra_station: {
    id: 'extra_station',
    name: 'Extra Repair Station',
    description: 'Unlock more difficult customers',
    cost: 4000,
    icon: '🖥️',
    effect: {
      type: 'unlock_difficulty',
      value: 2
    }
  },
  gaming_section: {
    id: 'gaming_section',
    name: 'Gaming PC Section',
    description: 'Unlock advanced Gamer repair jobs',
    cost: 10000,
    icon: '🕹️',
    effect: {
      type: 'unlock_customer',
      value: 'GAMER'
    }
  },
  premium_workshop: {
    id: 'premium_workshop',
    name: 'Premium Workshop',
    description: 'Unlock advanced repair jobs',
    cost: 25000,
    icon: '🏆',
    effect: {
      type: 'unlock_difficulty',
      value: 3
    }
  }
};

// Get all upgrade effects for a player
export function calculateUpgradeEffects(purchasedUpgrades) {
  const effects = {
    miniGameSpeed: 1.0,
    paymentBonus: 1.0,
    maxDifficulty: 1
  };
  
  purchasedUpgrades.forEach(upgradeId => {
    const upgrade = upgrades[upgradeId];
    if (upgrade) {
      switch (upgrade.effect.type) {
        case 'mini_game_speed':
          effects.miniGameSpeed = upgrade.effect.value;
          break;
        case 'payment_bonus':
          effects.paymentBonus = upgrade.effect.value;
          break;
        case 'unlock_difficulty':
          effects.maxDifficulty = Math.max(effects.maxDifficulty, upgrade.effect.value);
          break;
      }
    }
  });
  
  return effects;
}

// XP requirements for each level
export function getXpForLevel(level) {
  return level * 500;
}

// Total XP needed to reach a level
export function getTotalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}
