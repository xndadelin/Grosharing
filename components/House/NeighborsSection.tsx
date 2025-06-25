import React, { useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface NeighborsSectionProps {
  filteredUsers: any[];
  houseName: string;
  userSpending: any[];
  groceryItems: any[];
}

export const NeighborsSection = ({ filteredUsers, houseName, userSpending, groceryItems }: NeighborsSectionProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const maxReference = 150;

  const getTotalSpent = (user: any) => {
    const spending = userSpending.find(u => u.slack_id === user.slack_id || u.user_name === user.full_name);
    return spending ? spending.total_spent : 0;
  };

  const userPurchases = selectedUser
    ? groceryItems.filter((item) => item.completed && (item.completed_by === selectedUser.slack_id || item.completed_by === selectedUser.full_name))
    : [];

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Neighbors & Spending</Text>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.slack_id || item.id?.toString() || Math.random().toString()}
        style={styles.neighborsList}
        showsVerticalScrollIndicator={true}
        numColumns={2}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => {
          const totalSpent = getTotalSpent(item);
          const percent = maxReference > 0 ? Math.round((totalSpent / maxReference) * 100) : 0;
          return (
            <TouchableOpacity onPress={() => { setSelectedUser(item); setModalVisible(true); }} style={styles.neighborItemColumn}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: item.avatar_url }}
                  style={styles.neighborAvatar}
                />
                <View style={styles.neighborStatusIndicator} />
              </View>
              <Text style={styles.neighborName} numberOfLines={1} ellipsizeMode="tail">
                {item.full_name}
              </Text>
              <Text style={styles.amountText}>${totalSpent.toFixed(2)}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    {width: maxReference > 0 ? `${Math.min(100, (totalSpent / maxReference) * 100)}%` : '0%'}
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <View style={commonStyles.emptyStateIconContainer}>
              <Text style={commonStyles.emptyStateIcon}>👋</Text>
            </View>
            <Text style={styles.neighborEmpty}>No neighbors yet</Text>
            <Text style={styles.neighborEmptySubtext}>Invite friends to join {houseName}</Text>
          </View>
        }
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, minWidth: 300, maxHeight: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
              Purchases by {selectedUser?.full_name}
            </Text>
            <FlatList
              data={userPurchases}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '600', color: COLORS.TEXT_DARK }}>{item.item_name}</Text>
                  <Text style={{ color: COLORS.TEXT_MEDIUM, fontSize: 13 }}>
                    {item.quantity} x ${item.price?.toFixed(2) || '-'}
                  </Text>
                  {item.description ? (
                    <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12 }}>{item.description}</Text>
                  ) : null}
                </View>
              )}
              style={{ maxHeight: 300, marginBottom: 10 }}
            />
            <Pressable
              style={{ marginTop: 10, alignSelf: 'center', padding: 8, borderRadius: 6, backgroundColor: COLORS.PRIMARY }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  neighborsList: {
    maxHeight: 600,
  },
  neighborItemColumn: {
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  neighborAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    backgroundColor: COLORS.GREY_LIGHT,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  neighborStatusIndicator: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  neighborName: {
    fontSize: 13,
    color: COLORS.TEXT_DARK,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 70,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WARNING,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.GREY_LIGHT,
    borderRadius: 3,
    overflow: 'hidden',
    width: '90%',
    marginTop: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  neighborEmpty: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
  },
  neighborEmptySubtext: {
    fontSize: 15,
    color: COLORS.TEXT_MEDIUM,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
