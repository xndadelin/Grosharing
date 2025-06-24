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
        return [];
    }
    return data || [];
}
export const setHouseBudget = async (houseName: string, budget: number) => {
    try {
        const { data, error } = await supabase
            .from('house_budgets')
            .upsert(
                [{ 
                    house_name: houseName, 
                    budget, 
                    updated_at: new Date() 
                }], 
                { onConflict: 'house_name' }
            );
        
        if (error) {
            console.error('Error setting house budget:', error);
            return null;
        }
        
        const { data: checkData, error: checkError } = await supabase
            .from('house_budgets')
            .select('budget')
            .eq('house_name', houseName)
            .maybeSingle();
            
        if (checkError) {
            console.error('Error checking house budget after update:', checkError);
            return null;
        }
        
        return checkData || data;
    } catch (err) {
        console.error('Unexpected error in setHouseBudget:', err);
        return null;
    }
};

export const getHouseBudget = async (houseName: string): Promise<number> => {
    const { data, error } = await supabase
        .from('house_budgets')
        .select('budget')
        .eq('house_name', houseName)
        .maybeSingle();
    if (error) {
        console.error('Error fetching house budget:', error);
        return 0;
    }
    return data?.budget || 0;
}

export const addGroceryItem = async(item: {
    house: string;
    item_name: string;
    quantity: number;
    description: string;
    slack_id: string;
    added_by: string;
    image_url?: string;
    price?: number;
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
            added_by: item.added_by,
            image_url: item.image_url || null,
            price: item.price || null
        }])
        .select();
    
    if(error) {
        console.error('Error adding grocery item:', error);
        return null;
    }
    
    return data;
}

export const getTotalSpent = async (houseName: string): Promise<number> => {
    const { data, error } = await supabase
        .from('grocery_items')
        .select('price')
        .eq('house', houseName)
        .eq('completed', true);
    if (error) {
        console.error('Error fetching spent items:', error);
        return 0;
    }
    const total = (data || []).reduce((sum, item) => sum + (item.price || 0), 0);
    return total;
};

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

export const getHouseMembersCount = async(): Promise<Record<string, number>> => {
    try {
        const { data, error } = await supabase
            .from('neighbors')
            .select('house');

        if (error) {
            console.error('Error fetching house members:', error);
            return {};
        }

        const memberCounts: Record<string, number> = {};
        data.forEach(neighbor => {
            const houseName = neighbor.house;
            if (houseName) {
                memberCounts[houseName] = (memberCounts[houseName] || 0) + 1;
            }
        });

        return memberCounts;
    } catch (error) {
        console.error('Error in getHouseMembersCount:', error);
        return {};
    }
};

