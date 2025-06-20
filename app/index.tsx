import { ResizeMode, Video } from "expo-av";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/3838e7c0f3d7d5bcc703ca27234178b047a94160_background.mp4" }}
        style={{width: "100%", height: "100%"}}
        isMuted={true}
        shouldPlay={true}
        isLooping={true}
        resizeMode={ResizeMode.COVER}
        rate={1.0}
      />
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.slackButton}
          onPress={() => {
            console.log("Slack button pressed");
          }}
        >
          <View style={styles.buttonContent}>*
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