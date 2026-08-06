// Inventory and Supplier System Data

// Hardware Parts
export const PARTS = {
  ram: {
    id: 'ram',
    name: 'RAM',
    icon: '💾',
    basePrice: 50,
    baseMarketPrice: 45,
    description: 'Memory modules',
    wasteChance: 0.05 // 5% chance of part being wasted on failed repair
  },
  ssd: {
    id: 'ssd',
    name: 'SSD',
    icon: '💿',
    basePrice: 80,
    baseMarketPrice: 70,
    description: 'Solid State Drive',
    wasteChance: 0.08
  },
  hdd: {
    id: 'hdd',
    name: 'HDD',
    icon: '🖥️',
    basePrice: 60,
    baseMarketPrice: 50,
    description: 'Hard Disk Drive',
    wasteChance: 0.1
  },
  cpu: {
    id: 'cpu',
    name: 'CPU',
    icon: '🔲',
    basePrice: 200,
    baseMarketPrice: 180,
    description: 'Processor',
    wasteChance: 0.15
  },
  gpu: {
    id: 'gpu',
    name: 'GPU',
    icon: '🎮',
    basePrice: 350,
    baseMarketPrice: 300,
    description: 'Graphics Card',
    wasteChance: 0.12
  },
  cooling_fan: {
    id: 'cooling_fan',
    name: 'Cooling Fan',
    icon: '🌀',
    basePrice: 25,
    baseMarketPrice: 20,
    description: 'CPU Cooling Fan',
    wasteChance: 0.03
  },
  thermal_paste: {
    id: 'thermal_paste',
    name: 'Thermal Paste',
    icon: '🧴',
    basePrice: 15,
    baseMarketPrice: 12,
    description: 'Thermal compound',
    wasteChance: 0.02
  },
  motherboard: {
    id: 'motherboard',
    name: 'Motherboard',
    icon: '🔌',
    basePrice: 150,
    baseMarketPrice: 130,
    description: 'Main circuit board',
    wasteChance: 0.2
  },
  power_supply: {
    id: 'power_supply',
    name: 'Power Supply',
    icon: '⚡',
    basePrice: 80,
    baseMarketPrice: 70,
    description: 'PSU Unit',
    wasteChance: 0.08
  }
};

// Suppliers
export const SUPPLIERS = {
  budget_parts: {
    id: 'budget_parts',
    name: 'BudgetParts',
    icon: '📦',
    priceMultiplier: 0.85, // -15% cheaper
    deliveryDays: 3,
    reliability: 0.75, // 75% reliable
    description: 'Cheapest option, slow delivery, some risk',
    available: true
  },
  tech_supply: {
    id: 'tech_supply',
    name: 'TechSupply',
    icon: '🏭',
    priceMultiplier: 1.0, // Normal price
    deliveryDays: 1,
    reliability: 0.95, // 95% reliable
    description: 'Balanced choice, good reliability',
    available: true
  },
  pro_hardware: {
    id: 'pro_hardware',
    name: 'ProHardware',
    icon: '🏆',
    priceMultiplier: 1.2, // +20% more expensive
    deliveryDays: 0, // Same day
    reliability: 0.99, // 99% reliable
    description: 'Premium service, same-day delivery',
    unlockLevel: 3,
    available: false // Locked until level 3
  },
  mega_tech: {
    id: 'mega_tech',
    name: 'MegaTech',
    icon: '🌐',
    priceMultiplier: 0.7, // -30% cheapest
    deliveryDays: 5,
    reliability: 0.6, // 60% reliable - higher failure chance
    description: 'Bulk supplier, very cheap, risky',
    unlockLevel: 5,
    available: false
  }
};

