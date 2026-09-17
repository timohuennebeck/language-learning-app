import AsyncStorage from '@react-native-async-storage/async-storage';
import type { z } from 'zod';

/** Typed, schema-validated AsyncStorage access. Corrupt values are treated as missing. */
export async function readJson<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
): Promise<z.infer<S> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
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
    /* ignore */
  }
}
