import React from "react";
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface AddGroceryItemModalProps {
  visible: boolean;
  newItem: {
    itemName: string;
    quantity: string;
    description: string;
    imageUri: string;
    imageUrl: string;
    price: string;
  };
  loading: boolean;
  itemNameInputRef: React.RefObject<TextInput>;
  quantityInputRef: React.RefObject<TextInput>;
  descriptionInputRef: React.RefObject<TextInput>;
  priceInputRef: React.RefObject<TextInput>;
  onDismiss: () => void;
  onItemNameChange: (text: string) => void;
  onQuantityChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPriceChange: (text: string) => void;
  onImageSelection: (useCamera: boolean) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
}

export const AddGroceryItemModal = ({
  visible,
  newItem,
  loading,
  itemNameInputRef,
  quantityInputRef,
  descriptionInputRef,
  priceInputRef,
  onDismiss,
  onItemNameChange,
  onQuantityChange,
  onDescriptionChange,
  onPriceChange,
  onImageSelection,
  onRemoveImage,
  onSubmit
}: AddGroceryItemModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Grocery Item</Text>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Item name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., milk"
                  placeholderTextColor="#999"
                  value={newItem.itemName}
                  onChangeText={onItemNameChange}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => quantityInputRef.current?.focus()}
                  blurOnSubmit={false}
                  ref={itemNameInputRef}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formField, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 2"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newItem.quantity}
                    onChangeText={onQuantityChange}
                    returnKeyType="next"
                    onSubmitEditing={() => priceInputRef.current?.focus()}
                    blurOnSubmit={false}
                    ref={quantityInputRef}
                  />
                </View>

                <View style={[styles.formField, {flex: 1}]}>
                  <Text style={styles.inputLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 2.99"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newItem.price}
                    onChangeText={onPriceChange}
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionInputRef.current?.focus()}
                    blurOnSubmit={false}
                    ref={priceInputRef}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="e.g., Fat-free milk from Trader Joe's"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={newItem.description}
                  onChangeText={onDescriptionChange}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  ref={descriptionInputRef}
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.inputLabel}>Add image (optional)</Text>
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.imageButton} 
                    onPress={() => onImageSelection(false)}
                  >
                    <Text style={styles.imageButtonText}>Choose photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.imageButton} 
                    onPress={() => onImageSelection(true)}
                  >
                    <Text style={styles.imageButtonText}>Take photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {newItem.imageUri ? (
                <View style={styles.previewContainer}>
                  <Image 
                    source={{ uri: newItem.imageUri }} 
                    style={styles.previewImage} 
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={onRemoveImage}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[commonStyles.button, {backgroundColor: COLORS.GREY_LIGHT, marginRight: 10, flex: 1}]}
                  onPress={onDismiss}
                >
                  <Text style={{...commonStyles.buttonText, color: COLORS.TEXT_DARK}}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    commonStyles.button, 
                    {marginLeft: 10, flex: 1},
                    !newItem.itemName.trim() && styles.disabledButton
                  ]}
                  onPress={onSubmit}
                  disabled={loading || !newItem.itemName.trim()}
                >
                  <Text style={commonStyles.buttonText}>
                    {loading ? "Adding..." : "Add item"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowOpacity: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  formField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    paddingLeft: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#f9f9f9',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  imageButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  imageButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: 20,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#4A154B',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.GREY_DARK,
    opacity: 0.7,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
