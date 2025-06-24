import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface BudgetSectionProps {
  houseBudget: number;
  totalSpent: number;
  onEditPress: () => void;
}

export const BudgetSection = ({ houseBudget, totalSpent, onEditPress }: BudgetSectionProps) => {
  return (
    <View style={[commonStyles.section, styles.budgetSection]}>
      <View style={styles.budgetHeader}>
        <Text style={commonStyles.sectionTitle}>Budget Tracker</Text>
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
            <Text style={styles.budgetLabel}>Total Budget</Text>
            <Text style={styles.budgetValue}>${houseBudget.toFixed(2)}</Text>
          </View>
          
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent Amount</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  budgetSection: {
  },
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
