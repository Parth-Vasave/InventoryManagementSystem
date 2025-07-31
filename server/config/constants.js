// Application constants
module.exports = {
  // User roles
  USER_ROLES: {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    STAFF: 'Staff'
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  },

  // Product categories
  PRODUCT_CATEGORIES: [
    'Electronics',
    'Clothing',
    'Food',
    'Books',
    'Home',
    'Sports',
    'Other'
  ],

  // Payment terms
  PAYMENT_TERMS: [
    'Net 30',
    'Net 60',
    'COD',
    '2/10 Net 30'
  ],

  // Default values
  DEFAULTS: {
    ORDERING_COST: 50,
    HOLDING_COST_RATE: 0.2,
    LEAD_TIME_DAYS: 7,
    DEMAND_VARIABILITY: 0.1,
    SERVICE_LEVEL: 0.95
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  }
};