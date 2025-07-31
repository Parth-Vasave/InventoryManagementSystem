// Realistic business simulation service
const Product = require('../models/Product');

// Simulate daily sales based on realistic patterns
const simulateDailySales = async () => {
  try {
    const products = await Product.find({ isActive: true });
    
    for (const product of products) {
      // Simulate sales based on product category and seasonality
      const baseDemand = product.annualDemand / 365;
      
      // Add realistic variability based on day of week, seasonality
      const dayOfWeek = new Date().getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      
      // Electronics sell more on weekdays, Clothing more on weekends
      const categoryFactor = product.category === 'Electronics' ? 
        (weekendFactor === 1.0 ? 1.2 : 0.8) : weekendFactor;
      
      const dailySales = Math.round(baseDemand * categoryFactor * (0.8 + Math.random() * 0.4));
      
      if (dailySales > 0 && product.currentStock >= dailySales) {
        product.currentStock -= dailySales;
        product.totalSold += dailySales;
        await product.save();
        
        console.log(`Simulated ${dailySales} sales for ${product.name}`);
      }
    }
  } catch (error) {
    console.error('Error in sales simulation:', error);
  }
};

// Simulate supplier delivery delays
const simulateDeliveryVariability = () => {
  // Add random delays based on supplier performance
  const baseLeadTime = 7; // days
  const performanceVariability = Math.random() * 0.3; // 0-30% variability
  
  return Math.round(baseLeadTime * (1 + performanceVariability));
};

// Simulate seasonal demand patterns
const getSeasonalFactor = (category) => {
  const month = new Date().getMonth();
  
  switch (category) {
    case 'Electronics':
      // Higher demand in Nov-Dec (holiday season)
      return month >= 10 ? 1.5 : 1.0;
    case 'Clothing':
      // Higher demand in Mar-Apr and Sep-Oct (season changes)
      return (month >= 2 && month <= 3) || (month >= 8 && month <= 9) ? 1.3 : 1.0;
    default:
      return 1.0;
  }
};

module.exports = {
  simulateDailySales,
  simulateDeliveryVariability,
  getSeasonalFactor
};