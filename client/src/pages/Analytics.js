import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    fetchProducts();
  }, [period]);

  useEffect(() => {
    if (selectedProduct) {
      fetchForecastData();
    }
  }, [selectedProduct]);

  const fetchAnalyticsData = async () => {
    try {
      const [inventoryResponse, orderResponse] = await Promise.all([
        axios.get('/api/analytics/inventory'),
        axios.get(`/api/analytics/orders?period=${period}`)
      ]);

      setInventoryData(inventoryResponse.data);
      setOrderData(orderResponse.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
      if (response.data.products.length > 0) {
        setSelectedProduct(response.data.products[0]._id);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await axios.get(`/api/analytics/forecast?productId=${selectedProduct}&days=30`);
      setForecastData(response.data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  if (loading) {
    return <Typography>Loading analytics...</Typography>;
  }

  // Category Distribution Chart
  const categoryChartData = inventoryData?.categoryStats ? {
    labels: Object.keys(inventoryData.categoryStats),
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: Object.values(inventoryData.categoryStats).map(cat => cat.value),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384'
        ],
      },
    ],
  } : null;

  // ABC Analysis Chart
  const abcChartData = inventoryData?.abcAnalysis ? {
    labels: ['A Items (80%)', 'B Items (15%)', 'C Items (5%)'],
    datasets: [
      {
        label: 'Product Count',
        data: [
          inventoryData.abcAnalysis.A.count,
          inventoryData.abcAnalysis.B.count,
          inventoryData.abcAnalysis.C.count
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      },
    ],
  } : null;

  // Order Trends Chart
  const orderTrendsData = orderData?.orderTrends ? {
    labels: Object.keys(orderData.orderTrends).sort(),
    datasets: [
      {
        label: 'Order Count',
        data: Object.keys(orderData.orderTrends).sort().map(date => orderData.orderTrends[date].count),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Order Value ($)',
        data: Object.keys(orderData.orderTrends).sort().map(date => orderData.orderTrends[date].value),
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
      },
    ],
  } : null;

  // Demand Forecast Chart
  const forecastChartData = forecastData?.forecast ? {
    labels: forecastData.forecast.map(f => new Date(f.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Forecasted Demand',
        data: forecastData.forecast.map(f => f.demand),
        borderColor: '#9966FF',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={period}
              label="Time Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Product for Forecast</InputLabel>
            <Select
              value={selectedProduct}
              label="Product for Forecast"
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Inventory Value
              </Typography>
              <Typography variant="h5" color="primary">
                ${inventoryData?.totalInventoryValue?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders ({period} days)
              </Typography>
              <Typography variant="h5" color="primary">
                {orderData?.totalOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Order Value ({period} days)
              </Typography>
              <Typography variant="h5" color="primary">
                ${orderData?.totalValue?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Forecast Risk
              </Typography>
              <Typography variant="h5" color={forecastData?.summary?.stockoutRisk === 'High' ? 'error' : 'success'}>
                {forecastData?.summary?.stockoutRisk || 'Low'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory by Category
              </Typography>
              {categoryChartData && (
                <Bar data={categoryChartData} options={chartOptions} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ABC Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ABC Analysis
              </Typography>
              {abcChartData && (
                <Pie data={abcChartData} options={chartOptions} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Trends (Last {period} days)
              </Typography>
              {orderTrendsData && (
                <Line data={orderTrendsData} options={lineChartOptions} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Demand Forecast */}
        {forecastData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Demand Forecast - {forecastData.product?.name}
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Current Stock: {forecastData.product?.currentStock} | 
                    Forecasted Demand: {forecastData.summary?.totalForecastDemand} | 
                    Action: {forecastData.summary?.recommendedAction}
                  </Typography>
                </Box>
                {forecastChartData && (
                  <Line data={forecastChartData} options={chartOptions} />
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Top Performing Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Turnover Analysis
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Turnover</TableCell>
                      <TableCell>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData?.turnoverAnalysis?.slice(0, 10).map((product) => (
                      <TableRow key={product.sku}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.turnover.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={product.category} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supplier Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Orders</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>On-Time Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderData?.supplierStats?.map((supplier) => (
                      <TableRow key={supplier.name}>
                        <TableCell>{supplier.name}</TableCell>
                        <TableCell>{supplier.orderCount}</TableCell>
                        <TableCell>${supplier.totalValue.toLocaleString()}</TableCell>
                        <TableCell>
                          {supplier.totalDeliveries > 0 
                            ? `${((supplier.onTimeDeliveries / supplier.totalDeliveries) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;