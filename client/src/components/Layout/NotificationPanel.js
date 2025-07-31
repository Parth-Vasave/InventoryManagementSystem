import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  Close,
  Warning,
  Inventory,
  Clear
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { format } from 'date-fns';

const NotificationPanel = ({ open, onClose }) => {
  const { notifications, clearNotification, clearAllNotifications } = useSocket();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reorder':
        return <Warning color="warning" />;
      case 'stock':
        return <Inventory color="info" />;
      default:
        return <Inventory />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reorder':
        return 'warning';
      case 'stock':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {notifications.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllNotifications}
            sx={{ mb: 2 }}
          >
            Clear All
          </Button>
        )}

        <Divider />

        {notifications.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={getNotificationColor(notification.type)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(notification.timestamp, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  size="small"
                  onClick={() => clearNotification(notification.id)}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;