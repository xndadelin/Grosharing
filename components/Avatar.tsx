import { supabase } from "@/lib/supabase";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AvatarProps = {
    avatar_url: string;
};

export const Avatar = ({ avatar_url }: AvatarProps) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const router = useRouter();

    const handleAvatarPress = () => {
        setMenuVisible(!menuVisible);
    };
    
    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes, logout",
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace("/");
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
                <Image
                    source={{
                        uri: avatar_url
                    }}
                    style={styles.avatar}
                />
            </TouchableOpacity>

            {menuVisible && (
                <View style={styles.menu}>
                    <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="log-out" size={18} color="#333" style={{ marginRight: 8 }} />
                            <Text style={styles.menuText}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        alignItems: "flex-end",
    },
    avatarContainer: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
        borderColor: '#4A154B',
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menu: {
        position: "absolute",
        top: 50,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 10,
        minWidth: 120,
    },
    menuItem: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    menuText: {
        fontSize: 15,
        color: "#333",
        fontWeight: '500',
    },
});
