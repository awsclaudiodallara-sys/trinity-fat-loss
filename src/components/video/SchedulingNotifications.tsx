/**
 * TRINITY FAT LOSS - Sistema di Notifiche per Video Call Scheduling
 * Flusso A: Sistema di Proposta Semplice
 * 
 * Componente per gestire notifiche e feedback visivo
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Bell, Calendar } from 'lucide-react';

export interface SchedulingNotification {
  id: string;
  type: 'proposal_received' | 'proposal_confirmed' | 'proposal_rejected' | 'call_starting' | 'call_reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface SchedulingNotificationsProps {
  notifications: SchedulingNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
}

export const SchedulingNotifications: React.FC<SchedulingNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: SchedulingNotification['type']) => {
    switch (type) {
      case 'proposal_received':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'proposal_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'proposal_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'call_starting':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'call_reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ora';
    if (diffMinutes < 60) return `${diffMinutes}m fa`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h fa`;
    return `${Math.floor(diffMinutes / 1440)}g fa`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifiche</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Segna tutto come letto
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nessuna notifica</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Hook per gestire le notifiche del sistema scheduling
 */
export function useSchedulingNotifications(trioId: string) {
  const [notifications, setNotifications] = useState<SchedulingNotification[]>([]);

  // Simula notifiche per demo
  useEffect(() => {
    const mockNotifications: SchedulingNotification[] = [
      {
        id: '1',
        type: 'proposal_received',
        title: 'Nuova Proposta',
        message: 'Marco ha proposto una videochiamata per Martedì 15:00',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minuti fa
        read: false,
      },
      {
        id: '2',
        type: 'proposal_confirmed',
        title: 'Proposta Confermata',
        message: 'La videochiamata di Giovedì 16:00 è stata confermata da tutti',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        read: true,
      },
      {
        id: '3',
        type: 'call_reminder',
        title: 'Promemoria Chiamata',
        message: 'La tua Trinity call inizia tra 15 minuti',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minuti fa
        read: false,
      },
    ];

    setNotifications(mockNotifications);
  }, [trioId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const clearAll = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const addNotification = (notification: Omit<SchedulingNotification, 'id'>) => {
    const newNotification: SchedulingNotification = {
      ...notification,
      id: Date.now().toString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  return {
    notifications,
    markAsRead,
    clearAll,
    addNotification,
  };
}

/**
 * Componente per mostrare lo stato generale del sistema scheduling
 */
interface SchedulingStatusProps {
  hasActivePendingProposal: boolean;
  nextCallTime?: string;
  pendingResponsesCount: number;
}

export const SchedulingStatus: React.FC<SchedulingStatusProps> = ({
  hasActivePendingProposal,
  nextCallTime,
  pendingResponsesCount,
}) => {
  if (!hasActivePendingProposal && !nextCallTime) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          Nessuna chiamata programmata
        </span>
      </div>
    );
  }

  if (hasActivePendingProposal) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center space-x-2">
        <Clock className="w-4 h-4 text-orange-600" />
        <span className="text-sm text-orange-800">
          Proposta in attesa ({pendingResponsesCount} risposte mancanti)
        </span>
      </div>
    );
  }

  if (nextCallTime) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-800">
          Prossima chiamata: {nextCallTime}
        </span>
      </div>
    );
  }

  return null;
};
