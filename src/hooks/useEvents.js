import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SPECIAL_CUSTOMER_TYPES,
  RANDOM_EVENTS,
  TEMPORARY_BUFFS,
  generateContract,
  generateRandomEvent,
  generateOpportunity,
  DEFAULT_EVENT_STATE,
  DECISION_OUTCOMES
} from '../data/eventsSystem';

const STORAGE_KEY = 'bytefix_events_save';

// Event generation intervals (in game days)
const NORMAL_EVENT_INTERVAL = 5;
const MAJOR_EVENT_INTERVAL = 15;

export function useEvents(gameState, addMoney, companyState, marketState, idleState) {
  const [eventState, setEventState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up expired buffs
        const now = Date.now();
        parsed.activeBuffs = (parsed.activeBuffs || []).filter(
          buff => !buff.expiresAt || buff.expiresAt > now
        );
        return { ...DEFAULT_EVENT_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load events state:', e);
    }
    return DEFAULT_EVENT_STATE;
  });

  const [currentDecision, setCurrentDecision] = useState(null);
  const [notification, setNotification] = useState(null);
  const lastEventDayRef = useRef(0);
  const lastMajorEventDayRef = useRef(0);

  // Save event state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventState));
    } catch (e) {
      console.error('Failed to save events state:', e);
    }
  }, [eventState]);

  // Get active buffs effect
  const getActiveBuffsEffect = useCallback(() => {
    const effects = {
      customerFlow: 1,
      reputationGain: 1,
      partsDiscount: 0,
      workshopEfficiency: 1,
      premiumCustomerChance: 0,
      budgetCustomerChance: 0,
      supplierBonus: null,
      branchEfficiency: 1
    };

    eventState.activeBuffs.forEach(buff => {
      if (buff.effect.customerFlow) effects.customerFlow += buff.effect.customerFlow;
      if (buff.effect.reputationGain) effects.reputationGain += buff.effect.reputationGain;
      if (buff.effect.partsDiscount) effects.partsDiscount += buff.effect.partsDiscount;
      if (buff.effect.workshopEfficiency) effects.workshopEfficiency += buff.effect.workshopEfficiency;
      if (buff.effect.premiumCustomerChance) effects.premiumCustomerChance += buff.effect.premiumCustomerChance;
      if (buff.effect.budgetCustomerChance) effects.budgetCustomerChance += buff.effect.budgetCustomerChance;
      if (buff.effect.supplierBonus) effects.supplierBonus = buff.effect.supplierBonus;
      if (buff.effect.branchEfficiency) effects.branchEfficiency += buff.effect.branchEfficiency;
    });

    return effects;
  }, [eventState.activeBuffs]);

  // Add notification
  const addNotification = useCallback((message, type = 'info', icon = '💡') => {
    const newNotification = { id: Date.now(), message, type, icon };
    setNotification(newNotification);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Add to event history
  const addToHistory = useCallback((event, decision = null, result = null) => {
    setEventState(prev => ({
      ...prev,
      eventHistory: [
        {
          id: Date.now(),
          day: marketState.currentDay || 1,
          event: event.name,
          eventIcon: event.icon,
          decision,
          result,
          timestamp: new Date().toISOString()
        },
        ...prev.eventHistory.slice(0, 49) // Keep last 50 events
      ]
    }));
  }, [marketState.currentDay]);

  // Check for special customer
  const checkForSpecialCustomer = useCallback(() => {
    // Check if we already have a special customer in queue
    if (eventState.specialCustomerQueue.length > 0) {
      return eventState.specialCustomerQueue[0];
    }

    // Random chance to spawn special customer
    const customerTypes = Object.values(SPECIAL_CUSTOMER_TYPES);
    let totalWeight = 0;
    customerTypes.forEach(type => {
      totalWeight += type.frequency || 0.05;
    });

    if (Math.random() > totalWeight) return null;

    // Weighted random selection
    let random = Math.random() * totalWeight;
    let selectedType = customerTypes[0];

    for (const type of customerTypes) {
      random -= type.frequency || 0.05;
      if (random <= 0) {
        selectedType = type;
        break;
      }
    }

    // Check requirements
    if (selectedType.id === 'corporate' && (companyState.tier || 1) < 3) return null;
    if (selectedType.id === 'influencer' && gameState.reputation < 50) return null;

    return {
      ...selectedType,
      isSpecial: true,
      specialType: selectedType.id
    };
  }, [eventState.specialCustomerQueue, companyState.tier, gameState.reputation]);

  // Add special customer to queue
  const queueSpecialCustomer = useCallback((customer) => {
    if (customer?.isSpecial) {
      setEventState(prev => ({
        ...prev,
        specialCustomerQueue: [...prev.specialCustomerQueue, customer]
      }));
    }
  }, []);

  // Remove special customer from queue
  const clearSpecialCustomer = useCallback(() => {
    setEventState(prev => ({
      ...prev,
      specialCustomerQueue: prev.specialCustomerQueue.slice(1)
    }));
  }, []);

  // Process decision
  const processDecision = useCallback((eventId, choiceId) => {
    const event = RANDOM_EVENTS[eventId];
    if (!event || !event.decision) return;

    const choice = event.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    // Apply cost
    if (choice.cost > 0) {
      addMoney(-choice.cost);
    }

    // Apply effects
    if (choice.effect) {
      const now = Date.now();
      const durationDays = choice.effect.duration || event.duration || 1;
      const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;

      if (choice.effect.customerFlow !== undefined) {
        const isBuff = choice.effect.customerFlow > 0;
        addBuff({
          id: `${eventId}_${choiceId}_${Date.now()}`,
          name: isBuff ? 'Marketing Campaign' : 'Customer Downturn',
          icon: event.icon,
          effect: { customerFlow: choice.effect.customerFlow },
          expiresAt,
          type: isBuff ? 'buff' : 'debuff'
        });
      }

      if (choice.effect.partsDiscount) {
        addBuff({
          id: `parts_${Date.now()}`,
          name: 'Parts Discount',
          icon: '💰',
          effect: { partsDiscount: choice.effect.partsDiscount },
          expiresAt,
          type: 'buff'
        });
      }

      if (choice.effect.reputation) {
        // Direct reputation bonus handled elsewhere
      }

      if (choice.effect.workshopEfficiency !== undefined && choice.effect.workshopEfficiency < 0) {
        addBuff({
          id: `workshop_${Date.now()}`,
          name: 'Equipment Issues',
          icon: '🔧',
          effect: { workshopEfficiency: choice.effect.workshopEfficiency },
          expiresAt,
          type: 'debuff'
        });
      }
    }

    // Handle risk-based outcomes
    let outcome = choice.outcome;
    if (choice.risk && Math.random() < choice.risk) {
      outcome = 'bad';
    }

    // Record result
    addToHistory(event, choice.label, DECISION_OUTCOMES[outcome]?.label || outcome);

    // Show notification
    addNotification(
      `${event.name}: ${choice.label} - ${DECISION_OUTCOMES[outcome]?.label}`,
      outcome === 'good' ? 'success' : outcome === 'bad' ? 'error' : 'warning',
      event.icon
    );

    setCurrentDecision(null);
  }, [addMoney, addToHistory, addNotification]);

  // Add buff
  const addBuff = useCallback((buff) => {
    setEventState(prev => ({
      ...prev,
      activeBuffs: [...prev.activeBuffs, buff]
    }));
  }, []);

  // Remove expired buffs
  const cleanupExpiredBuffs = useCallback(() => {
    const now = Date.now();
    setEventState(prev => ({
      ...prev,
      activeBuffs: prev.activeBuffs.filter(buff => !buff.expiresAt || buff.expiresAt > now)
    }));
  }, []);

  // Add contract
  const addContract = useCallback((contract) => {
    setEventState(prev => ({
      ...prev,
      availableContracts: [...prev.availableContracts, contract]
    }));
    addNotification(
      `New contract available: ${contract.name}`,
      'info',
      contract.icon
    );
  }, [addNotification]);

  // Accept contract
  const acceptContract = useCallback((contractId) => {
    const contract = eventState.availableContracts.find(c => c.id === contractId);
    if (!contract) return { success: false, reason: 'Contract not found' };

    setEventState(prev => ({
      ...prev,
      availableContracts: prev.availableContracts.filter(c => c.id !== contractId),
      activeContracts: [
        ...prev.activeContracts,
        {
          ...contract,
          status: 'active',
          startDay: marketState.currentDay || 1,
          deadline: (marketState.currentDay || 1) + contract.duration
        }
      ]
    }));

    addNotification(`Contract started: ${contract.name}`, 'success', contract.icon);
    return { success: true };
  }, [eventState.availableContracts, marketState.currentDay, addNotification]);

  // Decline contract
  const declineContract = useCallback((contractId) => {
    setEventState(prev => ({
      ...prev,
      availableContracts: prev.availableContracts.filter(c => c.id !== contractId)
    }));
  }, []);

  // Update contract progress
  const updateContractProgress = useCallback((repairCategory) => {
    let updated = false;

    setEventState(prev => ({
      ...prev,
      activeContracts: prev.activeContracts.map(contract => {
        if (contract.status !== 'active') return contract;

        // Check if repair category matches requirements
        if (contract.requirements?.categories?.includes(repairCategory)) {
          const newCompleted = contract.completedRepairs + 1;
          updated = true;

          if (newCompleted >= contract.requiredRepairs) {
            // Contract completed
            addMoney(contract.reward);
            addToHistory(
              { name: contract.name, icon: contract.icon },
              'Contract Completed',
              `+$${contract.reward.toLocaleString()}`
            );

            return {
              ...contract,
              status: 'completed',
              completedRepairs: newCompleted
            };
          }

          return {
            ...contract,
            completedRepairs: newCompleted
          };
        }

        return contract;
      }).map(contract => {
        // Check for expired contracts
        if (contract.status === 'active' && contract.deadline <= (marketState.currentDay || 1)) {
          addToHistory(
            { name: contract.name, icon: contract.icon },
            'Contract Expired',
            'Failed to complete in time'
          );
          return { ...contract, status: 'expired' };
        }
        return contract;
      })
    }));

    return updated;
  }, [marketState.currentDay, addMoney, addToHistory]);

  // Process random event
  const processRandomEvent = useCallback(() => {
    const currentDay = marketState.currentDay || 1;

    // Check intervals
    if (currentDay - lastEventDayRef.current < NORMAL_EVENT_INTERVAL) return null;
    if (currentDay - lastMajorEventDayRef.current < MAJOR_EVENT_INTERVAL) return null;

    const isMajor = Math.random() < 0.2;
    if (isMajor) {
      lastMajorEventDayRef.current = currentDay;
    }
    lastEventDayRef.current = currentDay;

    const event = generateRandomEvent(gameState, marketState);
    if (!event) return null;

    if (event.decision) {
      setCurrentDecision({
        eventId: event.id,
        event,
        title: event.name,
        description: event.description,
        choices: event.choices.map(choice => ({
          id: choice.id,
          label: choice.label,
          cost: choice.cost || 0,
          description: choice.label
        }))
      });
    } else {
      // Apply effect immediately
      applyEventEffect(event);
      addToHistory(event, 'Automatic', 'Effect Applied');
    }

    return event;
  }, [gameState, marketState, addToHistory]);

  // Apply event effect
  const applyEventEffect = useCallback((event) => {
    if (!event.effect) return;

    const now = Date.now();
    const durationDays = event.duration || 1;
    const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;

    const effects = event.effect;

    if (effects.categoryDemand) {
      const category = effects.categoryDemand.category === 'random'
        ? ['gpu', 'cpu', 'virus', 'storage'][Math.floor(Math.random() * 4)]
        : effects.categoryDemand.category;
      addBuff({
        id: `demand_${event.id}_${Date.now()}`,
        name: `${category} Demand Surge`,
        icon: '📈',
        effect: { categoryDemand: { category, multiplier: effects.categoryDemand.multiplier } },
        expiresAt,
        type: 'buff'
      });
    }

    if (effects.reputation) {
      // Direct reputation handled elsewhere
    }

    if (effects.customerFlow) {
      addBuff({
        id: `flow_${Date.now()}`,
        name: 'Customer Flow Effect',
        icon: '👥',
        effect: { customerFlow: effects.customerFlow },
        expiresAt,
        type: effects.customerFlow > 0 ? 'buff' : 'debuff'
      });
    }
  }, [addBuff]);

  // Generate opportunity
  const generateNewOpportunity = useCallback(() => {
    const opportunity = generateOpportunity(gameState, companyState);
    if (opportunity) {
      setEventState(prev => ({
        ...prev,
        opportunities: [...prev.opportunities, { ...opportunity, generatedAt: Date.now() }]
      }));
      addNotification(
        `New opportunity: ${opportunity.data.name}`,
        'info',
        opportunity.data.icon
      );
    }
    return opportunity;
  }, [gameState, companyState, addNotification]);

  // Process opportunity
  const processOpportunity = useCallback((opportunityId, action) => {
    const opp = eventState.opportunities.find(o => o.data.id === opportunityId);
    if (!opp) return;

    if (opp.type === 'contract' && action === 'accept') {
      acceptContract(opp.data.id);
    }

    if (opp.type === 'supplier' && action === 'accept') {
      addMoney(-opp.data.cost);
      addBuff({
        id: `supplier_${Date.now()}`,
        name: opp.data.name,
        icon: opp.data.icon,
        effect: { partsDiscount: opp.data.discount },
        expiresAt: Date.now() + opp.data.duration * 24 * 60 * 60 * 1000,
        type: 'buff'
      });
    }

    if (opp.type === 'marketing' && action === 'accept') {
      addMoney(-opp.data.cost);
      addBuff({
        id: `marketing_${Date.now()}`,
        name: opp.data.name,
        icon: opp.data.icon,
        effect: { customerFlow: opp.data.effect.customerFlow },
        expiresAt: Date.now() + opp.data.duration * 24 * 60 * 60 * 1000,
        type: 'buff'
      });
    }

    if (opp.type === 'expansion' && action === 'accept') {
      // Expansion handled elsewhere - this would trigger branch purchase
    }

    setEventState(prev => ({
      ...prev,
      opportunities: prev.opportunities.filter(o => o.data.id !== opportunityId)
    }));
  }, [eventState.opportunities, addMoney, acceptContract, addBuff]);

  // Daily event processing (called from game loop)
  const processDailyEvents = useCallback(() => {
    cleanupExpiredBuffs();

    // Generate contracts occasionally
    if (eventState.availableContracts.length < 2 && Math.random() < 0.15) {
      const contractTypes = ['school', 'retail', 'realEstate'];
      if ((companyState.tier || 1) >= 3) contractTypes.push('gaming', 'corporate');
      const typeId = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const contract = generateContract(typeId, Math.min(gameState.shopLevel || 1, 3));
      addContract(contract);
    }

    // Generate random events
    processRandomEvent();

    // Generate opportunities occasionally
    if (eventState.opportunities.length < 1 && Math.random() < 0.1) {
      generateNewOpportunity();
    }
  }, [
    cleanupExpiredBuffs,
    eventState.availableContracts.length,
    eventState.opportunities.length,
    companyState.tier,
    gameState.shopLevel,
    addContract,
    processRandomEvent,
    generateNewOpportunity
  ]);

  // Get contract stats
  const getContractStats = useCallback(() => {
    return {
      available: eventState.availableContracts.length,
      active: eventState.activeContracts.length,
      completed: eventState.completedContracts.length,
      totalReward: eventState.completedContracts.reduce((sum, c) => sum + c.reward, 0)
    };
  }, [eventState]);

  // Reset events
  const resetEvents = useCallback(() => {
    setEventState(DEFAULT_EVENT_STATE);
  }, []);

  return {
    // State
    eventState,

    // Effects
    getActiveBuffsEffect,

    // Notifications
    addNotification,
    notification,

    // Special customers
    checkForSpecialCustomer,
    queueSpecialCustomer,
    clearSpecialCustomer,

    // Decisions
    currentDecision,
    processDecision,

    // Buffs
    addBuff,
    cleanupExpiredBuffs,

    // Contracts
    addContract,
    acceptContract,
    declineContract,
    updateContractProgress,
    getContractStats,

    // Events
    processRandomEvent,
    processDailyEvents,

    // Opportunities
    generateNewOpportunity,
    processOpportunity,

    // History
    addToHistory,

    // Reset
    resetEvents
  };
}
