# SupplyFlow Project Structure

## 📁 Root Directory
```
supplyflow/
├── client/                 # React frontend application
├── server/                 # Node.js backend application
├── docs/                   # Project documentation
├── .gitignore             # Git ignore rules
├── package.json           # Root package.json for scripts
└── README.md              # Main project documentation
```

## 🖥️ Client Structure (React Frontend)
```
client/
├── public/                # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/        # Reusable React components
│   │   ├── common/        # Common UI components
│   │   │   ├── LoadingSpinner.js
│   │   │   └── StatusChip.js
│   │   ├── Layout/        # Layout components
│   │   │   ├── Layout.js
│   │   │   └── NotificationPanel.js
│   │   ├── DemoControls.js
│   │   └── ProtectedRoute.js
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── Analytics.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Orders.js
│   │   ├── Products.js
│   │   └── Suppliers.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── utils/             # Utility functions
│   ├── App.js             # Main App component
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # Client dependencies
└── package-lock.json      # Lock file
```

## 🖧 Server Structure (Node.js Backend)
```
server/
├── config/                # Configuration files
│   ├── constants.js       # Application constants
│   └── database.js        # Database connection
├── controllers/           # Route controllers (future)
├── middleware/            # Express middleware
│   └── auth.js           # Authentication middleware
├── models/                # Mongoose models
│   ├── Order.js
│   ├── Product.js
│   ├── Supplier.js
│   └── User.js
├── routes/                # API routes
│   ├── analytics.js
│   ├── auth.js
│   ├── demo.js
│   ├── orders.js
│   ├── products.js
│   └── suppliers.js
├── scripts/               # Utility scripts
│   └── seedData.js
├── services/              # Business logic services
│   ├── reorderService.js
│   └── simulationService.js
├── uploads/               # File uploads directory
│   └── products/
├── utils/                 # Utility functions
│   └── calculations.js    # Supply chain calculations
├── .env                   # Environment variables
├── .env.example           # Environment template
├── check-user.js          # User verification script
├── index.js               # Server entry point
├── package.json           # Server dependencies
├── package-lock.json      # Lock file
└── test-connection.js     # Database test script
```

## 📚 Documentation Structure
```
docs/
├── api/                   # API documentation
├── deployment/            # Deployment guides
├── screenshots/           # Application screenshots
├── FEATURES.md            # Feature documentation
├── PROJECT_STRUCTURE.md   # This file
└── SETUP.md              # Setup instructions
```

## 🔧 Key Configuration Files

### Root Level
- **package.json**: Contains scripts for running both client and server
- **.gitignore**: Comprehensive ignore rules for Node.js, React, and common files
- **README.md**: Main project documentation and overview

### Server Configuration
- **.env**: Environment variables (MongoDB URI, JWT secret, etc.)
- **config/constants.js**: Application constants and enums
- **config/database.js**: MongoDB connection configuration

### Client Configuration
- **src/services/api.js**: Centralized API service with interceptors
- **src/contexts/**: React Context for global state management

## 🚀 Development Workflow

### Starting the Application
```bash
# Install all dependencies
npm run install-all

# Start both client and server
npm run dev

# Start only server
npm run server

# Start only client  
npm run client
```

### Database Operations
```bash
# Seed database with sample data
cd server && npm run seed

# Test database connection
cd server && node test-connection.js

# Check user exists
cd server && node check-user.js
```

## 📦 Key Dependencies

### Frontend (React)
- **@mui/material**: Material-UI components
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **chart.js**: Data visualization
- **socket.io-client**: Real-time communication

### Backend (Node.js)
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **socket.io**: Real-time communication
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **node-cron**: Scheduled tasks

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Business Logic Organization
- **Models**: Database schemas with business logic methods
- **Services**: Complex business operations (reorder logic, simulations)
- **Utils**: Pure calculation functions (EOQ, ROP, ABC analysis)
- **Routes**: API endpoints with proper error handling

This structure follows industry best practices for full-stack applications and makes the codebase maintainable and scalable.