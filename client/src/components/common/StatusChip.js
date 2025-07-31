import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status, variant = 'filled', size = 'small' }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'good':
      case 'delivered':
      case 'active':
        return 'success';
      case 'low stock':
      case 'cancelled':
      case 'inactive':
        return 'error';
      case 'medium':
      case 'pending':
      case 'confirmed':
        return 'warning';
      case 'shipped':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      variant={variant}
      size={size}
    />
  );
};

export default StatusChip;