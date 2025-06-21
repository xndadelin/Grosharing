import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HouseScreen() {
  const { houseName } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.houseName}>{houseName}</Text>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/home")}> 
        <Text style={styles.backButtonText}>Back to houses</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 249, 230)',
  },
  houseName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#4A154B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
