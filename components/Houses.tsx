import { getUser } from "@/lib/queries"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

export const Houses = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    
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
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(255, 249, 230)'}}>
                <Text>Loading...</Text>
            </View>
        )
    }

    return (
        <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(255, 249, 230)'}}>
            <Text
                style={{marginTop: 100, marginLeft: 20, fontSize: 30, fontWeight: 'bold'}}    
            >
                Hello, {user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'}
            </Text>
            <Text 
                style={{marginLeft: 20, color: '#666666', fontSize: 16, marginTop: 5, fontStyle: 'italic'}}
            >
                Welcome to your neighborhood{'\n'}sharing groceries app
            </Text>
        </View>
    )
}