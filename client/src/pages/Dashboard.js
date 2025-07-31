import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert
} from '@mui/material';
import {
  Inventory,
  Warning,
  ShoppingCart,
  Business,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  const { overview, recentOrders, topProducts } = dashboardData || {};

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Real-time Alerts */}
      {notifications.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Active Alerts: {notifications.length} notifications require attention
          </Typography>
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={overview?.totalProducts || 0}
            icon={<Inventory fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={overview?.lowStockProducts || 0}
            icon={<Warning fontSize="large" />}
            color="warning"
            subtitle="Need reordering"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={overview?.pendingOrders || 0}
            icon={<ShoppingCart fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Suppliers"
            value={overview?.totalSuppliers || 0}
            icon={<Business fontSize="large" />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Inventory Value */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Total Inventory Value"
            value={`$${(overview?.totalInventoryValue || 0).toLocaleString()}`}
            icon={<TrendingUp fontSize="large" />}
            color="success"
            subtitle="Current stock value"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <List>
                {recentOrders?.map((order) => (
                  <ListItem key={order._id} divider>
                    <ListItemText
                      primary={`${order.orderNumber} - ${order.supplier?.name}`}
                      secondary={`$${order.totalAmount.toLocaleString()} • ${new Date(order.orderDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={order.status}
                      size="small"
                      color={
                        order.status === 'Delivered' ? 'success' :
                        order.status === 'Pending' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {recentOrders?.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" py={2}>
                  No recent orders
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              <List>
                {topProducts?.map((product) => (
                  <ListItem key={product._id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.sku} • Stock: ${product.currentStock} • Sold: ${product.totalSold}`}
                    />
                    <Typography variant="body2" color="primary">
                      ${product.sellingPrice}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              {topProducts?.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" py={2}>
                  No product data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" href="/products">
            Manage Products
          </Button>
          <Button variant="outlined" href="/orders">
            View Orders
          </Button>
          <Button variant="outlined" href="/analytics">
            View Analytics
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;