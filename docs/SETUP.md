# SupplyFlow Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd supplyflow
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/supplyflow
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 5. Seed Sample Data
```bash
cd server
npm run seed
```

This will create:
- Admin user (admin@supplyflow.com / admin123)
- Sample suppliers
- Sample products with supply chain parameters

### 6. Start the Application

#### Development Mode (Recommended)
```bash
# From the root directory
npm run dev
```

This starts both frontend and backend concurrently.

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the server
npm start
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Default Login Credentials

- **Email**: admin@supplyflow.com
- **Password**: admin123

## Features Overview

### Core Features
- **Inventory Management**: Add, edit, delete products with comprehensive tracking
- **Smart Reordering**: EOQ calculations and automated reorder point alerts
- **Supplier Management**: Track supplier performance and lead times
- **Order Management**: Create and track purchase orders
- **Real-time Notifications**: Socket.io powered alerts for low stock and updates

### Analytics Features
- **Dashboard**: Key metrics and real-time insights
- **Inventory Analytics**: ABC analysis, category distribution, turnover rates
- **Order Analytics**: Trends, supplier performance, delivery tracking
- **Demand Forecasting**: Basic forecasting with moving averages

### Supply Chain Intelligence
- **EOQ Calculation**: Economic Order Quantity optimization
- **Reorder Point Logic**: ROP = (Average daily demand × Lead time) + Safety stock
- **Safety Stock**: Buffer stock calculations based on demand variability
- **ABC Analysis**: Product categorization by revenue contribution
- **Supplier Performance**: On-time delivery, quality ratings, lead time tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock levels
- `GET /api/products/alerts/reorder` - Get products needing reorder

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/auto-reorder` - Generate automatic reorders

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/inventory` - Inventory analytics
- `GET /api/analytics/orders` - Order analytics
- `GET /api/analytics/forecast` - Demand forecasting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for Atlas

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **Dependencies Issues**
   - Clear node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall: `npm install`

4. **CORS Issues**
   - Ensure frontend and backend URLs are correctly configured
   - Check CORS settings in server/index.js

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development
2. **Database Reset**: Run `npm run seed` to reset with fresh sample data
3. **API Testing**: Use tools like Postman or Thunder Client for API testing
4. **Logs**: Check console logs for detailed error information

## Production Deployment

### Environment Variables
Set these in your production environment:
- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- Email configuration for notifications

### Build Process
```bash
npm run build
```

### Deployment Options
- **Heroku**: Use provided Procfile
- **AWS/DigitalOcean**: Use PM2 for process management
- **Docker**: Dockerfile included for containerization

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Ensure all dependencies are properly installed
4. Verify environment configuration

## Next Steps

After setup, explore:
1. Create your own products and suppliers
2. Test the reorder functionality
3. Explore analytics and forecasting
4. Customize the supply chain parameters
5. Set up email notifications for alerts