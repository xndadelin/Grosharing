import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "./styles";

interface GroceryItemProps {
  item: any;
  toggleItemCompleted: (itemId: number, currentStatus: boolean) => void;
  openImageView: (imageUrl: string) => void;
}

export const GroceryItem = ({ item, toggleItemCompleted, openImageView }: GroceryItemProps) => {
  return (
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
          <View style={styles.groceryItemNameContainer}>
            <Text style={[
              styles.groceryItemName,
              item.completed && styles.groceryItemCompleted
            ]}>
              {item.item_name}
            </Text>
            {item.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
          <View style={styles.quantityPriceContainer}>
            {item.price > 0 && (
              <View style={styles.priceContainer}>
                <Text style={styles.groceryItemPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              </View>
            )}
            <Text style={styles.groceryItemQuantity}>
              {item.quantity} {parseInt(item.quantity) === 1 ? 'piece' : 'pieces'}
            </Text>
          </View>
        </View>

        {item.image_url && (
          <TouchableOpacity onPress={() => openImageView(item.image_url)}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.groceryItemImage} 
                resizeMode="cover"
              />
              {item.isImageLoading && (
                <ActivityIndicator 
                  style={styles.imageLoader} 
                  size="large" 
                  color={COLORS.PRIMARY} 
                />
              )}
            </View>
          </TouchableOpacity>
        )}

        {item.description ? (
          <Text style={styles.groceryItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.groceryItemFooter}>
          <View style={styles.userInfo}>
            <Text style={styles.groceryItemAddedBy}>
              Added by {item.added_by}
            </Text>
            {item.completed && item.completed_by && (
              <Text style={styles.groceryItemCompletedBy}>
                Completed by {item.completed_by}
              </Text>
            )}
          </View>
          <Text style={styles.dateInfo}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.PRIMARY,
  },
  checkmark: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  groceryItemContent: {
    flex: 1,
  },
  groceryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groceryItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  groceryItemNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  completedBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  quantityPriceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  priceContainer: {
    backgroundColor: `${COLORS.WARNING}22`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  groceryItemPrice: {
    fontSize: 16,
    color: COLORS.WARNING,
    fontWeight: '700',
    marginBottom: 2,
  },
  groceryItemCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.TEXT_LIGHT,
  },
  groceryItemQuantity: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  groceryItemDescription: {
    fontSize: 14,
    color: COLORS.TEXT_MEDIUM,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: COLORS.GREY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  groceryItemImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  groceryItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
  },
  userInfo: {
    flex: 1,
  },
  groceryItemAddedBy: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    marginRight: 8,
  },
  groceryItemCompletedBy: {
    fontSize: 12,
    color: COLORS.SUCCESS,
    fontWeight: '500',
  },
  dateInfo: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
  },
});
