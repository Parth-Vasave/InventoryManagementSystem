const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      supplier,
      startDate,
      endDate 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('supplier', 'name contactPerson')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('supplier')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order
router.post('/', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { supplier, items, expectedDeliveryDate, notes } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      const totalCost = item.quantity * item.unitCost;
      totalAmount += totalCost;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost
      });
    }

    const order = new Order({
      supplier,
      items: orderItems,
      expectedDeliveryDate,
      totalAmount,
      notes,
      createdBy: req.user.userId
    });

    await order.save();
    await order.populate([
      { path: 'supplier', select: 'name contactPerson' },
      { path: 'items.product', select: 'name sku' },
      { path: 'createdBy', select: 'name' }
    ]);

    // Update supplier stats
    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { totalOrders: 1, totalValue: totalAmount }
    });

    // Emit real-time update
    req.io.emit('orderCreated', order);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { status, actualDeliveryDate } = req.body;
    
    const updateData = { status };
    if (actualDeliveryDate) {
      updateData.actualDeliveryDate = actualDeliveryDate;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'supplier', select: 'name contactPerson' },
      { path: 'items.product', select: 'name sku' }
    ]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order is delivered, update product stock
    if (status === 'Delivered') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { currentStock: item.quantity },
          lastRestocked: new Date()
        });
      }

      // Update supplier performance if delivery date is provided
      if (actualDeliveryDate) {
        const supplier = await Supplier.findById(order.supplier._id);
        const deliveryPerformance = order.deliveryPerformance;
        
        if (deliveryPerformance) {
          // Simple performance update - you can make this more sophisticated
          const newOnTimeRate = deliveryPerformance.onTime 
            ? Math.min(1, supplier.onTimeDeliveryRate + 0.01)
            : Math.max(0, supplier.onTimeDeliveryRate - 0.02);
          
          await Supplier.findByIdAndUpdate(order.supplier._id, {
            onTimeDeliveryRate: newOnTimeRate
          });
        }
      }

      // Emit stock updates
      for (const item of order.items) {
        const updatedProduct = await Product.findById(item.product._id)
          .populate('supplier', 'name contactPerson');
        req.io.emit('stockUpdated', updatedProduct);
      }
    }

    // Emit real-time update
    req.io.emit('orderUpdated', order);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate automatic reorder
router.post('/auto-reorder', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('supplier');
    
    const reorderProducts = products.filter(product => product.needsReorder());
    
    if (reorderProducts.length === 0) {
      return res.json({ message: 'No products need reordering' });
    }

    // Group products by supplier
    const supplierGroups = {};
    reorderProducts.forEach(product => {
      const supplierId = product.supplier._id.toString();
      if (!supplierGroups[supplierId]) {
        supplierGroups[supplierId] = {
          supplier: product.supplier,
          products: []
        };
      }
      supplierGroups[supplierId].products.push(product);
    });

    const createdOrders = [];

    // Create orders for each supplier
    for (const [supplierId, group] of Object.entries(supplierGroups)) {
      const items = group.products.map(product => ({
        product: product._id,
        quantity: product.getOptimalOrderQuantity(),
        unitCost: product.unitCost,
        totalCost: product.getOptimalOrderQuantity() * product.unitCost
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + group.supplier.averageLeadTime);

      const order = new Order({
        supplier: supplierId,
        items,
        expectedDeliveryDate,
        totalAmount,
        notes: 'Auto-generated reorder based on reorder points',
        isAutoGenerated: true,
        createdBy: req.user.userId
      });

      await order.save();
      await order.populate([
        { path: 'supplier', select: 'name contactPerson' },
        { path: 'items.product', select: 'name sku' }
      ]);

      createdOrders.push(order);

      // Update supplier stats
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { totalOrders: 1, totalValue: totalAmount }
      });
    }

    // Emit real-time updates
    createdOrders.forEach(order => {
      req.io.emit('orderCreated', order);
    });

    res.json({
      message: `${createdOrders.length} reorder(s) created successfully`,
      orders: createdOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;