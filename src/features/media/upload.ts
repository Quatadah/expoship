import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export type UploadResult = {
  path: string;
  publicUrl: string;
};

type PickAndUploadOptions = {
  bucket: string;
  directory?: string;
  maxWidth?: number;
  quality?: number;
  fileName?: string;
};

const defaultOptions: Required<PickAndUploadOptions> = {
  bucket: 'public',
  directory: 'uploads',
  maxWidth: 1200,
  quality: 0.75,
  fileName: '',
};

const getExtensionFromMimeType = (mimeType: string | null | undefined) => {
  if (!mimeType) {
    return 'jpg';
  }

  const [, subtype] = mimeType.split('/');
  return subtype ?? 'jpg';
};

const uriToBlob = async (uri: string) => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error('File not found at provided URI.');
  }

  const response = await fetch(uri);
  return response.blob();
};

export const pickAndUploadImage = async (
  options?: PickAndUploadOptions
): Promise<UploadResult | null> => {
  const mergedOptions = { ...defaultOptions, ...options };

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'We need access to your photo library.');
    return null;
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return null;
  }

  const asset = pickerResult.assets[0];

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [
      {
        resize: {
          width: mergedOptions.maxWidth,
        },
      },
    ],
    {
      compress: mergedOptions.quality,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const blob = await uriToBlob(manipulated.uri);
  const fileExtension = getExtensionFromMimeType(asset.mimeType);
  const fileName =
    mergedOptions.fileName ||
    `${Date.now()}-${Math.round(Math.random() * 1_000_000)}.${fileExtension}`;
  const path = `${mergedOptions.directory}/${fileName}`;

  const { error } = await supabase.storage
    .from(mergedOptions.bucket)
    .upload(path, blob, {
      upsert: true,
      contentType: asset.mimeType ?? 'image/jpeg',
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(mergedOptions.bucket).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
};

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw error;
  }
};

