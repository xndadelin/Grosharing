import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GroceryItem } from "./GroceryItem";
import { COLORS, commonStyles } from "./styles";

interface GroceryListSectionProps {
  groceryItems: any[];
  onAddPress: () => void;
  toggleItemCompleted: (itemId: number, currentStatus: boolean) => void;
  openImageView: (imageUrl: string) => void;
}

export const GroceryListSection = ({ groceryItems, onAddPress, toggleItemCompleted, openImageView }: GroceryListSectionProps) => {
  return (
    <View style={commonStyles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={commonStyles.sectionTitle}>Grocery List</Text>
          <Text style={styles.itemCount}>{groceryItems.length} items</Text>
        </View>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={onAddPress}
        >
          <Text style={commonStyles.buttonText}>+ Add item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groceryItems}
        keyExtractor={(item) => item.id?.toString()}
        style={styles.groceryList}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <GroceryItem 
            item={item} 
            toggleItemCompleted={toggleItemCompleted} 
            openImageView={openImageView}
          />
        )}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <View style={commonStyles.emptyStateIconContainer}>
              <Text style={commonStyles.emptyStateIcon}>🛒</Text>
            </View>
            <Text style={styles.neighborEmpty}>No grocery items yet</Text>
            <Text style={styles.neighborEmptySubtext}>Add some items to your grocery list</Text>
            <TouchableOpacity 
              style={commonStyles.button}
              onPress={onAddPress}
            >
              <Text style={commonStyles.buttonText}>Add first item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'column',
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.TEXT_MEDIUM,
    marginTop: 2,
  },
  groceryList: {
    flex: 1,
    minHeight: 50,
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