// Problem to Part Requirements
export const PROBLEM_PARTS = {
  cpu_overheating: {
    requiredParts: [
      { partId: 'cooling_fan', quantity: 1, optional: false },
      { partId: 'thermal_paste', quantity: 1, optional: true }
    ],
    description: 'CPU cooling system issue'
  },
  storage_full: {
    requiredParts: [
      { partId: 'ssd', quantity: 1, optional: false },
      { partId: 'hdd', quantity: 1, optional: true }
    ],
    description: 'Storage replacement needed'
  },
  virus: {
    // No parts required for virus - software fix
    requiredParts: [],
    description: 'Software issue - no parts needed'
  },
  gpu_failure: {
    requiredParts: [
      { partId: 'gpu', quantity: 1, optional: false }
    ],
    description: 'Graphics card replacement'
  },
  power_issue: {
    requiredParts: [
      { partId: 'power_supply', quantity: 1, optional: false }
    ],
    description: 'PSU replacement'
  },
  memory_issue: {
    requiredParts: [
      { partId: 'ram', quantity: 1, optional: false }
    ],
    description: 'RAM replacement'
  },
  motherboard_issue: {
    requiredParts: [
      { partId: 'motherboard', quantity: 1, optional: false }
    ],
    description: 'Motherboard replacement'
  }
};

// Starting inventory
export const DEFAULT_STARTING_INVENTORY = {
  ram: 5,
  ssd: 4,
  hdd: 3,
  cpu: 2,
  gpu: 1,
  cooling_fan: 5,
  thermal_paste: 10,
  motherboard: 2,
  power_supply: 3
};

// Default capacities by shop level
export function getStorageCapacity(shopLevel) {
  const capacities = {
    1: 50,
    2: 100,
    3: 200,
    4: 400,
    5: 800,
    6: 1200,
    7: 2000,
    8: 3000,
    9: 5000,
    10: 8000
  };
  return capacities[Math.min(shopLevel, 10)] || 50;
}

// Low stock threshold
export function getLowStockThreshold(shopLevel) {
  // Higher shop levels = more stock needed
  return Math.max(2, Math.floor(3 + shopLevel * 0.5));
}

// Calculate part price from supplier
export function calculatePartPrice(partId, supplierId) {
  const part = PARTS[partId];
  const supplier = SUPPLIERS[supplierId];
  
  if (!part || !supplier) return 0;
  
  return Math.floor(part.basePrice * supplier.priceMultiplier);
}

// Market price fluctuation (random variance)
export function getMarketPrice(partId) {
  const part = PARTS[partId];
  if (!part) return 0;
  
  // ±15% variance
  const variance = 0.15;
  const multiplier = 1 + (Math.random() * variance * 2 - variance);
  return Math.floor(part.baseMarketPrice * multiplier);
}

// Check if supplier is available
export function isSupplierAvailable(supplierId, shopLevel) {
  const supplier = SUPPLIERS[supplierId];
  if (!supplier) return false;
  
  if (supplier.unlockLevel && shopLevel < supplier.unlockLevel) {
    return false;
  }
  
  return supplier.available;
}

// Calculate order delivery time with reliability check
export function processOrderDelivery(order, currentDay) {
  const supplier = SUPPLIERS[order.supplierId];
  
  if (!supplier) {
    return { delivered: false, reason: 'Unknown supplier' };
  }
  
  const arrivalDay = order.orderDay + supplier.deliveryDays;
  
  if (currentDay < arrivalDay) {
    return { delivered: false, daysRemaining: arrivalDay - currentDay };
  }
  
  // Check reliability - failed delivery
  if (Math.random() > supplier.reliability) {
    return { delivered: false, reason: 'Delivery failed', refundAmount: order.totalCost };
  }
  
  return { delivered: true };
}

// Employee bonuses for inventory
export function getEmployeeInventoryBonuses(hiredAssistants) {
  const bonuses = {
    wasteReduction: 0, // Reduce part waste on failed repairs
    purchaseDiscount: 0, // Reduce purchase costs
    autoRestock: false, // Auto-order when low
    efficiency: 1.0 // General efficiency multiplier
  };
  
  hiredAssistants.forEach(id => {
    switch (id) {
      case 'apprentice':
        bonuses.wasteReduction += 0.1; // 10% less waste
        break;
      case 'specialist':
        bonuses.wasteReduction += 0.15; // 15% less waste
        break;
      case 'security_expert':
        // No inventory bonus
        break;
      case 'manager':
        bonuses.purchaseDiscount += 0.05; // 5% discount
        bonuses.efficiency += 0.1;
        break;
      case 'expert_technician':
        bonuses.wasteReduction += 0.2; // 20% less waste
        break;
      case 'marketing_guru':
        // No inventory bonus
        break;
    }
  });
  
  return bonuses;
}
