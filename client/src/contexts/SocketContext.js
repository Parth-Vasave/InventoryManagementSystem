import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001');
      setSocket(newSocket);

      // Listen for reorder alerts
      newSocket.on('reorderAlert', (data) => {
        const notification = {
          id: Date.now(),
          type: 'reorder',
          title: 'Reorder Alert',
          message: `${data.count} products need reordering`,
          timestamp: new Date(),
          data
        };
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      });

      // Listen for stock updates
      newSocket.on('stockUpdated', (product) => {
        const notification = {
          id: Date.now(),
          type: 'stock',
          title: 'Stock Updated',
          message: `${product.name} stock updated to ${product.currentStock}`,
          timestamp: new Date(),
          data: product
        };
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    clearNotification,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};