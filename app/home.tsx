import { Avatar } from "@/components/Avatar"
import { registerForPushNotifications } from "@/lib/notificationService"
import { getUser } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { HouseCard } from "../components/HouseCard"

export const Houses = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedHouse, setSelectedHouse] = useState<string | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
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
                console.log('Error loading user:', error)
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
    
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const validatePassword = async () => {
        const validated = await checkPassword()
        if (validated) {
            setShowPasswordModal(false);

            const { data: neighborExists, error: neighborError } = await supabase
              .from('neighbors')
              .select("*")
              .eq('slack_id', user?.id)
              .eq('house', selectedHouseName);

            if(neighborExists?.length === 0) {
                let pushToken = null;
                try {
                    pushToken = await registerForPushNotifications();
                    
                    if (pushToken && (!pushToken.startsWith('ExponentPushToken[') || !pushToken.endsWith(']'))) {
                        console.log("Invalid push token format:", pushToken)
                    }
                } catch (error) {
                    console.log("Failed to get push token:", error)
                }
                
                const neighbor = {
                    house: selectedHouseName,
                    slack_id: user?.id,
                    avatar_url: user?.user_metadata?.avatar_url,
                    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name,
                    push_token: pushToken
                };
                
                const { data: insertedData, error: insertError } = await supabase.from('neighbors').insert(neighbor).select();
                
                if (insertError) {
                    console.log("Error inserting neighbor:", insertError)
                }
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
                        Hello, {user?.user_metadata?.name || user?.user_metadata?.full_name}
                    </Text>
                    <Text style={styles.subHeaderText}>
                        Select your neighborhood house
                    </Text>
                </View>

                <Avatar avatar_url={user?.user_metadata?.avatar_url} />
            </View>

            <ScrollView 
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>

            {selectedHouse && (
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={showPasswordPrompt}
                    >
                        <Text style={styles.continueButtonText}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Enter house password</Text>
                                <Text style={styles.modalSubtitle}>Password required to join {selectedHouseName}</Text>

                                <TextInput
                                    style={[
                                        styles.passwordInput,
                                        passwordError ? styles.inputError : null
                                    ]}
                                    placeholder="Password"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={validatePassword}
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
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
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
        fontWeight: 'bold',
        color: '#333',
    },
    subHeaderText: {
        color: '#666666',
        fontSize: 16,
        marginTop: 5,
        fontStyle: 'italic'
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    continueButton: {
        backgroundColor: '#4A154B',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 6,
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    continueButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 24,
        shadowOpacity: 0.3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#4A154B',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        color: 'black',
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#ff3b30',
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
    },
    errorText: {
        color: '#ff3b30',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        flex: 1,
        marginRight: 10,
    },
    confirmButton: {
        paddingVertical: 12,
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