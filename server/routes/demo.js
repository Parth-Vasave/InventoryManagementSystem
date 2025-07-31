const express = require('express');
const { simulateDailySales } = require('../services/simulationService');
const { checkReorderPoints } = require('../services/reorderService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Simulate business activity for demo purposes
router.post('/simulate-day', auth, authorize('Admin'), async (req, res) => {
  try {
    console.log('🎬 Starting business day simulation...');
    
    // Simulate daily sales
    await simulateDailySales();
    
    // Check for reorder alerts
    const reorderProducts = await checkReorderPoints(req.io);
    
    res.json({
      message: 'Business day simulated successfully',
      reorderAlertsTriggered: reorderProducts?.length || 0,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Simulation failed', error: error.message });
  }
});

// Simulate multiple days for demo
router.post('/simulate-week', auth, authorize('Admin'), async (req, res) => {
  try {
    console.log('🎬 Starting week simulation...');
    
    let totalReorders = 0;
    
    for (let day = 1; day <= 7; day++) {
      await simulateDailySales();
      const reorderProducts = await checkReorderPoints(req.io);
      totalReorders += reorderProducts?.length || 0;
      
      // Small delay between days
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    res.json({
      message: 'Week simulation completed',
      totalReorderAlertsTriggered: totalReorders,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Week simulation failed', error: error.message });
  }
});

module.exports = router;