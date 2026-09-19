import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/shared/lib/supabase';

const BUCKET = 'avatars';
/** Square crop, small enough that the upload is instant on mobile data. */
const EDIT_ASPECT: [number, number] = [1, 1];
const QUALITY = 0.8;

/**
 * Public URL of a stored avatar (`profiles.avatar_storage_path`). The bucket is public, like
 * `scenarios`, so the picture is served straight from the CDN and `expo-image` can cache it.
 * Every upload writes a new random file name, so a replaced picture never shows a stale cache.
 */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Opens the system picker with a square crop. Resolves with `null` when the user cancels or
 * denies access to their photos; the caller leaves the current picture alone in both cases.
 */
export async function pickAvatar(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: EDIT_ASPECT,
    quality: QUALITY,
    exif: false,
  });
  if (result.canceled) return null;
  return result.assets[0] ?? null;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Uploads the picked image into the caller's own folder and returns the new object path.
 *
 * The folder is the user id, which is what the Storage policies check. React Native cannot turn
 * a `file://` URI into a Blob the SDK can size, so the bytes go through an ArrayBuffer (this is
 * what Supabase's own Expo guide does).
 */
export async function uploadAvatar(
  userId: string,
  asset: ImagePicker.ImagePickerAsset,
): Promise<string> {
  const contentType = asset.mimeType && EXTENSIONS[asset.mimeType] ? asset.mimeType : 'image/jpeg';
  // React Native has no `crypto` global here, and the name only has to be unique inside the
  // user's own folder: privacy comes from the Storage policies, not from the file name.
  const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const path = `${userId}/${name}.${EXTENSIONS[contentType]}`;
  const bytes = await fetch(asset.uri).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType });
  if (error) throw new Error(error.message);
  return path;
}

/** Drops the previous picture after a new one was stored; failure only wastes a few kilobytes. */
export async function removeAvatar(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await supabase.storage
    .from(BUCKET)
    .remove([path])
    .catch(() => {});
}
