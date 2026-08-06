// Customer types with names, avatars, and dialogues
export const customerTypes = [
  {
    type: 'GAMER',
    dialogues: [
      "My PC suddenly started running terribly. Can you fix it?",
      "My frames are dropping everywhere! Help!",
      "This gaming rig is making weird noises. Fix it!"
    ],
    avatar: '🎮',
    categories: ['gpu', 'cpu', 'cooling'],
    priceMultiplier: 1.2
  },
  {
    type: 'STUDENT',
    dialogues: [
      "My computer is extremely slow. I need it for school.",
      "It takes forever to load anything. Help!",
      "I'm falling behind on assignments because of this PC!"
    ],
    avatar: '📚',
    categories: ['storage', 'general', 'virus'],
    priceMultiplier: 0.7
  },
  {
    type: 'OFFICE_WORKER',
    dialogues: [
      "Everything is taking forever to load.",
      "My work computer is so slow it's affecting my productivity.",
      "Can you make this thing faster? I have deadlines!"
    ],
    avatar: '💼',
    categories: ['general', 'virus', 'hardware'],
    priceMultiplier: 1.0
  },
  {
    type: 'PARENT',
    dialogues: [
      "My son's computer stopped working properly.",
      "The kids' PC won't turn on anymore.",
      "Help! My child needs this for their homework!"
    ],
    avatar: '👨‍👩‍👧',
    categories: ['general', 'virus', 'storage'],
    priceMultiplier: 0.9
  },
  {
    type: 'BUSINESS_OWNER',
    dialogues: [
      "I need this PC working as soon as possible.",
      "Our business depends on this computer!",
      "Time is money - fix it fast!"
    ],
    avatar: '👔',
    categories: ['hardware', 'network', 'general'],
    priceMultiplier: 1.4
  }
];

// First names for random customer generation
export const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Quinn', 'Avery', 'Peyton', 'Skyler',
  'Jamie', 'Drew', 'Reese', 'Cameron', 'Sam',
  'Charlie', 'Emery', 'Finley', 'Harper', 'Kendall',
  'Lindsay', 'Marty', 'Neil', 'Owen', 'Pat'
];

// Generate a random customer with modifiers
export function generateCustomer(difficulty = 1, modifiers = {}) {
  const {
    specialCustomer = null,
    marketDemand = {},
    pricingTier = 'normal',
    specialization = null,
    customerFlowBonus = 0,
    branchLocation = null,
    loyaltyHistory = null
  } = modifiers;

  let customerType;
  
  if (specialCustomer) {
    customerType = {
      type: specialCustomer.id.toUpperCase(),
      dialogues: [specialCustomer.description || "I need your help!"],
      avatar: specialCustomer.icon,
      categories: ['general'],
      priceMultiplier: specialCustomer.paymentMultiplier || 1,
      isSpecial: true,
      specialType: specialCustomer.id
    };
  } else {
    // Weighted selection based on market demand and specialization
    const weights = {};
    
    customerTypes.forEach((ct, idx) => {
      let weight = 1;
      
      ct.categories.forEach(cat => {
        if (marketDemand[cat]) {
          weight *= marketDemand[cat];
        }
      });
      
      if (specialization && ct.categories.includes(specialization)) {
        weight *= 1.3;
      }
      
      if (branchLocation?.specializations?.some(s => ct.categories.includes(s))) {
        weight *= 1.4;
      }
      
      if (pricingTier === 'budget' && ct.priceMultiplier < 1) {
        weight *= 1.3;
      } else if (pricingTier === 'premium' && ct.priceMultiplier > 1.1) {
        weight *= 1.2;
      }
      
      weights[idx] = weight;
    });
    
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < customerTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    customerType = { ...customerTypes[selectedIndex] };
  }

  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  // Generate problems based on difficulty
  const allProblems = ['cpu_overheating', 'storage_full', 'virus'];
  let problemCount = 1;
  
  if (difficulty >= 3) problemCount = 3;
  else if (difficulty >= 2) problemCount = 2;
  
  const shuffled = allProblems.sort(() => Math.random() - 0.5);
  const problems = shuffled.slice(0, problemCount);
  
  // Calculate patience with modifiers
  let basePatience = 100;
  const patienceModifier = Math.max(0.3, 1 - (difficulty - 1) * 0.15);
  
  if (specialCustomer) {
    basePatience *= specialCustomer.patienceMultiplier || 1;
  }
  
  if (loyaltyHistory?.previousSuccess) {
    basePatience *= 1.2;
  }
  
  const patience = Math.floor(basePatience * patienceModifier);
  
  // Calculate payment
  let basePayment = 0;
  if (problemCount === 1) basePayment = 100 + Math.floor(Math.random() * 200);
  else if (problemCount === 2) basePayment = 300 + Math.floor(Math.random() * 400);
  else basePayment = 700 + Math.floor(Math.random() * 800);
  
  basePayment = Math.floor(basePayment * customerType.priceMultiplier);
  
  if (pricingTier === 'budget') {
    basePayment = Math.floor(basePayment * 0.8);
  } else if (pricingTier === 'premium') {
    basePayment = Math.floor(basePayment * 1.4);
  }
  
  if (loyaltyHistory?.previousSuccess && loyaltyHistory.count > 0) {
    basePayment = Math.floor(basePayment * (1 + loyaltyHistory.count * 0.1));
  }
  
  return {
    id: Date.now() + Math.random(),
    name,
    type: customerType.type,
    avatar: customerType.avatar,
    dialogue: customerType.dialogues[Math.floor(Math.random() * customerType.dialogues.length)],
    problems,
    patience,
    maxPatience: patience,
    basePayment,
    difficulty: problemCount,
    isSpecial: customerType.isSpecial || false,
    specialType: customerType.specialType || null,
    reputationImpact: specialCustomer?.reputationImpact || 1,
    categories: customerType.categories || ['general'],
    loyaltyHistory
  };
}

// Get customer category for contract matching
export function getCustomerCategory(customer) {
  const typeToCategory = {
    'GAMER': 'gpu',
    'STUDENT': 'storage',
    'OFFICE_WORKER': 'general',
    'PARENT': 'virus',
    'BUSINESS_OWNER': 'hardware'
  };
  return typeToCategory[customer.type] || 'general';
}
