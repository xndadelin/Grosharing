import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'uuid-random';
import { supabase } from "./supabase";

export const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
  try {
    const fileExt = uri.split('.').pop();
    const fileName = `${uuid()}.${fileExt}`;
    const filePath = `grocery_images/${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error('File does not exist');

    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, decode(base64Data), {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error in image upload process:', error);
    return null;
  }
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const pickImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access media library was denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const takePicture = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const deleteImageFromSupabase = async (imageUrl: string): Promise<boolean> => {
  try {
    const baseStorageUrl = supabase.storage.from('images').getPublicUrl('').data.publicUrl;
    const filePath = imageUrl.replace(baseStorageUrl, '');
    
    if (!filePath) return false;
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in image deletion process:', error);
    return false;
  }
};
