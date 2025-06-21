import { Avatar } from "@/components/Avatar"
import { getUser } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { HouseCard } from "../components/HouseCard"

export const Houses = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedHouse, setSelectedHouse] = useState<string | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showResult, setShowResult] = useState(false)
    const [selectedHouseName, setSelectedHouseName] = useState("")
    const router = useRouter()

    const houses = [
        {
            id: "atelier",
            name: "Atelier",
            location: "Lower Haight",
            imageUrl: require("../assets/images/LowerHaight.png")
        },
        {
            id: "casa",
            name: "Casa",
            location: "Mission",
            imageUrl: require("../assets/images/Mission.png")
        },
        {
            id: "jia",
            name: "Jiā",
            location: "Sunset",
            imageUrl: require("../assets/images/Sunset.png")
        }
    ];
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getUser()
                setUser(userData)
            } catch (error) {
                console.error("Error loading user:", error)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(255, 249, 230)' }}>
                <Text>Loading...</Text>
            </View>
        )
    }
    
    const checkPassword = async () => {
        try {
            const { data, error } = await supabase
                .from('password_houses')
                .select("*")
                .eq("house", selectedHouse)
                .eq("password", password)
                .maybeSingle();

            return !error && data !== null;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    }

    const handleHouseSelect = (houseId: string) => {
        setSelectedHouse(houseId);

        const house = houses.find(h => h.id === houseId);
        if (house) {
            setSelectedHouseName(house.name);
        }
    };

    const showPasswordPrompt = () => {
        setPassword("");
        setPasswordError("");
        setShowPasswordModal(true);
    };

    const validatePassword = async () => {
        const validated = await checkPassword()
        if (validated) {
            setShowPasswordModal(false);

            const { data: neighborExists, error: neighborError } = await supabase.from('neighbors').select("*").eq('slack_id', user?.id)

            if(neighborExists?.length === 0) {
                const neighbor = {
                    house: selectedHouseName,
                    slack_id: user?.id,
                    avatar_url: user?.user_metadata?.avatar_url,
                    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name
                };

                const { error: insertError } = await supabase.from('neighbors').insert(neighbor);
            }

            router.replace({
                pathname: "/houseScreen",
                params: { houseName: selectedHouseName }
            });
        } else {
            setPasswordError("Incorrect password. Please try again.");
        }
    };

    return (
        <View style={{ height: '100%', width: '100%', backgroundColor: 'rgb(255, 249, 230)' }}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerText}>
                        Hello, {user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'}
                    </Text>
                    <Text style={styles.subHeaderText}>
                        Select your neighborhood house
                    </Text>
                </View>

                <Avatar avatar_url={user?.user_metadata?.avatar_url} />
            </View>

            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
                {houses.map(house => (
                    <HouseCard
                        key={house.id}
                        name={house.name}
                        location={house.location}
                        imageUrl={house.imageUrl}
                        selected={selectedHouse === house.id}
                        onSelect={() => handleHouseSelect(house.id)}
                    />
                ))}

                {selectedHouse && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#4A154B',
                            paddingHorizontal: 30,
                            paddingVertical: 15,
                            borderRadius: 8,
                            marginTop: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={showPasswordPrompt}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Password Modal */}
            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter house password</Text>

                        <TextInput
                            style={[
                                styles.passwordInput,
                                passwordError ? styles.inputError : null
                            ]}
                            placeholder="Password"
                            placeholderTextColor="#000"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        {passwordError ? (
                            <Text style={styles.errorText}>{passwordError}</Text>
                        ) : null}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowPasswordModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={validatePassword}
                            >
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 60,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold'
    },
    subHeaderText: {
        color: '#666666',
        fontSize: 16,
        marginTop: 5,
        fontStyle: 'italic'
    },
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(255, 249, 230)',
    },
    resultText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4A154B',
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#4A154B',
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#4A154B',
    },
    logoutButtonText: {
        color: '#4A154B',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#4A154B',
        textAlign: 'center',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
        color: 'black'
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#EEE',
        flex: 1,
        marginRight: 10,
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#4A154B',
        flex: 1,
        marginLeft: 10,
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#333',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        textAlign: 'center',
        color: '#FFF',
        fontWeight: 'bold',
    },
})

export default Houses;