import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  FastForward,
  Science
} from '@mui/icons-material';
import axios from 'axios';

const DemoControls = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const simulateDay = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/demo/simulate-day');
      setResult({
        type: 'success',
        message: `Day simulated! ${response.data.reorderAlertsTriggered} reorder alerts triggered.`
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Simulation failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateWeek = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/demo/simulate-week');
      setResult({
        type: 'success',
        message: `Week simulated! ${response.data.totalReorderAlertsTriggered} total reorder alerts triggered.`
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Week simulation failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3, border: '2px dashed #1976d2' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Science color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Demo Simulation Controls
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={2}>
          Simulate realistic business activity to demonstrate the system's capabilities
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={simulateDay}
            disabled={loading}
          >
            Simulate 1 Day
          </Button>
          
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <FastForward />}
            onClick={simulateWeek}
            disabled={loading}
          >
            Simulate 1 Week
          </Button>
        </Box>

        {result && (
          <Alert severity={result.type} sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DemoControls;