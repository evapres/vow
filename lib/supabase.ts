// Browser / client components — single shared instance for simple imports (`import { supabase }`).
import { createClient } from "./supabase/client";

export const supabase = createClient();

export { createClient };
