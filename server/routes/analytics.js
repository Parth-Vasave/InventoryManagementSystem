const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Dashboard overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      pendingOrders,
      totalSuppliers,
      recentOrders,
      topProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.find({ isActive: true }).then(products => 
        products.filter(p => p.needsReorder()).length
      ),
      Order.countDocuments({ status: { $in: ['Pending', 'Confirmed'] } }),
      Supplier.countDocuments({ isActive: true }),
      Order.find()
        .populate('supplier', 'name')
        .sort({ orderDate: -1 })
        .limit(5),
      Product.find({ isActive: true })
        .sort({ totalSold: -1 })
        .limit(5)
        .populate('supplier', 'name')
    ]);

    // Calculate total inventory value
    const products = await Product.find({ isActive: true });
    const totalInventoryValue = products.reduce((sum, product) => 
      sum + (product.currentStock * product.unitCost), 0
    );

    res.json({
      overview: {
        totalProducts,
        lowStockProducts,
        pendingOrders,
        totalSuppliers,
        totalInventoryValue
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Inventory analytics
router.get('/inventory', auth, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('supplier', 'name');

    // Category distribution
    const categoryStats = {};
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          count: 0,
          value: 0,
          lowStock: 0
        };
      }
      categoryStats[product.category].count++;
      categoryStats[product.category].value += product.currentStock * product.unitCost;
      if (product.needsReorder()) {
        categoryStats[product.category].lowStock++;
      }
    });

    // ABC Analysis
    const sortedProducts = products
      .map(product => ({
        ...product.toObject(),
        totalValue: product.currentStock * product.unitCost
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const totalValue = sortedProducts.reduce((sum, p) => sum + p.totalValue, 0);
    let cumulativeValue = 0;
    const abcAnalysis = { A: [], B: [], C: [] };

    sortedProducts.forEach(product => {
      cumulativeValue += product.totalValue;
      const percentage = (cumulativeValue / totalValue) * 100;
      
      if (percentage <= 80) {
        abcAnalysis.A.push(product);
      } else if (percentage <= 95) {
        abcAnalysis.B.push(product);
      } else {
        abcAnalysis.C.push(product);
      }
    });

    // Inventory turnover analysis
    const turnoverAnalysis = products.map(product => ({
      name: product.name,
      sku: product.sku,
      turnover: product.inventoryTurnover,
      category: product.category
    })).sort((a, b) => b.turnover - a.turnover);

    res.json({
      categoryStats,
      abcAnalysis: {
        A: { count: abcAnalysis.A.length, percentage: 80 },
        B: { count: abcAnalysis.B.length, percentage: 15 },
        C: { count: abcAnalysis.C.length, percentage: 5 }
      },
      turnoverAnalysis: turnoverAnalysis.slice(0, 10),
      totalInventoryValue: totalValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Order analytics
router.get('/orders', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      orderDate: { $gte: startDate }
    }).populate('supplier', 'name');

    // Order trends
    const orderTrends = {};
    orders.forEach(order => {
      const date = order.orderDate.toISOString().split('T')[0];
      if (!orderTrends[date]) {
        orderTrends[date] = { count: 0, value: 0 };
      }
      orderTrends[date].count++;
      orderTrends[date].value += order.totalAmount;
    });

    // Status distribution
    const statusStats = {};
    orders.forEach(order => {
      statusStats[order.status] = (statusStats[order.status] || 0) + 1;
    });

    // Supplier performance
    const supplierStats = {};
    orders.forEach(order => {
      const supplierId = order.supplier._id.toString();
      if (!supplierStats[supplierId]) {
        supplierStats[supplierId] = {
          name: order.supplier.name,
          orderCount: 0,
          totalValue: 0,
          onTimeDeliveries: 0,
          totalDeliveries: 0
        };
      }
      supplierStats[supplierId].orderCount++;
      supplierStats[supplierId].totalValue += order.totalAmount;
      
      if (order.status === 'Delivered') {
        supplierStats[supplierId].totalDeliveries++;
        if (order.deliveryPerformance && order.deliveryPerformance.onTime) {
          supplierStats[supplierId].onTimeDeliveries++;
        }
      }
    });

    res.json({
      orderTrends,
      statusStats,
      supplierStats: Object.values(supplierStats),
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Demand forecasting (basic)
router.get('/forecast', auth, async (req, res) => {
  try {
    const { productId, days = 30 } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Simple moving average forecast
    const forecastDays = parseInt(days);
    const dailyDemand = product.annualDemand / 365;
    
    // Generate forecast with some variability
    const forecast = [];
    for (let i = 1; i <= forecastDays; i++) {
      const basedemand = dailyDemand;
      const variability = basedemand * product.demandVariability;
      const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
      const forecastDemand = Math.max(0, basedemand + (variability * randomFactor));
      
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        demand: Math.round(forecastDemand * 100) / 100
      });
    }

    // Calculate recommended actions
    const currentStock = product.currentStock;
    const totalForecastDemand = forecast.reduce((sum, f) => sum + f.demand, 0);
    const recommendedAction = currentStock < totalForecastDemand 
      ? 'Reorder recommended' 
      : 'Stock sufficient';

    res.json({
      product: {
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        reorderPoint: product.reorderPoint
      },
      forecast,
      summary: {
        totalForecastDemand: Math.round(totalForecastDemand * 100) / 100,
        recommendedAction,
        stockoutRisk: currentStock < totalForecastDemand ? 'High' : 'Low'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;