import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Typed AsyncStorage access. `parse` turns the stored JSON into a value or returns null; corrupt or
 * missing values are treated as absent.
 */
export async function readJson<T>(
  key: string,
  parse: (raw: unknown) => T | null,
): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage is best-effort */
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* storage is best-effort */
  }
}
