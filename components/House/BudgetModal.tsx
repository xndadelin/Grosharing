import React from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLORS, modalStyles } from "./styles";

interface BudgetModalProps {
  visible: boolean;
  houseName: string;
  newBudget: string;
  loading: boolean;
  onClose: () => void;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const BudgetModal = ({
  visible,
  houseName,
  newBudget,
  loading,
  onClose,
  onChangeText,
  onSubmit
}: BudgetModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.content}>
              <Text style={modalStyles.title}>Update budget</Text>
              <Text style={styles.budgetModalSubtitle}>Set a new budget for {houseName}</Text>

              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetDollarSign}>$</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Enter amount"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newBudget}
                  onChangeText={onChangeText}
                  returnKeyType="done"
                  autoFocus
                />
              </View>

              <View style={styles.budgetInfoBox}>
                <Text style={styles.budgetInfoText}>
                  This budget will be used to track expenses for all grocery items marked as completed.
                </Text>
              </View>

              <View style={modalStyles.buttonsContainer}>
                <TouchableOpacity
                  style={modalStyles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={modalStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    modalStyles.confirmButton, 
                    (!newBudget || isNaN(parseFloat(newBudget)) || parseFloat(newBudget) <= 0) && modalStyles.disabledButton
                  ]}
                  onPress={onSubmit}
                  disabled={loading || !newBudget || isNaN(parseFloat(newBudget)) || parseFloat(newBudget) <= 0}
                >
                  <Text style={modalStyles.confirmText}>
                    {loading ? "Updating..." : "Update budget"}
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
    backgroundColor: COLORS.WHITE,
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
  budgetModalSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_MEDIUM,
    textAlign: 'center',
    marginBottom: 20,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    padding: 5,
  },
  budgetDollarSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    paddingHorizontal: 15,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    padding: 15,
    color: COLORS.TEXT_DARK,
  },
  budgetInfoBox: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  budgetInfoText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    textAlign: 'center',
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
    backgroundColor: COLORS.GREY_LIGHT,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.TEXT_DARK,
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
