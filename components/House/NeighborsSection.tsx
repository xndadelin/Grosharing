import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface NeighborsSectionProps {
  filteredUsers: any[];
  houseName: string;
}

export const NeighborsSection = ({ filteredUsers, houseName }: NeighborsSectionProps) => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Neighbors</Text>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.slack_id || item.id?.toString() || Math.random().toString()}
        style={styles.neighborsList}
        showsVerticalScrollIndicator={true}
        numColumns={4}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.neighborItemColumn}>
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
          </View>
        )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  neighborsList: {
    maxHeight: 320,
  },
  neighborItemColumn: {
    alignItems: 'center',
    width: '25%',
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
