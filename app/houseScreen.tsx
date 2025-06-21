import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getUsers = async () => {
    const { data, error } = await supabase.from('neighbors').select('*')
    if(error) return []
    return data;
} 

export default function HouseScreen() {
  const { houseName } = useLocalSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

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
  container:{
    backgroundColor: 'rgb(255, 249, 230)',
    height: '100%',
    width: '100%',
    padding: 20,
  },
  houseName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 40,
    marginTop: 60
  },
  backButton: {
    backgroundColor: '#4A154B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 'auto'
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
