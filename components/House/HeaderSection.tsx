import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "./styles";

interface HeaderSectionProps {
  houseName: string;
}

export const HeaderSection = ({ houseName }: HeaderSectionProps) => {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.houseName}>{houseName}</Text>
      <Text style={styles.houseSubtitle}>Grocery management</Text>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 24,
    marginTop: 50,
    position: 'relative',
  },
  houseName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  houseSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_MEDIUM,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  divider: {
    height: 3,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    width: 100,
    borderRadius: 1.5,
  },
});
