import { kv as vercelKv } from "@vercel/kv";

const hasKv = Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN);

const memoryStore = new Map<string, unknown>();

export const isPersistent = hasKv;

export const store = {
  async get<T>(key: string): Promise<T | null> {
    if (hasKv) {
      const value = await vercelKv.get<T>(key);
      return value ?? null;
    }
    return (memoryStore.get(key) as T | undefined) ?? null;
  },
  async set(key: string, value: unknown): Promise<void> {
    if (hasKv) {
      await vercelKv.set(key, value);
      return;
    }
    memoryStore.set(key, value);
  },
};
