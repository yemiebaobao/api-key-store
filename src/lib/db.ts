import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("WARNING: Supabase not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  created_at: string;
}

export interface KeyPoolItem {
  id: string;
  key: string;
  status: "available" | "assigned";
  created_at: string;
}

export interface AssignedKey {
  id: string;
  user_id: string;
  key_id: string;
  key: string;
  order_id: string;
  assigned_at: string;
}

// Users

export async function getUsers(): Promise<User[]> {
  const { data } = await supabase.from("users").select("*");
  return data ?? [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data } = await supabase.from("users").select("*").eq("email", email).single();
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase.from("users").select("*").eq("id", id).single();
  return data;
}

export async function createUser(user: User) {
  await supabase.from("users").insert(user);
}

// Key Pool

export async function getKeyPool(): Promise<KeyPoolItem[]> {
  const { data } = await supabase.from("key_pool").select("*");
  return data ?? [];
}

export async function getAvailableKeyCount(): Promise<number> {
  const { count } = await supabase
    .from("key_pool")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");
  return count ?? 0;
}

export async function importKeysToPool(keys: string[]) {
  const now = Date.now();
  const pool: KeyPoolItem[] = keys.map((key) => ({
    id: "kp_" + now + "_" + Math.random().toString(36).slice(2, 8),
    key,
    status: "available" as const,
    created_at: new Date().toISOString(),
  }));
  await supabase.from("key_pool").insert(pool);
}

export async function assignAvailableKey(
  userId: string,
  orderId: string
): Promise<AssignedKey | null> {
  const { data: available } = await supabase
    .from("key_pool")
    .select("*")
    .eq("status", "available")
    .limit(1)
    .single();

  if (!available) return null;

  await supabase.from("key_pool").update({ status: "assigned" }).eq("id", available.id);

  const now = Date.now();
  const assigned: AssignedKey = {
    id: "asn_" + now + "_" + Math.random().toString(36).slice(2, 8),
    user_id: userId,
    key_id: available.id,
    key: available.key,
    order_id: orderId,
    assigned_at: new Date().toISOString(),
  };

  await supabase.from("assigned_keys").insert(assigned);
  return assigned;
}

// Assigned Keys

export async function getAssignedKeys(): Promise<AssignedKey[]> {
  const { data } = await supabase.from("assigned_keys").select("*");
  return data ?? [];
}

export async function getAssignedKeysByUserId(userId: string): Promise<AssignedKey[]> {
  const { data } = await supabase.from("assigned_keys").select("*").eq("user_id", userId);
  return data ?? [];
}