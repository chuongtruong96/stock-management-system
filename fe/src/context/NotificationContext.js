import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { fetchNotifications } from '../services/notificationApi';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchNotifications().then(r => setItems(r.data));

    const client = new Client({ brokerURL: 'ws://localhost:8082/ws' });
    client.onConnect = () => {
      client.subscribe('/user/queue/notifications', msg => {
        setItems(prev => [JSON.parse(msg.body), ...prev]);
      });
      client.subscribe('/topic/notifications/global', msg => {
        setItems(prev => [JSON.parse(msg.body), ...prev]);
      });
    };
    client.activate();
    return () => client.deactivate();
  }, []);

  const markAsRead = id => {
    setItems(prev => prev.map(i => i.id===id?{...i, read:true}:i));
  };

  return (
    <NotificationContext.Provider value={{ items, setItems, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}