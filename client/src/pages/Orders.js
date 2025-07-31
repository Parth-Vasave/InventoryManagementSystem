import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add,
  Visibility,
  AutorenewOutlined,
  Search,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    search: ''
  });

  const orderStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.supplier) params.append('supplier', filters.supplier);

      const response = await axios.get(`/api/orders?${params}`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setViewingOrder(null);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'Delivered') {
        updateData.actualDeliveryDate = new Date().toISOString();
      }

      await axios.patch(`/api/orders/${orderId}/status`, updateData);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAutoReorder = async () => {
    try {
      const response = await axios.post('/api/orders/auto-reorder');
      alert(response.data.message);
      fetchOrders();
    } catch (error) {
      console.error('Error creating auto reorders:', error);
      alert('Error creating auto reorders');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Confirmed': return 'info';
      case 'Shipped': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDeliveryStatus = (order) => {
    if (order.status !== 'Delivered' || !order.actualDeliveryDate) {
      return null;
    }

    const expected = new Date(order.expectedDeliveryDate);
    const actual = new Date(order.actualDeliveryDate);
    const diffDays = Math.ceil((actual - expected) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'On Time', color: 'success' };
    } else {
      return { label: `${diffDays} days late`, color: 'error' };
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Orders</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AutorenewOutlined />}
            onClick={handleAutoReorder}
            color="warning"
          >
            Auto Reorder
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Implement manual order creation */}}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={filters.supplier}
                label="Supplier"
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              >
                <MenuItem value="">All Suppliers</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              onClick={fetchOrders}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Performance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const deliveryStatus = getDeliveryStatus(order);
              return (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="subtitle2">{order.orderNumber}</Typography>
                    {order.isAutoGenerated && (
                      <Chip label="Auto" size="small" color="info" />
                    )}
                  </TableCell>
                  <TableCell>{order.supplier?.name}</TableCell>
                  <TableCell>
                    {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.expectedDeliveryDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        variant="outlined"
                      >
                        {orderStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {deliveryStatus && (
                      <Chip
                        label={deliveryStatus.label}
                        color={deliveryStatus.color}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {orders.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No orders found. Create your first order or use auto-reorder to get started.
        </Alert>
      )}

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {viewingOrder && (
          <>
            <DialogTitle>
              Order Details - {viewingOrder.orderNumber}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Supplier Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {viewingOrder.supplier?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {viewingOrder.supplier?.contactPerson}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {viewingOrder.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Order Date:</strong> {format(new Date(viewingOrder.orderDate), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Expected Delivery:</strong> {format(new Date(viewingOrder.expectedDeliveryDate), 'MMM dd, yyyy')}
                  </Typography>
                  {viewingOrder.actualDeliveryDate && (
                    <Typography variant="body2">
                      <strong>Actual Delivery:</strong> {format(new Date(viewingOrder.actualDeliveryDate), 'MMM dd, yyyy')}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Order Items
              </Typography>
              <List>
                {viewingOrder.items?.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.product?.name || 'Product'}
                      secondary={`SKU: ${item.product?.sku || 'N/A'} • Quantity: ${item.quantity} • Unit Cost: $${item.unitCost}`}
                    />
                    <Typography variant="body2" color="primary">
                      ${item.totalCost.toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="h6">
                  Total Amount: ${viewingOrder.totalAmount.toLocaleString()}
                </Typography>
              </Box>

              {viewingOrder.notes && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {viewingOrder.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Orders;