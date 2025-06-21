import { getUser } from "@/lib/queries"
import { View } from "react-native"


export const Houses = async () => {
    const user = await getUser()

    return user && (
        <View
            style={{flex: 1}}
        >
            Hello, {user.user_metadata.full_name}
        </View>
    )
}