import { useState, useCallback, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { generateCustomer } from './data/customerData';
import { problems } from './data/problems';
import { soundSystem } from './utils/soundSystem';

// Components
import { HUD } from './components/HUD';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Workshop } from './components/Workshop';
import { CustomerArrival } from './components/CustomerArrival';
import { DiagnosticScreen } from './components/DiagnosticScreen';
import { CleanCoolingGame } from './components/CleanCoolingGame';
import { CleanFilesGame } from './components/CleanFilesGame';
import { VirusScanGame } from './components/VirusScanGame';
import { PatienceTimer } from './components/PatienceTimer';
import { RewardScreen } from './components/RewardScreen';
import { FailedScreen } from './components/FailedScreen';
import { WrongAnswer } from './components/WrongAnswer';
import { ShopScreen } from './components/ShopScreen';
import { StatsScreen } from './components/StatsScreen';
import { SettingsScreen } from './components/SettingsScreen';

import './App.css';

function App() {
  const {
    gameState,
    effects,
    addMoney,
    addXp,
    updateReputation,
    incrementCombo,
    resetCombo,
    recordSuccess,
    recordFailure,
    purchaseUpgrade,
    updateSettings,
    resetGame,
    markWelcomeSeen
  } = useGameState();

  // Screen state
  const [currentScreen, setCurrentScreen] = useState('workshop');
  
  // Customer state
  const [customer, setCustomer] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [fixedProblems, setFixedProblems] = useState([]);
  
  // UI state
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState('');
  const [patienceLost, setPatienceLost] = useState(0);
  const [customerPatience, setCustomerPatience] = useState(100);
  const [isMiniGame, setIsMiniGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Reward state
  const [reward, setReward] = useState(null);

  // Initialize sound
  useEffect(() => {
    soundSystem.setEnabled(gameState.settings.sound);
  }, [gameState.settings.sound]);

  // Generate a new customer
  const handleNewCustomer = useCallback(() => {
    // Determine difficulty based on shop level
    const difficulty = Math.min(gameState.shopLevel, effects.maxDifficulty);
    const newCustomer = generateCustomer(difficulty);
    setCustomer(newCustomer);
    setCustomerPatience(newCustomer.patience);
    setFixedProblems([]);
    setCurrentProblem(null);
    setCurrentScreen('customer');
  }, [gameState.shopLevel, effects.maxDifficulty]);

  // Start inspecting PC
  const handleInspect = useCallback(() => {
    setCurrentScreen('diagnostic');
  }, []);

  // Go back from diagnostic
  const handleBackFromDiagnostic = useCallback(() => {
    setCurrentScreen('customer');
  }, []);

  // Handle repair selection
  const handleRepair = useCallback((problemId, repairId) => {
    const problem = problems[problemId];
    
    if (repairId === problem.correctRepair) {
      // Correct repair!
      soundSystem.playSuccess();
      setCurrentProblem(problemId);
      setIsPaused(true);
      setCurrentScreen('minigame');
    } else {
      // Wrong repair
      setWrongFeedback(problem.feedback.wrong[repairId] || 'That\'s not the right fix!');
      setPatienceLost(15);
      setCustomerPatience(prev => Math.max(0, prev - 15));
      setShowWrongAnswer(true);
    }
  }, []);

  // Continue from wrong answer
  const handleContinueFromWrong = useCallback(() => {
    setShowWrongAnswer(false);
    
    // Check if patience ran out
    if (customerPatience <= 0) {
      recordFailure();
      resetCombo();
      setCurrentScreen('failed');
      return;
    }
  }, [customerPatience, recordFailure, resetCombo]);

  // Handle mini-game completion
  const handleMiniGameComplete = useCallback((success) => {
    setIsPaused(false);
    
    if (success) {
      const newFixedProblems = [...fixedProblems, currentProblem];
      setFixedProblems(newFixedProblems);
      
      // Check if all problems are fixed
      if (newFixedProblems.length === customer.problems.length) {
        // All problems fixed! Calculate rewards
        calculateRewards(newFixedProblems.length);
      } else {
        // More problems to fix
        setCurrentScreen('diagnostic');
      }
    } else {
      // Mini-game failed, lose more patience
      setCustomerPatience(prev => Math.max(0, prev - 20));
      
      if (customerPatience <= 20) {
        recordFailure();
        resetCombo();
        setCurrentScreen('failed');
      } else {
        setCurrentScreen('diagnostic');
      }
    }
    
    setCurrentProblem(null);
    setIsMiniGame(false);
  }, [fixedProblems, currentProblem, customer, customerPatience, recordFailure, resetCombo]);

  // Calculate and show rewards
  const calculateRewards = useCallback((problemCount) => {
    recordSuccess();
    incrementCombo();
    
    const basePayment = customer.basePayment;
    const speedBonus = customerPatience > 70 ? Math.floor(basePayment * 0.3) : 0;
    const perfectBonus = customerPatience === customer.maxPatience ? Math.floor(basePayment * 0.2) : 0;
    
    // Apply combo multiplier
    const comboMultiplier = gameState.combo + 1 > 3 ? 1.5 : 
                           gameState.combo + 1 > 1 ? 1.2 : 1;
    
    // Apply upgrade bonuses
    const finalPayment = Math.floor((basePayment + speedBonus + perfectBonus) * effects.paymentBonus * comboMultiplier);
    
    // Calculate XP
    const xpReward = problemCount === 1 ? 50 : 
                     problemCount === 2 ? 100 : 250;
    
    // Update state
    addMoney(finalPayment);
    addXp(xpReward);
    updateReputation(5);
    
    setReward({
      payment: basePayment,
      speedBonus,
      perfectBonus,
      combo: gameState.combo + 1,
      xp: xpReward,
      reputation: 5
    });
    
    setCurrentScreen('reward');
  }, [customer, customerPatience, gameState.combo, effects, recordSuccess, incrementCombo, addMoney, addXp, updateReputation]);

  // Handle customer timeout
  const handlePatienceTimeout = useCallback(() => {
    recordFailure();
    resetCombo();
    setCurrentScreen('failed');
  }, [recordFailure, resetCombo]);

  // Continue from reward screen
  const handleContinueFromReward = useCallback(() => {
    setReward(null);
    setCustomer(null);
    setCurrentScreen('workshop');
  }, []);

  // Continue from failed screen
  const handleContinueFromFailed = useCallback(() => {
    setCustomer(null);
    setCurrentScreen('workshop');
  }, []);

  // Open screens
  const handleOpenShop = useCallback(() => {
    setCurrentScreen('shop');
  }, []);

  const handleOpenStats = useCallback(() => {
    setCurrentScreen('stats');
  }, []);

  const handleOpenSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  const handleBackFromScreen = useCallback(() => {
    setCurrentScreen('workshop');
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={markWelcomeSeen} />;
      
      case 'workshop':
        return (
          <Workshop 
            onNewCustomer={handleNewCustomer}
            onOpenShop={handleOpenShop}
            onOpenStats={handleOpenStats}
            onOpenSettings={handleOpenSettings}
            hasActiveCustomer={!!customer}
          />
        );
      
      case 'customer':
        return <CustomerArrival customer={customer} onInspect={handleInspect} />;
      
      case 'diagnostic':
        return (
          <>
            <PatienceTimer
              maxPatience={customer.maxPatience}
              currentPatience={customerPatience}
              onPatienceChange={setCustomerPatience}
              onTimeout={handlePatienceTimeout}
              isPaused={isPaused}
            />
            <DiagnosticScreen 
              customer={customer}
              onBack={handleBackFromDiagnostic}
              onRepair={handleRepair}
            />
          </>
        );
      
      case 'minigame':
        if (currentProblem === 'cpu_overheating') {
          return (
            <CleanCoolingGame 
              onComplete={handleMiniGameComplete}
              speedMultiplier={effects.miniGameSpeed}
            />
          );
        } else if (currentProblem === 'storage_full') {
          return (
            <CleanFilesGame 
              onComplete={handleMiniGameComplete}
              speedMultiplier={effects.miniGameSpeed}
            />
          );
        } else if (currentProblem === 'virus') {
          return (
            <VirusScanGame 
              onComplete={handleMiniGameComplete}
              speedMultiplier={effects.miniGameSpeed}
            />
          );
        }
        return null;
      
      case 'reward':
        return (
          <RewardScreen 
            payment={reward.payment}
            speedBonus={reward.speedBonus}
            perfectBonus={reward.perfectBonus}
            xp={reward.xp}
            reputation={reward.reputation}
            combo={reward.combo}
            isLevelUp={false}
            newLevel={gameState.shopLevel}
            onContinue={handleContinueFromReward}
          />
        );
      
      case 'failed':
        return (
          <FailedScreen 
            reason="The customer ran out of patience and left!"
            onContinue={handleContinueFromFailed}
          />
        );
      
      case 'shop':
        return (
          <ShopScreen 
            money={gameState.money}
            purchasedUpgrades={gameState.purchasedUpgrades}
            onPurchase={purchaseUpgrade}
            onBack={handleBackFromScreen}
          />
        );
      
      case 'stats':
        return (
          <StatsScreen 
            stats={{
              totalCustomers: gameState.totalCustomers,
              successfulRepairs: gameState.successfulRepairs,
              failedRepairs: gameState.failedRepairs,
              totalMoneyEarned: gameState.totalMoneyEarned,
              bestCombo: gameState.bestCombo,
              shopLevel: gameState.shopLevel,
              reputation: gameState.reputation
            }}
            onBack={handleBackFromScreen}
          />
        );
      
      case 'settings':
        return (
          <SettingsScreen 
            settings={gameState.settings}
            onUpdateSettings={updateSettings}
            onReset={resetGame}
            onBack={handleBackFromScreen}
          />
        );
      
      default:
        return null;
    }
  };

  // Show welcome screen on first visit
  if (!gameState.hasSeenWelcome) {
    return <WelcomeScreen onStart={markWelcomeSeen} />;
  }

  return (
    <div className="app">
      <HUD gameState={gameState} />
      <main className="main-content">
        {renderScreen()}
      </main>
      
      {showWrongAnswer && (
        <WrongAnswer 
          feedback={wrongFeedback}
          patienceLost={patienceLost}
          onContinue={handleContinueFromWrong}
        />
      )}
    </div>
  );
}

export default App;
