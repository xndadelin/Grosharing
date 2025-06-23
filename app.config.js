import 'dotenv/config';

export default {
  expo: {
    name: "Grosharing",
    slug: "grosharing",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "grosharing",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    notification: {
      icon: "./assets/images/notification-icon.png",
      color: "#4A154B",
      iosDisplayInForeground: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.grosharing.app",
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        UIRequiresPersistentWiFi: true,
        UIApplicationExitsOnSuspend: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.grosharing.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "d88c4112-b2d4-494d-8848-7136138d928c"
      }
    },
  }
};
