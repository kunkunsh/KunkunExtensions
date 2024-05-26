import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "../supabase/types/supabase";

export const supabase = createClient<Database>(
  z.string().parse(process.env.SUPABASE_URL),
  z.string().parse(process.env.SUPABASE_SERVICE_ROLE_KEY),
);
