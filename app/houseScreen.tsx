import {
  AddGroceryItemModal,
  BackButton,
  BudgetModal,
  BudgetSection,
  GroceryListSection,
  HeaderSection,
  ImageViewerModal,
  NeighborsSection,
} from "@/components/House";
import { ChatModal } from "@/components/ChatModal";
import { commonStyles } from "@/components/House/styles";
import { pickImage, takePicture, uploadImageToSupabase } from "@/lib/imageService";
import { registerForPushNotifications, sendAutomaticNotification } from "@/lib/notificationService";
import { addGroceryItem, getGroceryItems, getHouseBudget, getSpendingPerUser, getTotalSpent, getUser, updateGroceryItemStatus, setHouseBudget as updateHouseBudgetInDB } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from '@expo/vector-icons';

const styles = StyleSheet.create({
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  }
});

const getUsers = async () => {
  const { data, error } = await supabase.from('neighbors').select('*')

  if (error) {
    return [];
  }

  return data || [];
}

export default function HouseScreen() {
  const params = useLocalSearchParams();
  const houseName = typeof params.houseName === 'string' ? params.houseName : "";
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [groceryItems, setGroceryItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    quantity: "",
    description: "",
    imageUri: "",
    imageUrl: "",
    price: ""
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [houseBudget, setHouseBudget] = useState<number>(150);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [userSpending, setUserSpending] = useState<Array<{user_name: string; total_spent: number}>>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [houseId, setHouseId] = useState<number | null>(null);
  const itemNameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, itemsData, userData, budget, spent, userSpendingData] = await Promise.all([
          getUsers(),
          getGroceryItems(houseName),
          getUser(),
          getHouseBudget(houseName),
          getTotalSpent(houseName),
          getSpendingPerUser(houseName)
        ]);

        setUsers(usersData);
        const itemsWithLoadingState = itemsData.map(item => ({
          ...item,
          isImageLoading: false
        }));
        setGroceryItems(itemsWithLoadingState);
        setCurrentUser(userData);
        setHouseBudget(budget || 150);
        setTotalSpent(spent || 0);
        setUserSpending(userSpendingData);


        try {
          const token = await registerForPushNotifications();
          setPushToken(token);

          if (token && userData?.id) {
            const { data: existingUser, error: queryError } = await supabase
              .from('neighbors')
              .select('*')
              .eq('slack_id', userData.id)
              .eq('house', houseName)
              .single();

            if (queryError || !existingUser) {
              return;
            } else {
              const { data: updateResult, error: updateError } = await supabase
                .from('neighbors')
                .update({ push_token: token })
                .eq('slack_id', userData.id)
                .eq('house', houseName);

              if (updateError) {
                console.error("[HOUSE] Error updating push token:", updateError);
              }
            }
          }
        } catch (error) {
          console.error("[HOUSE] Push notifications not available:", error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHouseId = async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('id')
        .eq('name', houseName)
        .single();
      if (!error && data) setHouseId(data.id);
    };

    fetchData();
    if (houseName) fetchHouseId();
  }, [houseName]);

  const filteredUsers = users.filter(
    (u) => u.house === houseName
  );

  const handleImageSelection = async (useCamera = false) => {
    const imageUri = useCamera ? await takePicture() : await pickImage();
    
    if (imageUri) {
      setNewItem(prev => ({
        ...prev,
        imageUri
      }));
    }
  };
  
  const handleAddGroceryItem = async () => {
    if (!newItem.itemName.trim()) {
      Alert.alert("Required field", "Please enter an item name");
      return;
    }

    const quantity = parseInt(newItem.quantity) || 1;
    const price = parseFloat(newItem.price) || 0;

    try {
      setLoading(true);
      
      let imageUrl = null;
      if (newItem.imageUri) {
        imageUrl = await uploadImageToSupabase(newItem.imageUri);
      }

      const result = await addGroceryItem({
        house: houseName,
        item_name: newItem.itemName,
        quantity,
        description: newItem.description,
        slack_id: currentUser?.id,
        added_by: currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name,
        image_url: imageUrl ?? undefined,
        price
      });

      if (!result) {
        throw new Error('Failed to add grocery item');
      }

      const updatedItems = await getGroceryItems(houseName);
      const itemsWithLoadingState = updatedItems.map(item => ({
        ...item,
        isImageLoading: false
      }));
      setGroceryItems(itemsWithLoadingState);

      try {
        const { data: allUsers, error: allUsersError } = await supabase
          .from('neighbors')
          .select('*');

        if (allUsersError) {
          console.error('[HOUSE] Error fetching all users:', allUsersError);
        } else {
          const usersByHouse: { [key: string]: any[] } = {};
          (allUsers || []).forEach(user => {
            if (!usersByHouse[user.house]) usersByHouse[user.house] = [];
            usersByHouse[user.house].push(user);
          });
        }

        console.log("[HOUSE] Querying users in current house:", houseName);
        const { data: houseUsers, error: houseError } = await supabase
          .from('neighbors')
          .select('*')
          .eq('house', houseName);
          
        if (houseError) {
          console.error('[HOUSE] Error fetching house users:', houseError);
        } else {
          const usersWithTokens = houseUsers?.filter(u => !!u.push_token) || [];
          
          if (usersWithTokens.length === 0) {
            console.warn('[HOUSE] No users in this house have push tokens registered');
          }
        }

        const usersToNotify = houseError ? users : (houseUsers || []);

        let sentCount = 0;

        const currentUserId = String(currentUser?.id || "");

        for (const user of usersToNotify) {
          const userSlackId = String(user.slack_id || "");
          const isSameUser = currentUserId === userSlackId;

          if (user.push_token) {
            const notificationBody = isSameUser ?
              `You added ${newItem.itemName} to the shopping list` :
              `${currentUser?.user_metadata?.full_name} added ${newItem.itemName} to the shopping list`;

            try {
              await sendAutomaticNotification(
                user.push_token,
                'groceryItemAdded',
                {
                  title: 'New grocery item added',
                  body: notificationBody,
                  data: {
                    itemName: newItem.itemName,
                    addedBy: currentUser?.user_metadata?.full_name,
                    isSelfAction: isSameUser,
                    timestamp: new Date().toISOString()
                  }
                }
              );
              sentCount++;
            } catch (notifError) {
              console.error(`[HOUSE] Failed to send notification to ${user.full_name}:`, notifError);
            }
          } else {
            console.log(`[HOUSE] User ${user.full_name} has no push token`);
          }
        };
      } catch (error) {
        console.error('[HOUSE] Error in notification process:', error);
      }

      setShowAddModal(false);
      setNewItem({
        itemName: "",
        quantity: "",
        description: "",
        imageUri: "",
        imageUrl: "",
        price: ""
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
      description: "",
      imageUri: "",
      imageUrl: "",
      price: ""
    });
  };
  
  const openImageView = (imageUrl: string) => {
    setImageLoading(true);
    setSelectedImage(imageUrl);
    setImageViewVisible(true);
  };

  const toggleItemCompleted = async (itemId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      const userName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name

      await updateGroceryItemStatus(itemId, !currentStatus, userName);

      const itemToUpdate = groceryItems.find(item => item.id === itemId);
      const itemPrice = itemToUpdate?.price || 0;
      
      setGroceryItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? {
            ...item,
            completed: !currentStatus,
            completed_by: !currentStatus ? userName : null
          } : item
        )
      );
      
      if (!currentStatus) {
        setTotalSpent(prev => prev + itemPrice);
        setUserSpending(prev => {
          const existingUserIndex = prev.findIndex(u => u.user_name === userName);
          if (existingUserIndex >= 0) {
            const updatedSpending = [...prev];
            updatedSpending[existingUserIndex].total_spent += itemPrice;
            return updatedSpending.sort((a, b) => b.total_spent - a.total_spent);
          } else {
            return [...prev, { user_name: userName, total_spent: itemPrice }]
              .sort((a, b) => b.total_spent - a.total_spent);
          }
        });
      } else {
        setTotalSpent(prev => Math.max(0, prev - itemPrice));
        setUserSpending(prev => {
          const existingUserIndex = prev.findIndex(u => u.user_name === userName);
          if (existingUserIndex >= 0) {
            const updatedSpending = [...prev];
            updatedSpending[existingUserIndex].total_spent = Math.max(
              0, 
              updatedSpending[existingUserIndex].total_spent - itemPrice
            );
            if (updatedSpending[existingUserIndex].total_spent === 0) {
              updatedSpending.splice(existingUserIndex, 1);
            }
            return updatedSpending.sort((a, b) => b.total_spent - a.total_spent);
          }
          return prev;
        });
      }

      if (!currentStatus) {
        try {
          const { data: houseUsers, error: houseError } = await supabase
            .from('neighbors')
            .select('*')
            .eq('house', houseName);

          const usersToNotify = houseError ? users : (houseUsers || []);
          const currentUserId = String(currentUser?.id || "");
          const itemName = groceryItems.find(item => item.id === itemId)?.item_name

          let sentCount = 0;
          for (const user of usersToNotify) {
            const userSlackId = String(user.slack_id || "");
            const isSameUser = currentUserId === userSlackId;

            if (user.push_token) {
              const notificationBody = isSameUser ?
                `You purchased ${itemName}` :
                `${userName} purchased ${itemName}`;
              try {
                await sendAutomaticNotification(
                  user.push_token,
                  'groceryItemCompleted',
                  {
                    title: 'Item completed',
                    body: notificationBody,
                    data: {
                      itemName: itemName,
                      completedBy: userName,
                      isSelfAction: isSameUser,
                      timestamp: new Date().toISOString()
                    }
                  }
                );
                sentCount++;
              } catch (notifError) {
                console.error(`[HOUSE] Failed to send completion notification to ${user.full_name}:`, notifError);
              }
            } else {
              console.log(`[HOUSE] User ${user.full_name} has no push token for completion notification`);
            }
          }
        } catch (error) {
          console.error('[HOUSE] Error sending completion notifications:', error);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    const budgetValue = parseFloat(newBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert("Invalid budget", "Please enter a valid budget amount");
      return;
    }
    
    setLoading(true);
    try {
      const result = await updateHouseBudgetInDB(houseName, budgetValue);
      if (result === null) {
        throw new Error('Failed to update budget');
      }
      setHouseBudget(budgetValue);
      setShowBudgetModal(false);
      setNewBudget("");
      Alert.alert("Success", "House budget updated successfully!");
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Error", "Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  const handleItemNameChange = (text: string) => setNewItem(prev => ({ ...prev, itemName: text }));
  const handleQuantityChange = (text: string) => setNewItem(prev => ({ ...prev, quantity: text }));
  const handlePriceChange = (text: string) => setNewItem(prev => ({ ...prev, price: text }));
  const handleDescriptionChange = (text: string) => setNewItem(prev => ({ ...prev, description: text }));
  const handleRemoveImage = () => setNewItem(prev => ({ ...prev, imageUri: '' }));

  const sections = [
    {
      id: 'header',
      component: (
        <HeaderSection houseName={houseName} />
      )
    },
    {
      id: 'budget',
      component: (
        <BudgetSection 
          houseBudget={houseBudget} 
          totalSpent={totalSpent} 
          onEditPress={() => {
            setNewBudget(houseBudget.toString());
            setShowBudgetModal(true);
          }}
          groceryItems={groceryItems}
        />
      )
    },
    {
      id: 'neighbors',
      component: (
        <NeighborsSection 
          filteredUsers={filteredUsers} 
          houseName={houseName}
          userSpending={userSpending}
          groceryItems={groceryItems}
        />
      )
    },
    {
      id: 'groceries',
      component: (
        <GroceryListSection 
          groceryItems={groceryItems} 
          onAddPress={() => setShowAddModal(true)}
          toggleItemCompleted={toggleItemCompleted}
          openImageView={openImageView}
        />
      )
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={sections}
        style={commonStyles.container}
        contentContainerStyle={[commonStyles.contentContainer, { paddingBottom: 120 }]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => item.component}
        showsVerticalScrollIndicator={true}
      />
      {/* Buton plutitor pentru chat */}
      {houseId && (
        <View style={{ position: 'absolute', bottom: 90, right: 24, zIndex: 20 }}>
          <TouchableOpacity
            onPress={() => setShowChat(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#4A154B',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 6,
            }}
          >
            <Feather name="message-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {houseId && (
        <ChatModal visible={showChat} onClose={() => setShowChat(false)} houseId={houseId} />
      )}
      <View style={styles.backButtonContainer}>
        <BackButton onPress={() => router.replace("/home")} />
      </View>
      
      <BudgetModal 
        visible={showBudgetModal}
        houseName={houseName}
        newBudget={newBudget}
        loading={loading}
        onClose={() => setShowBudgetModal(false)}
        onChangeText={setNewBudget}
        onSubmit={handleUpdateBudget}
      />
      
      <ImageViewerModal 
        visible={imageViewVisible}
        imageLoading={imageLoading}
        selectedImage={selectedImage}
        onClose={() => {
          setImageViewVisible(false);
          setImageLoading(false);
        }}
      />
      
      <AddGroceryItemModal 
        visible={showAddModal}
        newItem={newItem}
        loading={loading}
        itemNameInputRef={itemNameInputRef as React.RefObject<TextInput>}
        quantityInputRef={quantityInputRef as React.RefObject<TextInput>}
        descriptionInputRef={descriptionInputRef as React.RefObject<TextInput>}
        priceInputRef={priceInputRef as React.RefObject<TextInput>}
        onDismiss={dismissKeyboardAndModal}
        onItemNameChange={handleItemNameChange}
        onQuantityChange={handleQuantityChange}
        onDescriptionChange={handleDescriptionChange}
        onPriceChange={handlePriceChange}
        onImageSelection={handleImageSelection}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleAddGroceryItem}
      />
    </View>
  );
}
