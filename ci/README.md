Generate Typescript types for Supabase

```bash
pnpm dlx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > supabase/types/supabase.ts
```

```bash
bun validate.ts  # this script does a simple verification over all extensioni files
```