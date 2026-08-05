import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useIdleManagement } from './hooks/useIdleManagement';
import { generateCustomer } from './data/customerData';
import { problems } from './data/problems';
import { soundSystem } from './utils/soundSystem';
import { getQueueCapacity } from './components/Workshop';

// Components
import { HUD } from './components/HUD';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Workshop } from './components/Workshop';
import { WorkshopManagement } from './components/WorkshopManagement';
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
import { BusinessDashboard } from './components/BusinessDashboard';
import { OfflineEarningsPopup, AchievementPopup } from './components/Popups';

import './App.css';

function App() {
  console.log('App rendering');
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

  // Idle/Management system
  const {
    idleState,
    offlineEarnings,
    showOfflinePopup,
    pendingAchievement,
    collectOfflineEarnings,
    dismissOfflinePopup,
    hireAssistant,
    fireAssistant,
    startMarketing,
    checkAllAchievements,
    dismissAchievement,
    recordPerfectRepair,
    recordWrongAnswer,
    getAssistantEffects,
    getMarketingEffect,
    resetIdleState
  } = useIdleManagement(gameState, addMoney, addXp, updateReputation);

  // Screen state
  const [currentScreen, setCurrentScreen] = useState('workshop');
  
  // Dashboard state
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Customer queue system
  const [customerQueue, setCustomerQueue] = useState([]); // Waiting customers
  const [activeCustomer, setActiveCustomer] = useState(null); // Customer at counter
  const [currentProblem, setCurrentProblem] = useState(null);
  const [fixedProblems, setFixedProblems] = useState([]);
  const [newCustomerArriving, setNewCustomerArriving] = useState(null); // Customer entering animation
  const [exitingCustomer, setExitingCustomer] = useState(null); // Customer exiting animation
  
  // UI state
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState('');
  const [patienceLost, setPatienceLost] = useState(0);
  const [customerPatience, setCustomerPatience] = useState(100);
  const [isMiniGame, setIsMiniGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Reward state
  const [reward, setReward] = useState(null);

  // Refs for timers
  const spawnTimerRef = useRef(null);
  const patienceTimerRef = useRef(null);
  const isProcessingTimeoutRef = useRef(false);

  // Initialize sound
  useEffect(() => {
    soundSystem.setEnabled(gameState.settings.sound);
  }, [gameState.settings.sound]);

  // Calculate spawn interval based on shop level and reputation
  const getSpawnInterval = useCallback(() => {
    const baseInterval = 8000; // 8 seconds base
    const levelReduction = Math.min(gameState.shopLevel * 500, 4000); // Max 4s reduction
    const reputationReduction = Math.min(gameState.reputation * 20, 2000); // Max 2s reduction
    
    // Apply marketing boost
    const marketingEffect = getMarketingEffect();
    const marketingMultiplier = marketingEffect?.multiplier || 1;
    
    // Apply customer boost from assistants
    const assistantEffects = getAssistantEffects();
    const customerBoost = assistantEffects.customerBoost;
    
    const minInterval = 3000; // Minimum 3 seconds between spawns
    const interval = Math.max(minInterval, baseInterval - levelReduction - reputationReduction);
    
    // Apply boosts (lower interval = more customers)
    return Math.floor(interval / (marketingMultiplier * customerBoost));
  }, [gameState.shopLevel, gameState.reputation, getMarketingEffect, getAssistantEffects]);

  // Move customer from queue to counter
  const moveToCounter = useCallback((customer) => {
    // Apply assistant patience bonus
    const assistantEffects = getAssistantEffects();
    const adjustedPatience = Math.floor(customer.patience * assistantEffects.patienceMultiplier);
    
    setActiveCustomer({ ...customer, adjustedPatience });
    setCustomerPatience(adjustedPatience);
    setCurrentScreen('customer');
    soundSystem.playCustomerArrival();
  }, [getAssistantEffects]);

  // Spawn a new customer - uses functional state updates to avoid closure issues
  const spawnCustomer = useCallback(() => {
    // Don't spawn while in menus or if no welcome seen
    if (!gameState.hasSeenWelcome) return false;
    // Workshop view is where management panel is, customers should continue spawning
    if (currentScreen === 'shop' || currentScreen === 'stats' || currentScreen === 'settings' || currentScreen === 'welcome') return false;
    if (currentScreen === 'minigame' || currentScreen === 'reward' || currentScreen === 'failed') return false;

    // Calculate max queue size based on shop level
    const maxQueueSize = getQueueCapacity(gameState.shopLevel);
    if (customerQueue.length >= maxQueueSize) return false;

    const difficulty = Math.min(gameState.shopLevel, effects.maxDifficulty);
    const newCustomer = generateCustomer(difficulty);
    
    soundSystem.playCustomerArrival();
    setNewCustomerArriving(newCustomer);
    
    // After entrance animation, add to queue/counter
    setTimeout(() => {
      setNewCustomerArriving(null);
      
      // Use functional updates to get current state
      setActiveCustomer(current => {
        if (current) {
          // Counter is occupied, add to queue
          setCustomerQueue(prev => [...prev, newCustomer]);
          return current;
        }
        // Counter is empty, check queue
        setCustomerQueue(prev => {
          if (prev.length === 0) {
            // Both counter and queue are empty, move to counter
            setTimeout(() => moveToCounter(newCustomer), 0);
            return prev;
          }
          // Queue has customers, add to end of queue
          return [...prev, newCustomer];
        });
        return current;
      });
    }, 1500);
    
    return true;
  }, [currentScreen, customerQueue.length, gameState.shopLevel, effects.maxDifficulty, gameState.hasSeenWelcome, moveToCounter]);

  // Start automatic customer spawning
  useEffect(() => {
    if (!gameState.hasSeenWelcome) return;
    // Workshop view is where management panel is, customers should continue spawning
    if (currentScreen === 'shop' || currentScreen === 'stats' || currentScreen === 'settings' || currentScreen === 'welcome') return;
    if (currentScreen === 'minigame' || currentScreen === 'reward' || currentScreen === 'failed') return;

    // Clear any existing spawn timer
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }

    // Spawn first customer after a short delay if counter is empty
    if (!activeCustomer && customerQueue.length === 0) {
      spawnTimerRef.current = setTimeout(() => {
        spawnCustomer();
      }, 2000);
    }

    // Calculate max queue size based on shop level
    const maxQueueSize = getQueueCapacity(gameState.shopLevel);

    // Set up automatic spawning for additional customers
    const scheduleNextSpawn = () => {
      spawnTimerRef.current = setTimeout(() => {
        spawnCustomer();
        scheduleNextSpawn();
      }, getSpawnInterval());
    };

    // Only schedule if queue isn't full
    if (customerQueue.length < maxQueueSize) {
      scheduleNextSpawn();
    }

    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [gameState.hasSeenWelcome, currentScreen, spawnCustomer, getSpawnInterval, gameState.shopLevel, getMarketingEffect, getAssistantEffects]);

  // Patience countdown for active customer
  useEffect(() => {
    // Only run patience timer on active gameplay screens
    const isActiveScreen = ['customer', 'diagnostic'].includes(currentScreen);
    
    if (!isActiveScreen || !activeCustomer) {
      // Clear patience timer when not on active screens
      if (patienceTimerRef.current) {
        clearInterval(patienceTimerRef.current);
        patienceTimerRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (patienceTimerRef.current) {
      clearInterval(patienceTimerRef.current);
    }

    // Start patience countdown
    patienceTimerRef.current = setInterval(() => {
      if (isProcessingTimeoutRef.current) return;
      
      setCustomerPatience(prev => {
        const newPatience = Math.max(0, prev - 1);
        if (newPatience <= 0 && !isProcessingTimeoutRef.current) {
          // Customer ran out of patience
          isProcessingTimeoutRef.current = true;
          if (patienceTimerRef.current) {
            clearInterval(patienceTimerRef.current);
            patienceTimerRef.current = null;
          }
          recordFailure();
          resetCombo();
          setCurrentScreen('failed');
          soundSystem.playError();
        }
        return newPatience;
      });
    }, 200);

    return () => {
      if (patienceTimerRef.current) {
        clearInterval(patienceTimerRef.current);
        patienceTimerRef.current = null;
      }
    };
  }, [currentScreen, activeCustomer, recordFailure, resetCombo]);

  // Patience countdown for waiting customers in queue
  useEffect(() => {
    if (customerQueue.length === 0) return;

    const queueTimer = setInterval(() => {
      setCustomerQueue(prev => {
        let customersWhoLeft = 0;
        const updated = prev.map(c => ({
          ...c,
          patience: Math.max(0, c.patience - 0.5)
        })).filter(c => {
          if (c.patience <= 0) {
            soundSystem.playError();
            recordFailure();
            resetCombo();
            customersWhoLeft++;
            return false;
          }
          return true;
        });
        
        // If a customer left, check if we should bring next one
        if (customersWhoLeft > 0 && !activeCustomer) {
          setTimeout(() => {
            if (updated.length > 0) {
              moveToCounter(updated[0]);
            }
          }, 100);
        }
        
        return updated;
      });
    }, 200);

    return () => clearInterval(queueTimer);
  }, [customerQueue.length, activeCustomer, moveToCounter, recordFailure, resetCombo]);

  // Handle customer timeout (legacy function, now handled in useEffect)
  const handleCustomerTimeout = useCallback(() => {
    // This is now handled in the useEffect to avoid race conditions
  }, []);

  // Bring next customer from queue to counter
  const bringNextCustomer = useCallback(() => {
    isProcessingTimeoutRef.current = false;
    setCustomerQueue(prev => {
      if (prev.length === 0) {
        setActiveCustomer(null);
        return prev;
      }
      
      const [nextCustomer, ...remaining] = prev;
      setActiveCustomer(nextCustomer);
      setCustomerPatience(nextCustomer.patience);
      setCurrentScreen('customer');
      soundSystem.playCustomerArrival();
      return remaining;
    });
  }, []);

  // Start inspecting PC
  const handleInspect = useCallback(() => {
    soundSystem.playClick();
    setCurrentScreen('diagnostic');
  }, []);

  // Go back from diagnostic
  const handleBackFromDiagnostic = useCallback(() => {
    setCurrentScreen('customer');
  }, []);

  // Handle repair selection
  const handleRepair = useCallback((problemId, repairId) => {
    console.log('handleRepair called:', problemId, repairId);
    
    if (!problems[problemId]) {
      console.error('Problem not found:', problemId);
      return;
    }
    
    const problem = problems[problemId];
    
    if (repairId === problem.correctRepair) {
      // Correct repair!
      console.log('Correct repair, setting mini-game');
      setCurrentProblem(problemId);
      setIsPaused(true);
      setCurrentScreen('minigame');
    } else {
      // Wrong repair - break streak
      recordWrongAnswer();
      setWrongFeedback(problem.feedback.wrong[repairId] || 'That\'s not the right fix!');
      setPatienceLost(15);
      setCustomerPatience(prev => Math.max(0, prev - 15));
      setShowWrongAnswer(true);
    }
  }, [recordWrongAnswer]);

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
      if (activeCustomer && newFixedProblems.length === activeCustomer.problems.length) {
        // All problems fixed! Calculate rewards
        calculateRewards(newFixedProblems.length);
        setCurrentScreen('reward');
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
  }, [fixedProblems, currentProblem, activeCustomer, customerPatience, recordFailure, resetCombo]);

  // Calculate and show rewards
  const calculateRewards = useCallback((problemCount) => {
    recordSuccess();
    incrementCombo();
    
    const basePayment = activeCustomer.basePayment;
    const speedBonus = customerPatience > 70 ? Math.floor(basePayment * 0.3) : 0;
    const perfectBonus = customerPatience === activeCustomer.maxPatience ? Math.floor(basePayment * 0.2) : 0;
    
    // Check for perfect repair (100% patience remaining)
    if (customerPatience === activeCustomer.maxPatience) {
      recordPerfectRepair();
    }
    
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
    
    // Check achievements after successful repair
    setTimeout(() => checkAllAchievements(), 100);
    
    setCurrentScreen('reward');
  }, [activeCustomer, customerPatience, gameState.combo, effects, recordSuccess, incrementCombo, addMoney, addXp, updateReputation, recordPerfectRepair, checkAllAchievements]);

  // Continue from reward screen
  const handleContinueFromReward = useCallback(() => {
    const completedCustomer = activeCustomer;
    setReward(null);
    setFixedProblems([]);
    
    // Show exit animation
    if (completedCustomer) {
      setExitingCustomer(completedCustomer);
      setTimeout(() => {
        setExitingCustomer(null);
        setActiveCustomer(null);
        
        // Check if there's a customer waiting
        if (customerQueue.length > 0) {
          bringNextCustomer();
        } else {
          setCurrentScreen('workshop');
        }
      }, 1500);
    } else {
      setActiveCustomer(null);
      if (customerQueue.length > 0) {
        bringNextCustomer();
      } else {
        setCurrentScreen('workshop');
      }
    }
  }, [activeCustomer, customerQueue.length, bringNextCustomer]);

  // Continue from failed screen
  const handleContinueFromFailed = useCallback(() => {
    const failedCustomer = activeCustomer;
    setFixedProblems([]);
    
    // Show exit animation
    if (failedCustomer) {
      setExitingCustomer(failedCustomer);
      setTimeout(() => {
        setExitingCustomer(null);
        setActiveCustomer(null);
        
        // Check if there's a customer waiting
        if (customerQueue.length > 0) {
          bringNextCustomer();
        } else {
          setCurrentScreen('workshop');
        }
      }, 1500);
    } else {
      setActiveCustomer(null);
      if (customerQueue.length > 0) {
        bringNextCustomer();
      } else {
        setCurrentScreen('workshop');
      }
    }
  }, [activeCustomer, customerQueue.length, bringNextCustomer]);

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

  // Check if there are customers waiting
  const hasWaitingCustomers = customerQueue.length > 0;
  const totalCustomers = customerQueue.length + (activeCustomer ? 1 : 0);

  // Determine which screen to show
  const showWorkshop = !['welcome', 'customer', 'diagnostic', 'minigame', 'reward', 'failed', 'shop', 'stats', 'settings'].includes(currentScreen);

  // Render current screen
  const renderScreen = () => {
    try {
      console.log('renderScreen called:', currentScreen, 'currentProblem:', currentProblem);
      
      switch (currentScreen) {
        case 'welcome':
          return <WelcomeScreen onStart={markWelcomeSeen} />;
        
        case 'customer':
          return (
            <CustomerArrival 
              customer={activeCustomer} 
              onInspect={handleInspect}
              isFromQueue={true}
            />
          );
        
        case 'workshop':
          return (
            <div className="workshop-view">
              {/* Left Panel: Active Shop */}
              <div className="active-shop-panel">
                <Workshop 
                  activeCustomer={activeCustomer}
                  customerQueue={customerQueue}
                  newCustomerArriving={newCustomerArriving}
                  exitingCustomer={exitingCustomer}
                  totalCustomers={gameState.totalCustomers}
                  onCustomerReady={() => setCurrentScreen('customer')}
                  onInspect={handleInspect}
                  shopLevel={gameState.shopLevel}
                />
              </div>
              
              {/* Right Panel: Shop Management */}
              <div className="management-panel">
                <WorkshopManagement
                  gameState={gameState}
                  effects={effects}
                  onPurchaseUpgrade={purchaseUpgrade}
                  onOpenShop={handleOpenShop}
                  onOpenStats={handleOpenStats}
                  onOpenSettings={handleOpenSettings}
                  customerQueueLength={customerQueue.length}
                  activeCustomer={activeCustomer}
                  queueCapacity={getQueueCapacity(gameState.shopLevel)}
                />
              </div>
            </div>
          );
        
        case 'diagnostic':
          return (
            <>
              <PatienceTimer
                maxPatience={activeCustomer.maxPatience}
                currentPatience={customerPatience}
                onPatienceChange={setCustomerPatience}
                onTimeout={handleCustomerTimeout}
                isPaused={isPaused}
              />
              <DiagnosticScreen 
                customer={activeCustomer}
                onBack={handleBackFromDiagnostic}
                onRepair={handleRepair}
              />
            </>
          );
        
        case 'minigame':
          // Render the appropriate mini-game based on current problem
          const miniGameProps = {
            onComplete: handleMiniGameComplete,
            speedMultiplier: effects.miniGameSpeed
          };
          
          if (currentProblem === 'cpu_overheating') {
            return <CleanCoolingGame {...miniGameProps} />;
          } else if (currentProblem === 'storage_full') {
            return <CleanFilesGame {...miniGameProps} />;
          } else if (currentProblem === 'virus') {
            return <VirusScanGame {...miniGameProps} />;
          }
          
          // Fallback - should not reach here
          return (
            <div className="mini-game" style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>ERROR: Unknown problem</h2>
              <p>Problem: {currentProblem}</p>
              <button onClick={() => handleMiniGameComplete(false)}>Continue</button>
            </div>
          );
        
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
    } catch (e) {
      console.error('renderScreen error:', e);
      return <div>ERROR: {e.message}</div>;
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
      
      {showWrongAnswer && activeCustomer && (
        <WrongAnswer 
          feedback={wrongFeedback}
          patienceLost={patienceLost}
          onContinue={handleContinueFromWrong}
        />
      )}

      {/* Business Dashboard Button */}
      {currentScreen === 'workshop' && !showDashboard && (
        <button 
          className="dashboard-btn"
          onClick={() => setShowDashboard(true)}
        >
          📊 Dashboard
        </button>
      )}

      {/* Business Dashboard */}
      {showDashboard && (
        <BusinessDashboard
          gameState={gameState}
          idleState={{
            ...idleState,
            getDailyExpenses: idleState.getDailyExpenses(),
            getAssistantEffects: getAssistantEffects(),
            getMarketingEffect: getMarketingEffect()
          }}
          onClose={() => setShowDashboard(false)}
          onHireAssistant={hireAssistant}
          onFireAssistant={fireAssistant}
          onStartMarketing={startMarketing}
          onCollectAchievement={dismissAchievement}
        />
      )}

      {/* Offline Earnings Popup */}
      {showOfflinePopup && offlineEarnings && (
        <OfflineEarningsPopup
          earnings={offlineEarnings.earnings}
          hoursAway={offlineEarnings.hoursAway}
          onCollect={collectOfflineEarnings}
          onDismiss={dismissOfflinePopup}
        />
      )}

      {/* Achievement Popup */}
      {pendingAchievement && (
        <AchievementPopup
          achievement={pendingAchievement}
          onDismiss={() => {
            dismissAchievement();
            checkAllAchievements();
          }}
        />
      )}
    </div>
  );
}

export default App;
