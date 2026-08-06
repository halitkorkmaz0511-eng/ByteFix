// Save version and migration utilities

export const SAVE_VERSION = '2.6.1';

// Current game version
export const GAME_VERSION = '2.6.1';

// Default states for all game systems
export const DEFAULT_STATES = {
  game: {
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
  },
  events: {
    activeBuffs: [],
    activeContracts: [],
    availableContracts: [],
    eventHistory: [],
    pendingDecisions: [],
    specialCustomerQueue: [],
    lastEventDay: 0,
    lastMajorEventDay: 0
  },
  idle: {
    totalOfflineEarnings: 0,
    maxOfflineEarnings: 0,
    lastOnlineTime: Date.now(),
    hiredAssistants: [],
    activeMarketing: [],
    achievements: [],
    unlockedAchievements: []
  },
  inventory: {
    inventory: {},
    pendingOrders: [],
    recentDeliveries: []
  },
  market: {
    categoryDemand: {
      gpu: 1.0,
      storage: 1.0,
      virus: 1.0,
      ram: 1.0,
      cooling: 1.0,
      network: 1.0,
      software: 1.0,
      peripherals: 1.0
    },
    competitors: [],
    playerPricing: {
      general: 'normal',
      gpu: 'normal',
      storage: 'normal',
      virus: 'normal',
      ram: 'normal',
      cooling: 'normal',
      network: 'normal',
      software: 'normal',
      peripherals: 'normal'
    },
    playerSpecialization: 'none',
    playerMarketShare: 10,
    currentDay: 1,
    news: []
  },
  company: {
    tier: 1,
    totalValue: 0,
    branches: [],
    strategies: [],
    milestones: []
  },
  customerHistory: {}
};

// Migration functions
const migrations = {
  // Add customerHistory to saves that don't have it
  '2.6.1_add_customer_history': (save) => {
    return {
      ...save,
      customerHistory: save.customerHistory || {}
    };
  },
  
  // Add company state if missing
  '2.6_add_company': (save) => {
    if (!save.company) {
      return {
        ...save,
        company: DEFAULT_STATES.company
      };
    }
    return save;
  },
  
  // Add market state if missing
  '2.6_add_market': (save) => {
    if (!save.market) {
      return {
        ...save,
        market: DEFAULT_STATES.market
      };
    }
    return save;
  },
  
  // Add events state if missing
  '2.6_add_events': (save) => {
    if (!save.events) {
      return {
        ...save,
        events: DEFAULT_STATES.events
      };
    }
    return save;
  },
  
  // Add inventory state if missing
  '2.6_add_inventory': (save) => {
    if (!save.inventory) {
      return {
        ...save,
        inventory: DEFAULT_STATES.inventory
      };
    }
    return save;
  },
  
  // Add idle state if missing
  '2.6_add_idle': (save) => {
    if (!save.idle) {
      return {
        ...save,
        idle: DEFAULT_STATES.idle
      };
    }
    return save;
  }
};

// Migration order - apply in this order
const migrationOrder = [
  '2.6_add_company',
  '2.6_add_market',
  '2.6_add_events',
  '2.6_add_inventory',
  '2.6_add_idle',
  '2.6.1_add_customer_history'
];

// Load and migrate save
export function loadAndMigrateSave() {
  const storageKey = 'bytefix_save';
  const backupKey = 'bytefix_save_backup';
  
  try {
    // Try to load the main save
    const mainSave = localStorage.getItem(storageKey);
    
    if (mainSave) {
      try {
        const parsed = JSON.parse(mainSave);
        const migrated = migrateSave(parsed);
        
        // Create backup of current save
        try {
          localStorage.setItem(backupKey, mainSave);
        } catch (e) {
          console.warn('Could not create save backup:', e);
        }
        
        return migrated;
      } catch (e) {
        console.error('Failed to parse main save:', e);
        
        // Try to recover from backup
        const backupSave = localStorage.getItem(backupKey);
        if (backupSave) {
          try {
            const parsed = JSON.parse(backupSave);
            const migrated = migrateSave(parsed);
            console.log('Recovered save from backup');
            return migrated;
          } catch (e2) {
            console.error('Backup also corrupted:', e2);
          }
        }
        
        // Could not recover - start fresh
        console.log('Could not recover save, starting fresh');
        return null;
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error loading save:', e);
    return null;
  }
}

// Migrate save to current version
function migrateSave(save) {
  let migrated = { ...save };
  
  // Add version if not present
  if (!migrated.version) {
    migrated.version = '2.0';
  }
  
  // Apply migrations in order
  for (const migrationName of migrationOrder) {
    if (compareVersions(migrated.version, migrationName.split('_')[0]) < 0) {
      if (migrations[migrationName]) {
        console.log(`Applying migration: ${migrationName}`);
        migrated = migrations[migrationName](migrated);
      }
    }
  }
  
  // Set final version
  migrated.version = GAME_VERSION;
  
  return migrated;
}

// Compare versions (v1 > v2 returns positive)
export function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

// Save game state with backup
export function saveGameState(state) {
  const storageKey = 'bytefix_save';
  const backupKey = 'bytefix_save_backup';
  
  try {
    const stateString = JSON.stringify(state);
    
    // Create backup first
    try {
      const currentSave = localStorage.getItem(storageKey);
      if (currentSave) {
        localStorage.setItem(backupKey, currentSave);
      }
    } catch (e) {
      console.warn('Could not create backup:', e);
    }
    
    // Save new state
    localStorage.setItem(storageKey, stateString);
    
    return true;
  } catch (e) {
    console.error('Failed to save:', e);
    return false;
  }
}

// Clean up old backup (keep only most recent)
export function cleanupOldBackups() {
  const backupKey = 'bytefix_save_backup';
  const oldBackupKey = 'bytefix_save_backup_old';
  
  try {
    // Remove very old backup if exists
    localStorage.removeItem(oldBackupKey);
  } catch (e) {
    // Ignore
  }
}

// Get customer history
export function getCustomerHistory(customerId) {
  const save = loadAndMigrateSave();
  if (!save || !save.customerHistory) return null;
  return save.customerHistory[customerId] || null;
}

// Update customer history
export function updateCustomerHistory(customerId, data) {
  const save = loadAndMigrateSave();
  if (!save) return false;
  
  const history = save.customerHistory || {};
  const current = history[customerId] || {
    visits: 0,
    successfulRepairs: 0,
    failedRepairs: 0,
    loyalty: 0,
    lastVisit: null
  };
  
  history[customerId] = {
    ...current,
    ...data,
    lastVisit: Date.now()
  };
  
  save.customerHistory = history;
  
  return saveGameState(save);
}
