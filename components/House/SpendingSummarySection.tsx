import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { COLORS, commonStyles } from "./styles";

interface SpendingUser {
  user_name: string;
  total_spent: number;
}

interface SpendingSummarySectionProps {
  userSpending: SpendingUser[];
  totalSpent: number;
}

export const SpendingSummarySection = ({ userSpending, totalSpent }: SpendingSummarySectionProps) => {
  const maxReference = 150;
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Who paid</Text>
      <FlatList
        data={userSpending}
        keyExtractor={(item) => item.user_name}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
        renderItem={({ item }) => {
          const percent = maxReference > 0 ? Math.round((item.total_spent / maxReference) * 100) : 0;
          return (
            <View style={styles.spendingItem}>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.user_name}</Text>
                <View style={styles.percentContainer}>
                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amountText}>${item.total_spent.toFixed(2)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    {width: maxReference > 0 ? `${Math.min(100, (item.total_spent / maxReference) * 100)}%` : '0%'}
                  ]}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No one has completed any purchases yet</Text>
            <Text style={styles.emptySubtext}>
              Spending will appear when items are marked as completed
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  spendingItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
  },
  percentContainer: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  amountContainer: {
    marginBottom: 10,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WARNING,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.GREY_LIGHT,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_MEDIUM,
    textAlign: 'center',
  }
});
