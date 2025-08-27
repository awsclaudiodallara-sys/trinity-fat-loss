import { useState, useCallback, useEffect } from 'react';

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}

interface NotificationState {
  permission: 'granted' | 'denied' | 'default';
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  platform: 'web' | 'mobile';
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isLoading: false,
    error: null,
    isSupported: false,
    platform: 'web'
  });

  // 🔍 Detect platform on mount
  useEffect(() => {
    const isMobile = !!window.Capacitor;
    const isNotificationSupported = isMobile || 'Notification' in window;
    
    setState(prev => ({
      ...prev,
      platform: isMobile ? 'mobile' : 'web',
      isSupported: isNotificationSupported,
      permission: isMobile ? 'default' : (Notification?.permission || 'default') as NotificationState['permission']
    }));
  }, []);

  // 🔔 Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationState['permission']> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (state.platform === 'mobile' && window.Capacitor) {
        // 📱 MOBILE: Use Capacitor (if available)
        console.log('🔔 Mobile detected - would use Capacitor push notifications');
        
        // For now, simulate mobile notification setup
        setState(prev => ({ 
          ...prev, 
          permission: 'granted',
          isLoading: false 
        }));
        
        return 'granted';
        
      } else if (state.platform === 'web' && 'Notification' in window) {
        // 🌐 WEB: Use browser Notification API
        const permission = await Notification.requestPermission();
        
        setState(prev => ({ 
          ...prev, 
          permission: permission as NotificationState['permission'],
          isLoading: false 
        }));
        
        return permission as NotificationState['permission'];
      } else {
        throw new Error('Notifications not supported on this platform');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request notification permission';
      console.error('🚫 Notification permission error:', error);
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      
      return 'denied';
    }
  }, [state.platform]);

  // 🔔 Send notification
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') {
      console.warn('🚫 Cannot send notification: permission not granted');
      return null;
    }

    try {
      if (state.platform === 'mobile' && window.Capacitor) {
        // 📱 MOBILE: Use Capacitor local notifications
        console.log('📱 Would send mobile notification:', title, options);
        
        // Placeholder for actual Capacitor implementation
        // const { LocalNotifications } = Capacitor.Plugins;
        // await LocalNotifications.schedule({
        //   notifications: [{
        //     title,
        //     body: options?.body || '',
        //     id: Date.now(),
        //     schedule: { at: new Date(Date.now() + 1000) }
        //   }]
        // });
        
        return { platform: 'mobile', status: 'sent' };
        
      } else if (state.platform === 'web' && 'Notification' in window) {
        // 🌐 WEB: Use browser Notification API
        const notification = new Notification(title, {
          icon: '/trinity-logo.svg',
          badge: '/trinity-logo.svg',
          ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
        
        return { platform: 'web', notification, status: 'sent' };
      }
      
      throw new Error('Notifications not supported');
    } catch (error) {
      console.error('🚫 Failed to send notification:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to send notification' 
      }));
      return null;
    }
  }, [state.permission, state.platform]);

  // 🔔 Send match notification
  const sendMatchNotification = useCallback(async (matchData?: { partnerName?: string; matchType?: string }) => {
    const title = '🎉 Trinity Match Found!';
    const body = matchData?.partnerName 
      ? `You've been matched with ${matchData.partnerName}! 💪`
      : 'Your perfect fitness partner is waiting! 💪';

    return await sendNotification(title, { 
      body,
      icon: '/trinity-logo.svg',
      tag: 'trinity-match',
      requireInteraction: true
    });
  }, [sendNotification]);

  // 🔔 Send queue update notification
  const sendQueueNotification = useCallback(async (position: number, estimatedWait?: string) => {
    const title = '⏳ Trinity Queue Update';
    const body = estimatedWait 
      ? `Position #${position} - Estimated wait: ${estimatedWait}`
      : `You're #${position} in the queue`;

    return await sendNotification(title, { 
      body,
      icon: '/trinity-logo.svg',
      tag: 'trinity-queue'
    });
  }, [sendNotification]);

  // 🧹 Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    permission: state.permission,
    isLoading: state.isLoading,
    error: state.error,
    isSupported: state.isSupported,
    platform: state.platform,
    
    // Actions
    requestPermission,
    sendNotification,
    sendMatchNotification,
    sendQueueNotification,
    clearError,
    
    // Computed
    canSendNotifications: state.permission === 'granted' && state.isSupported,
    needsPermission: state.permission === 'default' && state.isSupported
  };
};

// 🎯 Hook for specific Trinity notifications
export const useTrinityNotifications = () => {
  const notifications = useNotifications();
  
  return {
    ...notifications,
    
    // 🚀 Initialize notifications for Trinity app
    initializeTrinity: async () => {
      if (notifications.needsPermission) {
        const permission = await notifications.requestPermission();
        
        if (permission === 'granted') {
          // Send welcome notification
          await notifications.sendNotification('🎯 Trinity Notifications Enabled', {
            body: 'You\'ll be notified when matches are found! 💪',
            icon: '/trinity-logo.svg'
          });
        }
        
        return permission;
      }
      
      return notifications.permission;
    }
  };
};
