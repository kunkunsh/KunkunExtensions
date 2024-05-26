import fs from "fs";
import { join } from "path";
import {
  buildWithDockerAndValidate,
  checkPackagesValidity,
  parsePackageJson,
  uploadTarballToS3,
  uploadTarballToSupabaseStorage,
  type BuildResult,
} from "./src/utils";
import { supabase } from "./src/supabase";
import { type Database, type Tables } from "./supabase/types/supabase";

type SupabaseExtensionTable = Tables<"extensions">;
// iterate over all files in extensions directory
const extensionsDir = join(__dirname, "..", "extensions");
const extensionsCandidateFolders = fs
  .readdirSync(extensionsDir)
  .map((folder) => join(extensionsDir, folder)) // get full path
  .filter((folder) => fs.statSync(folder).isDirectory()) // only directories
  .filter((folder) => fs.existsSync(join(folder, "package.json"))); // only those with package.json

checkPackagesValidity(extensionsCandidateFolders);

/* -------------------------------------------------------------------------- */
/*           Filter Out Extensions that are Already in the Database           */
/* -------------------------------------------------------------------------- */
let toBuildExt: string[] = [];
const existingExtMap = new Map<string, SupabaseExtensionTable>(); // store db existing extensions, later used for shasum validation
for (const extPath of extensionsCandidateFolders) {
  const pkg = parsePackageJson(join(extPath, "package.json"));
  const dbExt = await supabase
    .from("extensions")
    .select("*")
    .eq("identifier", pkg.jarvis.identifier)
    .eq("version", pkg.version);
  if (dbExt.data && dbExt.data.length > 0) {
    console.log(
      `Extension ${pkg.jarvis.identifier}@${pkg.version} already exists in the database. Skip Building.`,
    );
    existingExtMap.set(extPath, dbExt.data[0]);
    continue;
  } else {
    toBuildExt.push(extPath); // not in db, build it
  }
}

/* -------------------------------------------------------------------------- */
/*                      Build All Extensions With Docker                      */
/* -------------------------------------------------------------------------- */
const PoolSize = 1;
// split toBuildExt into chunks of PoolSize, run multiple docker builds in parallel
const toBuildExtChunks = [];
for (let i = 0; i < toBuildExt.length; i += PoolSize) {
  toBuildExtChunks.push(toBuildExt.slice(i, i + PoolSize));
}

const buildResults = [];
for (const chunk of toBuildExtChunks) {
  const chunkBuildResults = await Promise.all(
    chunk
      // .slice(0, 1) // this line is commented out for dev, upload a single extension
      .map((extPath) => buildWithDockerAndValidate(extPath)),
  );
  buildResults.push(...chunkBuildResults);
}
// console.log(buildResults);

/* -------------------------------------------------------------------------- */
/*            Get Existing Extensions from Supabase for Validation            */
/* -------------------------------------------------------------------------- */
// ! this section is moved to run before build, otherwise it will take too long when there are many extensions
// ! Shasum validation can be done separately/periodically e.g. once a day for all extensions
// This set contains all the extensions that are already in the database
// let dbExtSet = new Set<{ identifier: string; version: string }>();
// const resultsToUpload: BuildResult[] = [];
// for (const buildResult of buildResults) {
//   const dbRes = await supabase
//     .from("extensions")
//     .select("*")
//     .eq("identifier", buildResult.pkg.jarvis.identifier)
//     .eq("version", buildResult.pkg.version);
//   console.log("dbRes", dbRes);
//   if (dbRes.data && dbRes.data.length > 0) {
//     console.log("Extension already exists in the database");
//     // compare shasum
//     const dbShasum = dbRes.data[0].shasum;
//     if (dbShasum !== buildResult.shasum) {
//       console.error(
//         `Unexpected Error: Shasum mismatch: \n\tDB: ${dbShasum}\n\tNew: ${buildResult.shasum}`
//       );
//       process.exit(1);
//     }
//     console.log("Skip Upload");
//     continue;
//   }

//   if (dbRes.data && dbRes.data.length > 1) {
//     console.error(
//       "Unexpected Error: More than one extension with the same identifier and version"
//     );
//     process.exit(1);
//   }
//   resultsToUpload.push(buildResult);
//   dbExtSet.add({
//     identifier: buildResult.pkg.jarvis.identifier,
//     version: buildResult.pkg.version,
//   });
// }

/* -------------------------------------------------------------------------- */
/*         Upload Newly Built Extensions to File Storage and Supabase         */
/* -------------------------------------------------------------------------- */
for (const buildResult of buildResults) {
  // const _ext = {
  //   identifier: buildResult.pkg.jarvis.identifier,
  //   version: buildResult.pkg.version,
  // };
  // if (dbExtSet.has(_ext)) {
  //   console.log(`Extension ${_ext} already exists in the database`);
  //   continue;
  // }
  const filesize = fs.statSync(buildResult.tarballPath).size;

  const supabasePath = await uploadTarballToSupabaseStorage(
    buildResult.tarballPath,
    buildResult.pkg.jarvis.identifier,
    buildResult.pkg.version,
    buildResult.tarballFilename,
  );
  const s3Path = await uploadTarballToS3(
    buildResult.tarballPath,
    buildResult.pkg.jarvis.identifier,
    buildResult.pkg.version,
    buildResult.tarballFilename,
  );

  const { data, error } = await supabase.from("extensions").insert([
    {
      name: buildResult.pkg.name,
      identifier: buildResult.pkg.jarvis.identifier,
      version: buildResult.pkg.version,
      shasum: buildResult.shasum,
      packagejson: buildResult.pkg,
      size: filesize,
      tarball_path: supabasePath,
    },
  ]);
  if (error) {
    console.error("Unexpected Error: Error inserting into database", error);
    process.exit(1);
  }

  console.log(`Inserted tarball into database: ${buildResult.tarballPath}`);
}
