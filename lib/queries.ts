import { supabase } from "./supabase";

export const getUser = async() => {
    const { data, error } = await supabase.auth.getUser();
    return data?.user
}

export const getGroceryItems = async(houseName: string) => {
    const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('house', houseName)
        .order('created_at', { ascending: false });
    
    if(error) {
        console.error('Error fetching grocery items:', error);
        return [];
    }
    return data || [];
}

export const addGroceryItem = async(item: {
    house: string;
    item_name: string;
    quantity: number;
    description: string;
    slack_id: string;
    added_by: string;
}) => {
    const { data: userData } = await supabase.auth.getUser();
    const userUid = userData?.user?.id;
    
    if (!userUid) {
        console.error('User not authenticated');
        return null;
    }
    
    const { data, error } = await supabase
        .from('grocery_items')
        .insert([{
            house: item.house,
            item_name: item.item_name,
            quantity: item.quantity,
            description: item.description,
            slack_id: userUid,
            user_slack_id: item.slack_id,
            added_by: item.added_by
        }])
        .select();
    
    if(error) {
        console.error('Error adding grocery item:', error);
        return null;
    }
    
    return data;
}

export const updateGroceryItemStatus = async(itemId: number, completed: boolean, completedBy: string) => {
    const updateData = completed ? { completed, completed_by: completedBy } : { completed, completed_by: null };
    
    const { data, error } = await supabase
        .from('grocery_items')
        .update(updateData)
        .eq('id', itemId)
        .select();
    
    if(error) {
        console.error('Error updating grocery item status:', error);
        return null;
    }
    
    return data;
}

