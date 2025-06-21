import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  const filteredUsers = users.filter(
    (u) => u.house === houseName
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.houseName}>{houseName}</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Neighbors</Text>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.slack_id || item.id?.toString() || Math.random().toString()}
          style={styles.neighborsList}
          showsVerticalScrollIndicator={true}
          numColumns={4}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View style={styles.neighborItemColumn}>
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.neighborAvatar}
              />
              <Text style={styles.neighborName} numberOfLines={1} ellipsizeMode="tail">
                {item.full_name}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.neighborEmpty}>No neighbors yet</Text>
              <Text style={styles.neighborEmptySubtext}>Invite friends to join {houseName}!</Text>
            </View>
          }
        />
      </View>
      
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
  headerSection: {
    marginBottom: 24,
    marginTop: 40,
  },
  houseName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(74, 21, 75, 0.2)',
    width: 100,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 12,
    marginLeft: 6,
  },
  neighborsList: {
    maxHeight: 320,
  },
  neighborItemColumn: {
    alignItems: 'center',
    width: '25%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  neighborAvatar: {
    width: 52,
    height: 52,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  neighborName: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 70,
  },
  neighborEmpty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  neighborEmptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#4A154B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 'auto',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
