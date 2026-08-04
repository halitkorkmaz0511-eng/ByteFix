// Customer types with names, avatars, and dialogues
export const customerTypes = [
  {
    type: 'GAMER',
    dialogues: [
      "My PC suddenly started running terribly. Can you fix it?",
      "My frames are dropping everywhere! Help!",
      "This gaming rig is making weird noises. Fix it!"
    ],
    avatar: '🎮'
  },
  {
    type: 'STUDENT',
    dialogues: [
      "My computer is extremely slow. I need it for school.",
      "It takes forever to load anything. Help!",
      "I'm falling behind on assignments because of this PC!"
    ],
    avatar: '📚'
  },
  {
    type: 'OFFICE_WORKER',
    dialogues: [
      "Everything is taking forever to load.",
      "My work computer is so slow it's affecting my productivity.",
      "Can you make this thing faster? I have deadlines!"
    ],
    avatar: '💼'
  },
  {
    type: 'PARENT',
    dialogues: [
      "My son's computer stopped working properly.",
      "The kids' PC won't turn on anymore.",
      "Help! My child needs this for their homework!"
    ],
    avatar: '👨‍👩‍👧'
  },
  {
    type: 'BUSINESS_OWNER',
    dialogues: [
      "I need this PC working as soon as possible.",
      "Our business depends on this computer!",
      "Time is money - fix it fast!"
    ],
    avatar: '👔'
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

// Generate a random customer
export function generateCustomer(difficulty = 1) {
  const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  // Generate problems based on difficulty
  const allProblems = ['cpu_overheating', 'storage_full', 'virus'];
  let problemCount = 1;
  
  if (difficulty >= 3) problemCount = 3;
  else if (difficulty >= 2) problemCount = 2;
  
  const shuffled = allProblems.sort(() => Math.random() - 0.5);
  const problems = shuffled.slice(0, problemCount);
  
  // Customer patience decreases with difficulty
  const basePatience = 100;
  const patienceModifier = Math.max(0.5, 1 - (difficulty - 1) * 0.15);
  const patience = Math.floor(basePatience * patienceModifier);
  
  // Payment based on difficulty
  let basePayment = 0;
  if (problemCount === 1) basePayment = 100 + Math.floor(Math.random() * 200);
  else if (problemCount === 2) basePayment = 300 + Math.floor(Math.random() * 400);
  else basePayment = 700 + Math.floor(Math.random() * 800);
  
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
    difficulty: problemCount
  };
}
