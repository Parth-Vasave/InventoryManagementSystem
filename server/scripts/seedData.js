const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@supplyflow.com',
      password: 'admin123',
      role: 'Admin'
    });
    await adminUser.save();

    // Create sample suppliers
    const suppliers = [
      {
        name: 'TechCorp Solutions',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0101',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        averageLeadTime: 5,
        onTimeDeliveryRate: 0.95,
        qualityRating: 4.5
      },
      {
        name: 'Global Electronics Ltd',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@globalelectronics.com',
        phone: '+1-555-0102',
        address: {
          street: '456 Electronics Ave',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        },
        averageLeadTime: 7,
        onTimeDeliveryRate: 0.92,
        qualityRating: 4.2
      },
      {
        name: 'Fashion Forward Inc',
        contactPerson: 'Mike Chen',
        email: 'mike@fashionforward.com',
        phone: '+1-555-0103',
        address: {
          street: '789 Fashion Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        averageLeadTime: 10,
        onTimeDeliveryRate: 0.88,
        qualityRating: 4.0
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log('Created suppliers');

    // Create sample products
    const products = [
      {
        sku: 'LAPTOP-001',
        name: 'Business Laptop Pro',
        description: 'High-performance laptop for business use',
        category: 'Electronics',
        currentStock: 25,
        reorderPoint: 10,
        maxStock: 100,
        unitCost: 800,
        sellingPrice: 1200,
        supplier: createdSuppliers[0]._id,
        annualDemand: 120,
        orderingCost: 50,
        holdingCostRate: 0.2,
        leadTimeDays: 5,
        demandVariability: 0.15
      },
      {
        sku: 'PHONE-001',
        name: 'Smartphone X1',
        description: 'Latest smartphone with advanced features',
        category: 'Electronics',
        currentStock: 8,
        reorderPoint: 15,
        maxStock: 80,
        unitCost: 400,
        sellingPrice: 699,
        supplier: createdSuppliers[1]._id,
        annualDemand: 200,
        orderingCost: 40,
        holdingCostRate: 0.25,
        leadTimeDays: 7,
        demandVariability: 0.2
      },
      {
        sku: 'SHIRT-001',
        name: 'Cotton Business Shirt',
        description: 'Professional cotton shirt for office wear',
        category: 'Clothing',
        currentStock: 50,
        reorderPoint: 20,
        maxStock: 200,
        unitCost: 25,
        sellingPrice: 49,
        supplier: createdSuppliers[2]._id,
        annualDemand: 300,
        orderingCost: 30,
        holdingCostRate: 0.15,
        leadTimeDays: 10,
        demandVariability: 0.1
      },
      {
        sku: 'TABLET-001',
        name: 'Professional Tablet',
        description: 'Tablet for professional and creative work',
        category: 'Electronics',
        currentStock: 5,
        reorderPoint: 12,
        maxStock: 60,
        unitCost: 300,
        sellingPrice: 499,
        supplier: createdSuppliers[0]._id,
        annualDemand: 80,
        orderingCost: 45,
        holdingCostRate: 0.22,
        leadTimeDays: 5,
        demandVariability: 0.18
      },
      {
        sku: 'HEADPHONE-001',
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        category: 'Electronics',
        currentStock: 30,
        reorderPoint: 15,
        maxStock: 100,
        unitCost: 80,
        sellingPrice: 149,
        supplier: createdSuppliers[1]._id,
        annualDemand: 150,
        orderingCost: 35,
        holdingCostRate: 0.18,
        leadTimeDays: 7,
        demandVariability: 0.12
      }
    ];

    await Product.insertMany(products);
    console.log('Created products');

    console.log('Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@supplyflow.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();