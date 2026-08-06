import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PARTS, 
  SUPPLIERS, 
  DEFAULT_STARTING_INVENTORY,
  getStorageCapacity,
  getLowStockThreshold,
  calculatePartPrice,
  isSupplierAvailable,
  getEmployeeInventoryBonuses,
  PROBLEM_PARTS
} from '../data/inventorySystem';

const STORAGE_KEY = 'bytefix_inventory_save';

// Default inventory state
const defaultInventoryState = {
  items: { ...DEFAULT_STARTING_INVENTORY },
  orders: [],
  currentDay: 1,
  totalSpent: 0,
  totalSaved: 0,
  failedDeliveries: 0,
  successfulDeliveries: 0
};

export function useInventory(gameState, addMoney) {
  const [inventoryState, setInventoryState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure items object exists with default values for new parts
        const items = { ...DEFAULT_STARTING_INVENTORY };
        Object.keys(parsed.items || {}).forEach(key => {
          items[key] = parsed.items[key];
        });
        return { ...defaultInventoryState, ...parsed, items };
      }
    } catch (e) {
      console.error('Failed to load inventory:', e);
    }
    return defaultInventoryState;
  });

  const [showDeliveryNotification, setShowDeliveryNotification] = useState(false);
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [showOrderFailedNotification, setShowOrderFailedNotification] = useState(false);
  const [failedOrderInfo, setFailedOrderInfo] = useState(null);

  // Save inventory state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryState));
    } catch (e) {
      console.error('Failed to save inventory:', e);
    }
  }, [inventoryState]);

  // Calculate storage capacity based on shop level
  const getCapacity = useCallback(() => {
    return getStorageCapacity(gameState.shopLevel);
  }, [gameState.shopLevel]);

  // Calculate current total items
  const getTotalItems = useCallback(() => {
    return Object.values(inventoryState.items).reduce((sum, qty) => sum + qty, 0);
  }, [inventoryState.items]);

  // Get available storage
  const getAvailableStorage = useCallback(() => {
    return getCapacity() - getTotalItems();
  }, [getCapacity, getTotalItems]);

  // Check if can add items
  const canAddItems = useCallback((amount) => {
    return getAvailableStorage() >= amount;
  }, [getAvailableStorage]);

  // Get item quantity
  const getItemQuantity = useCallback((partId) => {
    return inventoryState.items[partId] || 0;
  }, [inventoryState.items]);

  // Check if part is in stock
  const isInStock = useCallback((partId, quantity = 1) => {
    return getItemQuantity(partId) >= quantity;
  }, [getItemQuantity]);

  // Get low stock items
  const getLowStockItems = useCallback(() => {
    const threshold = getLowStockThreshold(gameState.shopLevel);
    const lowStock = [];
    
    Object.keys(PARTS).forEach(partId => {
      const qty = inventoryState.items[partId] || 0;
      if (qty <= threshold) {
        lowStock.push({
          partId,
          quantity: qty,
          threshold
        });
      }
    });
    
    return lowStock;
  }, [inventoryState.items, gameState.shopLevel]);

  // Add items to inventory
  const addItems = useCallback((partId, quantity) => {
    setInventoryState(prev => {
      const newItems = { ...prev.items };
      newItems[partId] = (newItems[partId] || 0) + quantity;
      return { ...prev, items: newItems };
    });
  }, []);

  // Remove items from inventory
  const removeItems = useCallback((partId, quantity) => {
    setInventoryState(prev => {
      const currentQty = prev.items[partId] || 0;
      if (currentQty < quantity) return prev;
      
      const newItems = { ...prev.items };
      newItems[partId] = currentQty - quantity;
      return { ...prev, items: newItems };
    });
  }, []);

  // Place an order
  const placeOrder = useCallback((partId, quantity, supplierId) => {
    const supplier = SUPPLIERS[supplierId];
    if (!supplier) return { success: false, reason: 'Invalid supplier' };
    
    // Check supplier availability
    if (!isSupplierAvailable(supplierId, gameState.shopLevel)) {
      return { success: false, reason: 'Supplier not available at your shop level' };
    }
    
    const price = calculatePartPrice(partId, supplierId);
    const totalCost = price * quantity;
    
    if (gameState.money < totalCost) {
      return { success: false, reason: 'Insufficient funds' };
    }
    
    // Check storage capacity
    if (!canAddItems(quantity)) {
      return { success: false, reason: 'Not enough storage space' };
    }
    
    // Apply manager discount if applicable
    const bonuses = getEmployeeInventoryBonuses(gameState.hiredAssistants || []);
    const finalCost = Math.floor(totalCost * (1 - bonuses.purchaseDiscount));
    
    // Deduct money
    addMoney(-finalCost);
    
    const order = {
      id: Date.now(),
      partId,
      quantity,
      supplierId,
      unitPrice: price,
      totalCost: finalCost,
      orderDay: inventoryState.currentDay,
      status: 'ordered'
    };
    
    setInventoryState(prev => ({
      ...prev,
      orders: [...prev.orders, order],
      totalSpent: prev.totalSpent + finalCost
    }));
    
    return { success: true, order };
  }, [gameState.money, gameState.shopLevel, gameState.hiredAssistants, inventoryState.currentDay, canAddItems, addMoney]);

  // Process order deliveries (call this on day change)
  const processDeliveries = useCallback(() => {
    setInventoryState(prev => {
      const updatedOrders = [];
      const deliveredItems = [];
      const failedOrders = [];
      let newItems = { ...prev.items };
      
      prev.orders.forEach(order => {
        if (order.status !== 'ordered') {
          updatedOrders.push(order);
          return;
        }
        
        const supplier = SUPPLIERS[order.supplierId];
        const arrivalDay = order.orderDay + (supplier?.deliveryDays || 1);
        
        if (prev.currentDay >= arrivalDay) {
          // Check reliability
          const reliability = supplier?.reliability || 0.95;
          
          if (Math.random() <= reliability) {
            // Delivery successful
            newItems[order.partId] = (newItems[order.partId] || 0) + order.quantity;
            deliveredItems.push({
              partId: order.partId,
              quantity: order.quantity,
              supplierId: order.supplierId
            });
            
            setInventoryState(s => ({
              ...s,
              successfulDeliveries: (s.successfulDeliveries || 0) + 1
            }));
          } else {
            // Delivery failed - refund
            failedOrders.push({
              partId: order.partId,
              quantity: order.quantity,
              cost: order.totalCost,
              reason: 'Delivery failed'
            });
            
            addMoney(order.totalCost);
            
            setInventoryState(s => ({
              ...s,
              failedDeliveries: (s.failedDeliveries || 0) + 1
            }));
          }
          
          // Mark order as processed
          updatedOrders.push({ ...order, status: 'delivered' });
        } else {
          updatedOrders.push(order);
        }
      });
      
      if (deliveredItems.length > 0) {
        setShowDeliveryNotification(true);
        setDeliveryItems(deliveredItems);
        setTimeout(() => setShowDeliveryNotification(false), 5000);
      }
      
      if (failedOrders.length > 0) {
        setShowOrderFailedNotification(true);
        setFailedOrderInfo(failedOrders);
        setTimeout(() => setShowOrderFailedNotification(false), 5000);
      }
      
      return {
        ...prev,
        orders: updatedOrders,
        items: newItems
      };
    });
  }, [addMoney]);

  // Advance game day
  const advanceDay = useCallback(() => {
    setInventoryState(prev => {
      const newDay = prev.currentDay + 1;
      return { ...prev, currentDay: newDay };
    });
  }, []);

  // Set day (for syncing with game time)
  const setDay = useCallback((day) => {
    setInventoryState(prev => ({ ...prev, currentDay: day }));
  }, []);

  // Consume parts for repair (with waste chance)
  const consumePartsForRepair = useCallback((problemId, repairSuccess = true) => {
    const problemParts = PROBLEM_PARTS[problemId];
    if (!problemParts) return { success: true, consumed: [] };
    
    const bonuses = getEmployeeInventoryBonuses(gameState.hiredAssistants || []);
    const consumed = [];
    
    setInventoryState(prev => {
      let newItems = { ...prev.items };
      
      problemParts.requiredParts.forEach(req => {
        if (req.optional) {
          // Optional parts: consume if available
          if (isInStock(req.partId, req.quantity)) {
            newItems[req.partId] = (newItems[req.partId] || 0) - req.quantity;
            consumed.push({ partId: req.partId, quantity: req.quantity });
          }
        } else {
          // Required parts: always consume
          const part = PARTS[req.partId];
          let quantityToConsume = req.quantity;
          
          // Apply waste reduction if repair failed
          if (!repairSuccess && part) {
            const wasteChance = part.wasteChance * (1 - bonuses.wasteReduction);
            if (Math.random() < wasteChance) {
              quantityToConsume += 1; // Waste one extra part
            }
          }
          
          newItems[req.partId] = (newItems[req.partId] || 0) - quantityToConsume;
          consumed.push({ partId: req.partId, quantity: quantityToConsume });
        }
      });
      
      return { ...prev, items: newItems };
    });
    
    return { success: true, consumed };
  }, [gameState.hiredAssistants]);

  // Check if repair can be performed (has required parts)
  const canPerformRepair = useCallback((problemId) => {
    const problemParts = PROBLEM_PARTS[problemId];
    if (!problemParts) return { canRepair: true, requiredParts: [], missingParts: [] };
    
    const requiredParts = [];
    const missingParts = [];
    
    problemParts.requiredParts.forEach(req => {
      const inStock = isInStock(req.partId, req.quantity);
      requiredParts.push({
        partId: req.partId,
        quantity: req.quantity,
        available: inStock,
        optional: req.optional
      });
      
      if (!inStock && !req.optional) {
        missingParts.push(req.partId);
      }
    });
    
    return {
      canRepair: missingParts.length === 0,
      requiredParts,
      missingParts
    };
  }, [isInStock]);

  // Get required parts for a problem
  const getRequiredParts = useCallback((problemId) => {
    const problemParts = PROBLEM_PARTS[problemId];
    if (!problemParts) return [];
    
    return problemParts.requiredParts.map(req => ({
      ...req,
      part: PARTS[req.partId],
      available: isInStock(req.partId, req.quantity),
      currentStock: getItemQuantity(req.partId)
    }));
  }, [isInStock, getItemQuantity]);

  // Get inventory value
  const getInventoryValue = useCallback(() => {
    let total = 0;
    Object.keys(inventoryState.items).forEach(partId => {
      const part = PARTS[partId];
      if (part) {
        total += (inventoryState.items[partId] || 0) * part.basePrice;
      }
    });
    return total;
  }, [inventoryState.items]);

  // Dismiss notifications
  const dismissDeliveryNotification = useCallback(() => {
    setShowDeliveryNotification(false);
    setDeliveryItems([]);
  }, []);

  const dismissFailedNotification = useCallback(() => {
    setShowOrderFailedNotification(false);
    setFailedOrderInfo(null);
  }, []);

  // Reset inventory
  const resetInventory = useCallback(() => {
    setInventoryState({ 
      ...defaultInventoryState, 
      items: { ...DEFAULT_STARTING_INVENTORY },
      currentDay: inventoryState.currentDay 
    });
  }, [inventoryState.currentDay]);

  // Get active orders
  const getActiveOrders = useCallback(() => {
    return inventoryState.orders.filter(o => o.status === 'ordered');
  }, [inventoryState.orders]);

  // Get order ETA
  const getOrderETA = useCallback((order) => {
    const supplier = SUPPLIERS[order.supplierId];
    const arrivalDay = order.orderDay + (supplier?.deliveryDays || 1);
    return Math.max(0, arrivalDay - inventoryState.currentDay);
  }, [inventoryState.currentDay]);

  return {
    // State
    inventoryState,
    
    // Inventory info
    getCapacity,
    getTotalItems,
    getAvailableStorage,
    getItemQuantity,
    getLowStockItems,
    getInventoryValue,
    
    // Checks
    canAddItems,
    isInStock,
    canPerformRepair,
    getRequiredParts,
    
    // Actions
    addItems,
    removeItems,
    placeOrder,
    consumePartsForRepair,
    processDeliveries,
    advanceDay,
    setDay,
    
    // Orders
    getActiveOrders,
    getOrderETA,
    
    // Notifications
    showDeliveryNotification,
    deliveryItems,
    dismissDeliveryNotification,
    showOrderFailedNotification,
    failedOrderInfo,
    dismissFailedNotification,
    
    // Reset
    resetInventory
  };
}
