import fs from "fs";
import { join } from "path";
import {
  buildWithDockerAndValidate,
  checkPackagesValidity,
  parsePackageJson,
  uploadImage,
  uploadTarballToS3,
  uploadTarballToSupabaseStorage,
  type BuildResult,
} from "./src/utils";
import { supabase } from "./src/supabase";
import { type Tables } from "./supabase/types/supabase";

// type SupabaseExtensionTable = Tables<"extensions">;
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
// const existingExtMap = new Map<string, SupabaseExtensionTable>(); // store db existing extensions, later used for shasum validation
for (const extPath of extensionsCandidateFolders) {
  const pkg = parsePackageJson(join(extPath, "package.json"));
  const dbExt = await supabase
    .from("ext_publish")
    .select("*")
    .eq("identifier", pkg.jarvis.identifier)
    .eq("version", pkg.version);
  if (dbExt.data && dbExt.data.length > 0) {
    console.log(
      `Extension ${pkg.jarvis.identifier}@${pkg.version} already exists in the database. Skip Building.`,
    );
    // existingExtMap.set(extPath, dbExt.data[0]);
    continue;
  } else {
    toBuildExt.push(extPath); // not in db, build it
  }
}

/* -------------------------------------------------------------------------- */
/*                      Build All Extensions With Docker                      */
/* -------------------------------------------------------------------------- */
const PoolSize = 4;
// split toBuildExt into chunks of PoolSize, run multiple docker builds in parallel
const toBuildExtChunks = [];
for (let i = 0; i < toBuildExt.length; i += PoolSize) {
  toBuildExtChunks.push(toBuildExt.slice(i, i + PoolSize));
}

const buildResults: BuildResult[] = [];
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
  const readmePath = join(buildResult.extPath, "README.md");
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : null;
  /* -------------- Create Extension in extensions if not exists -------------- */
  const extFetchDBResult = await supabase
    .from("extensions")
    .select("*")
    .eq("identifier", buildResult.pkg.jarvis.identifier);

  if (!extFetchDBResult.data || extFetchDBResult.data.length === 0) {
    await supabase
      .from("extensions")
      .insert([
        {
          name: buildResult.pkg.name,
          short_description: buildResult.pkg.jarvis.short_description,
          long_description: buildResult.pkg.jarvis.long_description,
          identifier: buildResult.pkg.jarvis.identifier,
          readme: readme,
          downloads: 0,
        },
      ])
      .select();
  }

  const demoImgPaths = buildResult.pkg.jarvis.demoImages
    .map((p) => join(buildResult.extPath, p))
    .filter((p) => fs.existsSync(p));
  const demoImgsDBPaths = await Promise.all(demoImgPaths.map((p) => uploadImage(p))); // file storage paths
  const pkgIcon = buildResult.pkg.jarvis.icon;
  const iconClone = { ...pkgIcon };
  if (buildResult.pkg.jarvis.icon.type === "asset") {
    const iconPath = join(buildResult.extPath, pkgIcon.icon);
    if (fs.existsSync(iconPath)) {
    } else {
      console.error(`Icon file not found: ${iconPath}`);
    }
    iconClone.icon = await uploadImage(iconPath);
  }
  /* ---------- Update README, icon, description in extensions table ---------- */
  await supabase
    .from("extensions")
    .update({
      name: buildResult.pkg.jarvis.name,
      short_description: buildResult.pkg.jarvis.short_description,
      long_description: buildResult.pkg.jarvis.long_description,
      icon: iconClone,
      readme,
    })
    .eq("identifier", buildResult.pkg.jarvis.identifier)
    .select();

  /* ----------------------------- Upload Tarball ----------------------------- */
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
  const cmdCount = buildResult.pkg.jarvis.uiCmds.length + buildResult.pkg.jarvis.inlineCmds.length;
  const { data, error } = await supabase.from("ext_publish").insert([
    {
      name: buildResult.pkg.name,
      version: buildResult.pkg.version,
      manifest: buildResult.pkg.jarvis,
      shasum: buildResult.shasum,
      size: fs.statSync(buildResult.tarballPath).size,
      tarball_path: supabasePath,
      cmd_count: cmdCount,
      identifier: buildResult.pkg.jarvis.identifier,
      downloads: 0,
      demo_images: demoImgsDBPaths,
    },
  ]);
  if (error) {
    console.error("Unexpected Error: Error inserting into database", error);
    process.exit(1);
  }

  console.log(`Inserted tarball into database: ${buildResult.tarballPath}`);
}
