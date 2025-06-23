import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const getProjectId = (): string => {
  const projectId = 
    Constants?.expoConfig?.extra?.eas?.projectId || 
    Constants?.easConfig?.projectId;
  
  if (!projectId) {
    throw new Error('Project ID not found in Expo config!');
  }
  
  return projectId;
};

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Permission not granted for push notifications');
  }

  try {
    const projectId = getProjectId();
    
    const token = (await Notifications.getExpoPushTokenAsync({ 
      projectId 
    })).data;
    
    return token;
  } catch (error) {
    throw error;
  }
};

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[') || !expoPushToken.endsWith(']')) {
    throw new Error(`Invalid push token format: ${expoPushToken}`);
  }
  
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`Push notification failed: ${JSON.stringify(responseData)}`);
    }
    
    if (responseData.data?.status === 'error' || responseData.errors?.length > 0) {
      throw new Error(`Push notification API error: ${JSON.stringify(responseData)}`);
    }
    
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const addNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    return notification;
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    return response;
  });

  return {
    remove: () => {
      notificationListener.remove();
      responseListener.remove();
    },
    listeners: {
      notificationListener,
      responseListener
    }
  };
};

export const checkDeviceNotificationStatus = async (): Promise<{
  settings: object | null,
  permissionsStatus: string | null,
  error: Error | null
}> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    let tokenInfo = null;
    try {
      const projectId = getProjectId();
      tokenInfo = await Notifications.getExpoPushTokenAsync({ projectId });
    } catch (err) {
      console.log('[NOTIFICATIONS] Error getting token info:', err);
    }
    
    let notificationSettings = null;
    if (Platform.OS === 'ios') {
      try {
        notificationSettings = await Notifications.getPermissionsAsync();
      } catch (err) {
        console.log('[NOTIFICATIONS] Error getting iOS notification settings:', err);
      }
    }
    
    return {
      settings: notificationSettings || tokenInfo || {},
      permissionsStatus: status,
      error: null
    };
  } catch (error) {
    return {
      settings: null,
      permissionsStatus: null,
      error: error as Error
    };
  }
};

export const sendAutomaticNotification = async (
  userPushToken: string,
  eventType: 'groceryItemAdded' | 'groceryItemCompleted' | 'neighborJoined' | 'custom',
  customData?: { title?: string; body?: string; data?: Record<string, any> }
): Promise<void> => {
  if (!userPushToken) {
    return;
  }

  let title = '';
  let body = '';
  let data = {};

  switch (eventType) {
    case 'groceryItemAdded':
      title = customData?.title || 'New grocery item';
      body = customData?.body || 'Someone added a new item to the grocery list';
      data = { 
        type: 'groceryItemAdded',
        ...(customData?.data || {})
      };
      break;
    case 'groceryItemCompleted':
      title = customData?.title || 'Grocery item completed';
      body = customData?.body || 'An item from your grocery list has been purchased';
      data = { 
        type: 'groceryItemCompleted',
        ...(customData?.data || {})
      };
      break;
    case 'neighborJoined':
      title = customData?.title || 'New neighbor';
      body = customData?.body || 'Someone new joined your house';
      data = { 
        type: 'neighborJoined',
        ...(customData?.data || {})
      };
      break;
  }

  try {
    await sendPushNotification(userPushToken, title, body, {
      ...data,
      badge: 1, 
      channelId: 'default', 
      sound: true, 
      priority: 'high', 
      android: {
        priority: 'high',
        vibrate: [0, 250, 250, 250],
        channelId: 'default'
      }
    });
  } catch (error) {
    console.error(`[NOTIFICATIONS] Failed to send ${eventType} notification:`, error);
  }
};
