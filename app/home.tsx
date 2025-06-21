import { getUser } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
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

    const houses = [
        {
            id: "atelier",
            name: "Atelier",
            location: "Lower Haight",
            imageUrl: "https://v5.airtableusercontent.com/v3/u/42/42/1750478400000/9HBv6z2PIWM-s5rIUTf1YQ/QgtkT84H91Jj9wQ2GrvqcnQ4B7EaytrSvRa7stDrUlEZmmvNIkZaKuhSLaGnHthlutEMGEZ9l10ZxZ8m02ZUp3lqbAmgKSg9sr3vcuI5zq2rhoofwvrk8wkC4qX73ykFjAdT9rvUIIE2FJ_EqU9RmSE6u6Ub23xZpYlqidq4WbE/sk1vn6NDA3IO-gl3DnOlcYqvWKJwPT4rEgGXJR5jmPU"
        },
        {
            id: "casa",
            name: "Casa",
            location: "Mission",
            imageUrl: "https://v5.airtableusercontent.com/v3/u/42/42/1750478400000/vIBRmybJKYxKiVmpwXxMyw/oGwMfIV_SZ2xy-ZwYOjrVHoLmPHKZELhy0HZ156026d99ZI-0a5VwJEl_Ee3LGBe8xm6qsYn4OKs8hf5AFsmePKnRHd5hK9jd4YWX5QMdYLwuwb40BQMgHNTBZMzJDsK5b9bfkyyLuzu_7J-kp5paClLqi3UsTAPaPcnQMPBJWw/FgEqEmUgxXdUJx3EoPmKiF0D9W1GWj4pg_iZ_rf4W1c"
        },
        {
            id: "jia",
            name: "Jiā",
            location: "Sunset",
            imageUrl: "https://v5.airtableusercontent.com/v3/u/42/42/1750478400000/QokyACE0jj3JU6qRa_7gAw/i4yunbqs6LAHpBEc1kuGTIvj9_XTfFUWws3aLCmK-rzVPrhE9AJiKhFBqznpX_5blfjh2ver3QzYFxrYWb4HO2iJkbuh_XXzEh64mN5NbUMjVsqF8n3WCBpNRRIYY09minmFv98hGo6976NkSGGr6kpDnP_CFeiv64lroPegcSA/EY5y2YJAbZNDUqUDTP89LpoAhMwLPlw9Ct1uMk2sXvo"
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

    if (showResult) {
        return (
            <View style={styles.resultContainer}>
                <Text style={styles.resultText}>{selectedHouseName}</Text>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        setShowResult(false);
                        setSelectedHouse(null);
                    }}
                >
                    <Text style={styles.backButtonText}>Back!</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const checkPassword = async () => {
        try {
            const { data, error } = await supabase
                .from('password_houses')
                .select("*")
                .eq("house", selectedHouse)  
                .eq("password", password)
                .maybeSingle();

            console.log(selectedHouse, password, data, error)

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
            setShowResult(true);
        } else {
            setPasswordError("Incorrect password. Please try again.");
        }
    };

    return (
        <View style={{ height: '100%', width: '100%', backgroundColor: 'rgb(255, 249, 230)' }}>
            <Text
                style={{ marginTop: 60, marginLeft: 20, fontSize: 30, fontWeight: 'bold' }}
            >
                Hello, {user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'}
            </Text>
            <Text
                style={{ marginLeft: 20, color: '#666666', fontSize: 16, marginTop: 5, marginBottom: 20, fontStyle: 'italic' }}
            >
                Select your neighborhood house
            </Text>

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
                                onPress={() => { validatePassword(); checkPassword(); }}
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