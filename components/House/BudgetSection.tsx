import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface BudgetSectionProps {
  houseBudget: number;
  totalSpent: number;
  onEditPress: () => void;
  groceryItems: any[];
}

export const BudgetSection = ({ houseBudget, totalSpent, onEditPress, groceryItems }: BudgetSectionProps) => {
  const safeGroceryItems = Array.isArray(groceryItems) ? groceryItems : [];
  const spendingPerUser = safeGroceryItems
    .filter(item => item.completed && item.completed_by && item.price > 0)
    .reduce((acc: Record<string, number>, item: any) => {
      acc[item.completed_by] = (acc[item.completed_by] || 0) + item.price;
      return acc;
    }, {});
  const spendingArray = Object.entries(spendingPerUser)
    .map(([user, total]) => ({ user, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <View style={[commonStyles.section, styles.budgetSection]}>
      <View style={styles.budgetHeader}>
        <Text style={commonStyles.sectionTitle}>Budget tracker</Text>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={onEditPress}
        >
          <Text style={commonStyles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.budgetDetailsContainer}>
        <View style={styles.budgetDetails}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total budget</Text>
            <Text style={styles.budgetValue}>${houseBudget.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent amount</Text>
            <Text style={styles.budgetValue}>${totalSpent.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.remainingBudget, (houseBudget - totalSpent) < 0 ? styles.negativeAmount : null]}>
              ${(houseBudget - totalSpent).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            {width: `${Math.min(100, (totalSpent / Math.max(houseBudget, 0.01)) * 100)}%`},
            totalSpent > houseBudget ? styles.overBudget : null
          ]} 
        />
        <Text style={styles.progressText}>
          {houseBudget <= 0 ? '0' : `${Math.min(999, Math.round((totalSpent / houseBudget) * 100))}`}%
        </Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
          Who paid
        </Text>
        {spendingArray.length === 0 ? (
          <Text>No one has completed any purchases yet.</Text>
        ) : (
          spendingArray.map(({ user, total }) => (
            <View key={user} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>{user}</Text>
              <Text>${total.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  budgetSection: {},
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetDetailsContainer: {
    marginBottom: 16,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  budgetItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  budgetLabel: {
    fontSize: 14,
    color: COLORS.TEXT_MEDIUM,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
  },
  remainingBudget: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SUCCESS, 
  },
  negativeAmount: {
    color: COLORS.DANGER, 
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: COLORS.GREY_LIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  overBudget: {
    backgroundColor: COLORS.DANGER,
  },
  progressText: {
    position: 'absolute',
    right: 12,
    top: 4,
    color: COLORS.TEXT_DARK,
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
