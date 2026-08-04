// Problem definitions with symptoms and repair options
export const problems = {
  cpu_overheating: {
    id: 'cpu_overheating',
    name: 'CPU Overheating',
    symptom: 'CPU temperature is extremely high.',
    diagnosticLabel: 'CPU TEMPERATURE',
    diagnosticValue: '98°C',
    diagnosticStatus: 'critical',
    correctRepair: 'clean_cooling',
    wrongRepairs: ['add_ram', 'clean_files', 'run_virus_scan'],
    feedback: {
      correct: 'Cooling system cleaned! Temperature is now normal.',
      wrong: {
        add_ram: 'Adding more RAM won\'t help with overheating!',
        clean_files: 'Cleaning files won\'t fix the heat issue!',
        run_virus_scan: 'Viruses don\'t cause overheating!'
      }
    },
    miniGame: 'clean_cooling',
    xpReward: { 1: 50, 2: 100, 3: 250 }[1], // Will be adjusted dynamically
    paymentMultiplier: 1.0
  },
  storage_full: {
    id: 'storage_full',
    name: 'Storage Full',
    symptom: 'Storage usage is above 90%.',
    diagnosticLabel: 'STORAGE',
    diagnosticValue: '91%',
    diagnosticStatus: 'warning',
    correctRepair: 'clean_files',
    wrongRepairs: ['clean_cooling', 'add_ram', 'run_virus_scan'],
    feedback: {
      correct: 'Unnecessary files removed! Storage space recovered.',
      wrong: {
        clean_cooling: 'The cooling system is fine!',
        add_ram: 'More RAM won\'t create storage space!',
        run_virus_scan: 'There are no viruses, just too many files!'
      }
    },
    miniGame: 'clean_files',
    xpReward: 50,
    paymentMultiplier: 0.8
  },
  virus: {
    id: 'virus',
    name: 'Virus Detected',
    symptom: 'Virus detected on the system.',
    diagnosticLabel: 'VIRUS STATUS',
    diagnosticValue: 'DETECTED',
    diagnosticStatus: 'critical',
    correctRepair: 'run_virus_scan',
    wrongRepairs: ['clean_cooling', 'add_ram', 'clean_files'],
    feedback: {
      correct: 'All threats removed! System is now secure.',
      wrong: {
        clean_cooling: 'The hardware is fine! It\'s a software issue.',
        add_ram: 'Adding hardware won\'t remove malware!',
        clean_files: 'Regular cleaning won\'t remove viruses!'
      }
    },
    miniGame: 'virus_scan',
    xpReward: 75,
    paymentMultiplier: 1.2
  }
};

// Repair actions that the player can choose
export const repairActions = {
  clean_cooling: {
    id: 'clean_cooling',
    name: 'Clean Cooling System',
    description: 'Remove dust from fans and heat sinks',
    icon: '🧹',
    difficulty: 'easy'
  },
  add_ram: {
    id: 'add_ram',
    name: 'Add More RAM',
    description: 'Install additional memory modules',
    icon: '💾',
    difficulty: 'easy'
  },
  clean_files: {
    id: 'clean_files',
    name: 'Clean Files',
    description: 'Remove unnecessary files and programs',
    icon: '🗑️',
    difficulty: 'easy'
  },
  run_virus_scan: {
    id: 'run_virus_scan',
    name: 'Run Virus Scan',
    description: 'Scan and remove malware threats',
    icon: '🔒',
    difficulty: 'medium'
  }
};

// Get diagnostic data for display
export function getDiagnosticData(customerProblems) {
  const diagnostics = [];
  
  // Base diagnostics that are always OK
  const baseDiagnostics = [
    { label: 'GPU', value: 'OK', status: 'good' },
    { label: 'RAM USAGE', value: '42%', status: 'good' },
    { label: 'MOTHERBOARD', value: 'OK', status: 'good' },
    { label: 'POWER SUPPLY', value: 'OK', status: 'good' }
  ];
  
  // Add problem-specific diagnostics
  customerProblems.forEach(problemId => {
    const problem = problems[problemId];
    if (problem) {
      diagnostics.push({
        label: problem.diagnosticLabel,
        value: problem.diagnosticValue,
        status: problem.diagnosticStatus
      });
    }
  });
  
  // Shuffle to mix problem diagnostics with normal ones
  const allDiagnostics = [...baseDiagnostics, ...diagnostics];
  for (let i = allDiagnostics.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allDiagnostics[i], allDiagnostics[j]] = [allDiagnostics[j], allDiagnostics[i]];
  }
  
  return allDiagnostics;
}
