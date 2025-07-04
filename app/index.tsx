import { getUser } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { ResizeMode, Video } from "expo-av";
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Houses } from "./home";

import type { User } from "@supabase/supabase-js";

export default function Index() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])

  const onHandleSlackPress = async () => {
    try {
      await WebBrowser.warmUpAsync();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "slack_oidc",
        options: {
          redirectTo: 'grosharing://',
          skipBrowserRedirect: false,
        }
      });

      if (error) {
        Alert.alert('Error', 'Authentication failed. Please try again.', [
          {
            text: 'OK',
          }
        ])
      } else if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'grosharing://'
        );

        if (result.type === 'success' && result.url) {
          const fragment = result.url.split('#')[1];
          const params = new URLSearchParams(fragment)

          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token")

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (sessionError) {
              Alert.alert('Session failed!', 'Could not establish session: ' + sessionError.message);
            } else if (sessionData?.user) {
              setUser(sessionData.user);

              Alert.alert('Success!', `Welcome to Neighborhood!`);
            }
          } else {
            Alert.alert('Error', 'Missing access or refresh token. Please try again.');
          }
        }

      }
    } catch (e) {
      Alert.alert('error!', 'authentication error!', [
        {
          text: 'Please try again!' + e
        }
      ])
    }
  }

  if(loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if(user) return <Houses />

  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/videos/video.mp4")}
        style={{ width: "100%", height: "100%" }}
        shouldPlay={true}
        isLooping={true}
        resizeMode={ResizeMode.COVER}
        rate={1.0}
      />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/neighborhoodLogo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.slackButton}
          onPress={onHandleSlackPress}
        >
          <View style={styles.buttonContent}>
            <Image
              source={require('../assets/images/slack.png')}
              style={styles.slackIcon}
            />
            <Text style={styles.buttonText}>
              Start!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 240,
    height: 240,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  slackButton: {
    backgroundColor: '#4A154B',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: 200,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slackIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});