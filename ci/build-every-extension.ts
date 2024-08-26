import { $, fileURLToPath } from "bun";
import path from "path";
import { ExtensionsDir } from "./src/constant";
import fs from "fs";

for (const dir of fs.readdirSync(ExtensionsDir)) {
  const extPath = path.resolve(ExtensionsDir, dir);
  // skip if not a directory
  if (!fs.statSync(extPath).isDirectory()) continue;
  await $`pnpm install`.cwd(extPath);
  await $`pnpm build`.cwd(extPath);
}
