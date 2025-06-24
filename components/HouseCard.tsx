import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HouseCardProps = {
    name: string;
    location: string;
    imageUrl: any;
    selected: boolean;
    onSelect: () => void;
    membersCount?: number;
};

export const HouseCard = ({ name, location, imageUrl, selected, onSelect, membersCount = 0 }: HouseCardProps) => {
    return (
        <TouchableOpacity 
            style={[
                styles.cardContainer, 
                selected ? styles.selectedCard : null
            ]} 
            onPress={onSelect}
        >
            <View style={styles.imageContainer}>
                <Image source={imageUrl} style={styles.cardImage} />
                <View style={styles.membersCountBadge}>
                    <Text style={styles.membersCountText}>{membersCount}</Text>
                    <Text style={styles.memberLabel}>{membersCount === 1 ? 'member' : 'members'}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={styles.cardSubtitle}>{location}</Text>
                {selected && (
                    <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>Selected</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '90%',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    selectedCard: {
        borderColor: '#4A154B',
        borderWidth: 2,
        shadowColor: '#4A154B',
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    membersCountBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(74, 21, 75, 0.85)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    membersCountText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    memberLabel: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#4A154B',
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#555',
    },
    selectedIndicator: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: '#4A154B',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    selectedText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
