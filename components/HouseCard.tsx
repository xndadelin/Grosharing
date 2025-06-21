import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HouseCardProps = {
  name: string;
  location: string;
  imageUrl: ImageSourcePropType;
  selected?: boolean;
  onSelect: () => void;
};

export const HouseCard = ({ name, location, imageUrl, selected = false, onSelect }: HouseCardProps) => {
  return (
    <TouchableOpacity 
      style={[styles.card, selected && styles.selectedCard]} 
      onPress={onSelect}
    >
      <Image
        source={imageUrl}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.houseName}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
      {selected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    height: 160,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4A154B',
  },
  image: {
    width: '100%',
    height: 110,
  },
  cardContent: {
    padding: 10,
  },
  houseName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: '#666',
    fontSize: 14,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A154B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  }
});
