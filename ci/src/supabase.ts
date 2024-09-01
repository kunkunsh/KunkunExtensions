import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { type Database } from "../supabase/types/supabase"

export const supabase = createClient<Database>(
	z.string().describe("Supabase URL").parse(process.env.SUPABASE_URL),
	z.string().describe("Supabase Service Role Key").parse(process.env.SUPABASE_SERVICE_ROLE_KEY)
)
