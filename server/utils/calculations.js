/**
 * Supply Chain Calculation Utilities
 */

/**
 * Calculate Economic Order Quantity (EOQ)
 * Formula: EOQ = √((2 × Annual Demand × Ordering Cost) / Holding Cost)
 */
const calculateEOQ = (annualDemand, orderingCost, unitCost, holdingCostRate) => {
  if (annualDemand === 0 || orderingCost === 0 || holdingCostRate === 0) {
    return 0;
  }
  const holdingCost = unitCost * holdingCostRate;
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
};

/**
 * Calculate Reorder Point (ROP)
 * Formula: ROP = (Average daily demand × Lead time) + Safety stock
 */
const calculateReorderPoint = (dailyDemand, leadTimeDays, safetyStock) => {
  return Math.ceil((dailyDemand * leadTimeDays) + safetyStock);
};

/**
 * Calculate Safety Stock
 * Formula: Safety Stock = Z-score × Demand Std Dev × √Lead Time
 */
const calculateSafetyStock = (dailyDemand, demandVariability, leadTimeDays, serviceLevel = 0.95) => {
  const demandStdDev = dailyDemand * demandVariability;
  const zScore = serviceLevel >= 0.95 ? 1.645 : 1.28; // Z-score for service level
  return Math.ceil(zScore * demandStdDev * Math.sqrt(leadTimeDays));
};

/**
 * Calculate Inventory Turnover
 * Formula: Inventory Turnover = Cost of Goods Sold / Average Inventory Value
 */
const calculateInventoryTurnover = (totalSold, unitCost, currentStock) => {
  if (currentStock === 0) return 0;
  const cogs = totalSold * unitCost;
  const avgInventory = currentStock * unitCost;
  return avgInventory > 0 ? cogs / avgInventory : 0;
};

/**
 * Perform ABC Analysis on products
 * Categorizes products based on their contribution to total inventory value
 */
const performABCAnalysis = (products) => {
  // Calculate total value for each product
  const productsWithValue = products.map(product => ({
    ...product,
    totalValue: product.currentStock * product.unitCost
  }));

  // Sort by value (highest first)
  const sortedProducts = productsWithValue.sort((a, b) => b.totalValue - a.totalValue);

  const totalValue = sortedProducts.reduce((sum, p) => sum + p.totalValue, 0);
  let cumulativeValue = 0;
  const abcAnalysis = { A: [], B: [], C: [] };

  sortedProducts.forEach(product => {
    cumulativeValue += product.totalValue;
    const percentage = (cumulativeValue / totalValue) * 100;
    
    if (percentage <= 80) {
      abcAnalysis.A.push(product);      // Top 80% of value
    } else if (percentage <= 95) {
      abcAnalysis.B.push(product);      // Next 15% of value  
    } else {
      abcAnalysis.C.push(product);      // Bottom 5% of value
    }
  });

  return abcAnalysis;
};

/**
 * Calculate supplier performance score
 */
const calculateSupplierPerformance = (averageLeadTime, onTimeDeliveryRate, qualityRating) => {
  const leadTimeScore = Math.max(0, (14 - averageLeadTime) / 14); // Better if shorter
  const deliveryScore = onTimeDeliveryRate;
  const qualityScore = qualityRating / 5;
  
  return ((leadTimeScore + deliveryScore + qualityScore) / 3 * 100);
};

module.exports = {
  calculateEOQ,
  calculateReorderPoint,
  calculateSafetyStock,
  calculateInventoryTurnover,
  performABCAnalysis,
  calculateSupplierPerformance
};