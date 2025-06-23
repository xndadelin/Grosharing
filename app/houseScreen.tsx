import { addGroceryItem, getGroceryItems, getUser, updateGroceryItemStatus } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

const getUsers = async () => {
    const { data, error } = await supabase.from('neighbors').select('*')
    if(error) return []
    return data;
} 

export default function HouseScreen() {
  const { houseName } = useLocalSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [groceryItems, setGroceryItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    quantity: "",
    description: ""
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const itemNameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, itemsData, userData] = await Promise.all([
          getUsers(),
          getGroceryItems(houseName as string),
          getUser()
        ]);
        
        setUsers(usersData);
        setGroceryItems(itemsData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (u) => u.house === houseName
  );

  const handleAddGroceryItem = async () => {
    if (!newItem.itemName.trim()) {
      Alert.alert("Required field", "Please enter an item name");
      return;
    }
    
    const quantity = parseInt(newItem.quantity) || 1;
    
    try {
      setLoading(true);
      
      const result = await addGroceryItem({
        house: houseName as string,
        item_name: newItem.itemName,
        quantity,
        description: newItem.description,
        slack_id: currentUser?.id,
        added_by: currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name
      });
      
      if (!result) {
        throw new Error('Failed to add grocery item');
      }
      
      const updatedItems = await getGroceryItems(houseName as string);
      setGroceryItems(updatedItems);
      
      setShowAddModal(false);
      setNewItem({
        itemName: "",
        quantity: "",
        description: ""
      });
    } catch (error) {
      Alert.alert("Error", "Failed to add grocery item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const dismissKeyboardAndModal = () => {
    Keyboard.dismiss();
    setShowAddModal(false);
    setNewItem({
      itemName: "",
      quantity: "",
      description: ""
    });
  };
  
  const toggleItemCompleted = async (itemId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      const userName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || "Unknown user";
      
      await updateGroceryItemStatus(itemId, !currentStatus, userName);
      
      setGroceryItems(prev => 
        prev.map(item => 
          item.id === itemId ? {
            ...item, 
            completed: !item.completed,
            completed_by: !currentStatus ? userName : null
          } : item
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  


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
              <Text style={styles.neighborEmptySubtext}>Invite friends to join {houseName}</Text>
            </View>
          }
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grocery list</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>Add grocery</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={groceryItems}
          keyExtractor={(item) => item.id?.toString()}
          style={styles.groceryList}
          renderItem={({ item }) => (
            <View style={styles.groceryItem}>
              <TouchableOpacity
                style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                onPress={() => toggleItemCompleted(item.id, item.completed)}
              >
                {item.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.groceryItemContent}>
                <View style={styles.groceryItemHeader}>
                  <Text style={[
                    styles.groceryItemName, 
                    item.completed && styles.groceryItemCompleted
                  ]}>
                    {item.item_name}
                  </Text>
                  <Text style={styles.groceryItemQuantity}>
                    {item.quantity} {parseInt(item.quantity) === 1 ? 'piece' : 'pieces'}
                  </Text>
                </View>
                
                {item.description ? (
                  <Text style={styles.groceryItemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                
                <View style={styles.groceryItemFooter}>
                  <Text style={styles.groceryItemAddedBy}>
                    Added by {item.added_by}
                  </Text>
                  {item.completed && item.completed_by && (
                    <Text style={styles.groceryItemCompletedBy}>
                      Completed by {item.completed_by}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.neighborEmpty}>No grocery items yet</Text>
              <Text style={styles.neighborEmptySubtext}>Add some items to your grocery list</Text>
            </View>
          }
        />
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/home")}> 
        <Text style={styles.backButtonText}>Back to houses</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={dismissKeyboardAndModal}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboardAndModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add grocery item</Text>
                
                <Text style={styles.inputLabel}>Item name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., milk"
                  placeholderTextColor="#999"
                  value={newItem.itemName}
                  onChangeText={(text) => setNewItem(prev => ({...prev, itemName: text}))}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => quantityInputRef.current?.focus()}
                  blurOnSubmit={false}
                  ref={itemNameInputRef}
                />
                
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 2"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newItem.quantity}
                  onChangeText={(text) => setNewItem(prev => ({...prev, quantity: text}))}
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  blurOnSubmit={false}
                  ref={quantityInputRef}
                />
                
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="e.g., Fat-free milk from Trader Joe's"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={newItem.description}
                  onChangeText={(text) => setNewItem(prev => ({...prev, description: text}))}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    handleAddGroceryItem();
                  }}
                  ref={descriptionInputRef}
                />
            
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={dismissKeyboardAndModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleAddGroceryItem}
                    disabled={loading}
                  >              
                    <Text style={styles.confirmButtonText}>
                      {loading ? "Adding..." : "Add item"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    position: 'relative',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 12,
    marginLeft: 6,
  },
  addButton: {
    backgroundColor: '#4A154B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  neighborsList: {
    maxHeight: 320,
  },
  groceryList: {
    maxHeight: 300,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4A154B',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A154B',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  groceryItemContent: {
    flex: 1,
  },
  groceryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groceryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  groceryItemCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  groceryItemQuantity: {
    fontSize: 14,
    color: '#4A154B',
    fontWeight: '500',
    marginLeft: 8,
  },
  groceryItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  groceryItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  groceryItemAddedBy: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginRight: 8,
  },
  groceryItemCompletedBy: {
    fontSize: 12,
    color: '#4A154B',
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    shadowOpacity: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4A154B',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: 'black',
    backgroundColor: '#f9f9f9',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#4A154B',
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 'bold',
  },
});
