# SupplyFlow Deployment Guide

## 🚀 Deployment Options

### 1. Heroku Deployment (Recommended for Demo)

#### Prerequisites
- Heroku CLI installed
- Git repository
- MongoDB Atlas account

#### Steps
1. **Create Heroku Apps**
   ```bash
   # Create app for backend
   heroku create supplyflow-api
   
   # Create app for frontend
   heroku create supplyflow-app
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production -a supplyflow-api
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri -a supplyflow-api
   heroku config:set JWT_SECRET=your_jwt_secret -a supplyflow-api
   heroku config:set CLIENT_URL=https://supplyflow-app.herokuapp.com -a supplyflow-api
   ```

3. **Deploy Backend**
   ```bash
   # Add Heroku remote
   git remote add heroku-api https://git.heroku.com/supplyflow-api.git
   
   # Deploy server subtree
   git subtree push --prefix server heroku-api main
   ```

4. **Deploy Frontend**
   ```bash
   # Add build script to client/package.json
   # Set REACT_APP_API_URL=https://supplyflow-api.herokuapp.com
   
   git remote add heroku-client https://git.heroku.com/supplyflow-app.git
   git subtree push --prefix client heroku-client main
   ```

### 2. Vercel + Railway Deployment

#### Backend on Railway
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy from `server` directory

#### Frontend on Vercel
1. Connect GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set environment variables

### 3. AWS Deployment

#### Backend on AWS Elastic Beanstalk
1. Create Elastic Beanstalk application
2. Upload server code as ZIP
3. Configure environment variables
4. Set up RDS for database (optional)

#### Frontend on AWS S3 + CloudFront
1. Build React app: `npm run build`
2. Upload build files to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain (optional)

## 🔧 Production Configuration

### Environment Variables
```env
# Server (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/supplyflow
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000
```

```env
# Client (.env.production)
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_SERVER_URL=https://your-backend-domain.com
```

### Database Setup
1. **MongoDB Atlas Production Cluster**
   - Create production cluster
   - Configure network access
   - Set up database users
   - Enable backup

2. **Database Seeding**
   ```bash
   # Run seed script in production
   NODE_ENV=production node scripts/seedData.js
   ```

### Security Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] File upload limits set
- [ ] Rate limiting implemented (future)

## 📊 Performance Optimization

### Backend Optimizations
```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());

// Add request rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Frontend Optimizations
```javascript
// Code splitting
const Analytics = lazy(() => import('./pages/Analytics'));

// Image optimization
// Use WebP format for images
// Implement lazy loading for charts
```

### Database Optimizations
```javascript
// Add indexes for frequently queried fields
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ currentStock: 1, reorderPoint: 1 });
orderSchema.index({ orderDate: -1, status: 1 });
```

## 🔍 Monitoring & Logging

### Application Monitoring
```javascript
// Add logging middleware
const morgan = require('morgan');
app.use(morgan('combined'));

// Error tracking (Sentry)
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**
   - Verify CLIENT_URL environment variable
   - Check CORS configuration in server

2. **Database Connection**
   - Verify MongoDB URI
   - Check network access in Atlas
   - Ensure database user has proper permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debugging Commands
```bash
# Check application logs
heroku logs --tail -a supplyflow-api

# Connect to production database
mongo "mongodb+srv://cluster.mongodb.net/supplyflow" --username your_user

# Test API endpoints
curl https://your-api-domain.com/api/health
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple server instances
- Implement session storage (Redis)
- Database read replicas for analytics

### Vertical Scaling
- Monitor CPU and memory usage
- Optimize database queries
- Implement caching strategies

### CDN Integration
- Serve static assets from CDN
- Cache API responses where appropriate
- Optimize image delivery

This deployment guide ensures your SupplyFlow application runs reliably in production environments.