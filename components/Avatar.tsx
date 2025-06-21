import { supabase } from "@/lib/supabase";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

type AvatarProps = {
    avatar_url: string;
};

export const Avatar = ({ avatar_url }: AvatarProps) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const router = useRouter()

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
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleAvatarPress}>
                <Image
                    source={{
                        uri: avatar_url || "https://i.pravatar.cc/300",
                    }}
                    style={styles.avatar}
                />
            </TouchableOpacity>

            {menuVisible && (
                <View style={styles.menu}>
                    <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="log-out" size={12} color="#333" />
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
        borderColor: '#4A154B',
        borderWidth: 1
    },
    menu: {
        position: "absolute",
        top: 50,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        zIndex: 10,
    },
    menuItem: {
        paddingVertical: 6,
    },
    menuText: {
        fontSize: 16,
        color: "#333",
    },
});
