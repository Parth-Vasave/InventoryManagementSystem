const Product = require('../models/Product');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Email transporter setup
const createTransporter = () => {
  if (!process.env.EMAIL_HOST) {
    console.log('Email configuration not found, skipping email notifications');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Check reorder points and send alerts
const checkReorderPoints = async (io) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('supplier', 'name contactPerson email');

    const reorderProducts = products.filter(product => product.needsReorder());

    if (reorderProducts.length === 0) {
      console.log('No products need reordering');
      return;
    }

    console.log(`Found ${reorderProducts.length} products needing reorder`);

    // Emit real-time alerts
    if (io) {
      io.emit('reorderAlert', {
        count: reorderProducts.length,
        products: reorderProducts.map(p => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          currentStock: p.currentStock,
          reorderPoint: p.reorderPoint,
          supplier: p.supplier.name
        }))
      });
    }

    // Send email notifications
    const transporter = createTransporter();
    if (transporter) {
      await sendReorderEmails(transporter, reorderProducts);
    }

    return reorderProducts;
  } catch (error) {
    console.error('Error checking reorder points:', error);
  }
};

// Send reorder email notifications
const sendReorderEmails = async (transporter, products) => {
  try {
    const emailContent = generateReorderEmailContent(products);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // In production, this would be manager emails
      subject: `SupplyFlow: ${products.length} Products Need Reordering`,
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Reorder notification email sent successfully');
  } catch (error) {
    console.error('Error sending reorder email:', error);
  }
};

// Generate email content
const generateReorderEmailContent = (products) => {
  const productRows = products.map(product => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.sku}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.currentStock}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.reorderPoint}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${Math.round(product.getOptimalOrderQuantity())}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.supplier.name}</td>
    </tr>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #d32f2f;">SupplyFlow Reorder Alert</h2>
        <p>The following products have reached their reorder points and need to be restocked:</p>
        
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product Name</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">SKU</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Current Stock</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Reorder Point</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Suggested Qty</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Supplier</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        
        <p style="margin-top: 20px;">
          <strong>Action Required:</strong> Please review these products and create purchase orders as needed.
        </p>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from SupplyFlow Inventory Management System.
        </p>
      </body>
    </html>
  `;
};

// Calculate EOQ for a product
const calculateEOQ = (annualDemand, orderingCost, unitCost, holdingCostRate) => {
  if (annualDemand === 0 || orderingCost === 0 || holdingCostRate === 0) {
    return 0;
  }
  const holdingCost = unitCost * holdingCostRate;
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
};

// Calculate reorder point
const calculateReorderPoint = (dailyDemand, leadTimeDays, safetyStock) => {
  return Math.ceil((dailyDemand * leadTimeDays) + safetyStock);
};

// Calculate safety stock
const calculateSafetyStock = (dailyDemand, demandVariability, leadTimeDays, serviceLevel = 0.95) => {
  const demandStdDev = dailyDemand * demandVariability;
  const zScore = serviceLevel >= 0.95 ? 1.645 : 1.28; // Z-score for service level
  return Math.ceil(zScore * demandStdDev * Math.sqrt(leadTimeDays));
};

module.exports = {
  checkReorderPoints,
  calculateEOQ,
  calculateReorderPoint,
  calculateSafetyStock
};