const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Other']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0
  },
  maxStock: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // EOQ Calculation Parameters
  annualDemand: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  orderingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 50
  },
  holdingCostRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.2 // 20% of unit cost
  },
  // Safety Stock Parameters
  leadTimeDays: {
    type: Number,
    required: true,
    min: 0,
    default: 7
  },
  demandVariability: {
    type: Number,
    min: 0,
    default: 0.1 // 10% variability
  },
  serviceLevel: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.95 // 95% service level
  },
  // Tracking
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  totalSold: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for EOQ calculation
productSchema.virtual('eoq').get(function() {
  if (this.annualDemand === 0 || this.orderingCost === 0 || this.holdingCostRate === 0) {
    return 0;
  }
  const holdingCost = this.unitCost * this.holdingCostRate;
  return Math.sqrt((2 * this.annualDemand * this.orderingCost) / holdingCost);
});

// Virtual for safety stock calculation
productSchema.virtual('safetyStock').get(function() {
  const dailyDemand = this.annualDemand / 365;
  const demandStdDev = dailyDemand * this.demandVariability;
  // Z-score for 95% service level ≈ 1.645
  const zScore = this.serviceLevel >= 0.95 ? 1.645 : 1.28;
  return Math.ceil(zScore * demandStdDev * Math.sqrt(this.leadTimeDays));
});

// Virtual for inventory turnover
productSchema.virtual('inventoryTurnover').get(function() {
  if (this.currentStock === 0) return 0;
  const cogs = this.totalSold * this.unitCost;
  const avgInventory = this.currentStock * this.unitCost;
  return avgInventory > 0 ? cogs / avgInventory : 0;
});

// Method to check if reorder is needed
productSchema.methods.needsReorder = function() {
  return this.currentStock <= this.reorderPoint;
};

// Method to calculate optimal reorder quantity
productSchema.methods.getOptimalOrderQuantity = function() {
  const eoq = this.eoq;
  const currentDeficit = Math.max(0, this.reorderPoint - this.currentStock);
  return Math.max(eoq, currentDeficit);
};

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);