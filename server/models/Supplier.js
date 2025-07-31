const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Performance Metrics
  averageLeadTime: {
    type: Number,
    default: 7,
    min: 0
  },
  onTimeDeliveryRate: {
    type: Number,
    default: 0.95,
    min: 0,
    max: 1
  },
  qualityRating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Payment Terms
  paymentTerms: {
    type: String,
    enum: ['Net 30', 'Net 60', 'COD', '2/10 Net 30'],
    default: 'Net 30'
  },
  minimumOrderValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for supplier performance score
supplierSchema.virtual('performanceScore').get(function() {
  const leadTimeScore = Math.max(0, (14 - this.averageLeadTime) / 14); // Better if shorter
  const deliveryScore = this.onTimeDeliveryRate;
  const qualityScore = this.qualityRating / 5;
  
  return ((leadTimeScore + deliveryScore + qualityScore) / 3 * 100).toFixed(1);
});

supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Supplier', supplierSchema);