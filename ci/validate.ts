import fs from "fs";
import { join } from "path";
import { buildWithDockerAndValidate, checkPackagesValidity } from "./src/utils";

// type SupabaseExtensionTable = Tables<"extensions">;
// iterate over all files in extensions directory
const extensionsDir = join(__dirname, "..", "extensions");
console.log(extensionsDir);

const extensionsCandidateFolders = fs
  .readdirSync(extensionsDir)
  .map((folder) => join(extensionsDir, folder)) // get full path
  .filter((folder) => fs.statSync(folder).isDirectory()) // only directories
  .filter((folder) => fs.existsSync(join(folder, "package.json"))); // only those with package.json
console.log(extensionsCandidateFolders);

checkPackagesValidity(extensionsCandidateFolders);

// buildWithDockerAndValidate(join(extensionsDir, "jwt"));
