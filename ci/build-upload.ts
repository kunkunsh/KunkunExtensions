import fs from "fs";
import path, { join } from "path";
import { ExtPackageJson } from "jarvis-api";
import {
  buildWithDocker,
  buildWithDockerAndValidate,
  checkPackagesValidity,
  computeShasum1,
  computeTarballName,
  uploadTarballToS3,
  uploadTarballToSupabaseStorage,
} from "./src/utils";
import { supabase } from "./src/supabase";

// iterate over all files in extensions directory
const extensionsDir = join(__dirname, "..", "extensions");
const extensionsCandidateFolders = fs
  .readdirSync(extensionsDir)
  .map((folder) => join(extensionsDir, folder)) // get full path
  .filter((folder) => fs.statSync(folder).isDirectory()) // only directories
  .filter((folder) => fs.existsSync(join(folder, "package.json"))); // only those with package.json

checkPackagesValidity(extensionsCandidateFolders);

/* -------------------------------------------------------------------------- */
/*                      Build All Extensions With Docker                      */
/* -------------------------------------------------------------------------- */
const dockerBuildAllPromises = Promise.all(
  extensionsCandidateFolders
    .slice(0, 1)
    .map((extPath) => buildWithDockerAndValidate(extPath))
);

dockerBuildAllPromises.then(async (results) => {
  /* -------------------------------------------------------------------------- */
  /*            Get Existing Extensions from Supabase for Validation            */
  /* -------------------------------------------------------------------------- */
  let dbExt = new Set<{ identifier: string; version: string }>();
  for (const buildResult of results) {
    const dbRes = await supabase
      .from("extensions")
      .select("*")
      .eq("identifier", buildResult.pkg.jarvis.identifier)
      .eq("version", buildResult.pkg.version);
    console.log("dbRes", dbRes);
    if (dbRes.count && dbRes.count > 0) {
      console.log("Extension already exists in the database");
      // compare shasum
      const dbShasum = dbRes.data[0].shasum;
      if (dbShasum !== buildResult.shasum) {
        console.error(
          `Unexpected Error: Shasum mismatch: \n\tDB: ${dbShasum}\n\tNew: ${buildResult.shasum}`
        );
        process.exit(1);
      }
      continue;
    }

    if (dbRes.count && dbRes.count > 1) {
      console.error(
        "Unexpected Error: More than one extension with the same identifier and version"
      );
      process.exit(1);
    }

    dbExt.add({
      identifier: buildResult.pkg.jarvis.identifier,
      version: buildResult.pkg.version,
    });
  }

  /* -------------------------------------------------------------------------- */
  /*         Upload Newly Built Extensions to File Storage and Supabase         */
  /* -------------------------------------------------------------------------- */
  for (const buildResult of results) {
    const _ext = {
      identifier: buildResult.pkg.jarvis.identifier,
      version: buildResult.pkg.version,
    };
    if (dbExt.has(_ext)) {
      console.log(`Extension ${_ext} already exists in the database`);
      continue;
    }
    const filesize = fs.statSync(buildResult.tarballPath).size;

    const supabasePath = await uploadTarballToSupabaseStorage(
      buildResult.tarballPath,
      buildResult.pkg.jarvis.identifier,
      buildResult.pkg.version,
      buildResult.tarballFilename
    );
    const s3Path = await uploadTarballToS3(
      buildResult.tarballPath,
      buildResult.pkg.jarvis.identifier,
      buildResult.pkg.version,
      buildResult.tarballFilename
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
    console.log("Write to DB:", data);

    if (error) {
      console.error("Unexpected Error: Error inserting into database", error);
      process.exit(1);
    }

    console.log(`Inserted tarball into database: ${buildResult.tarballPath}`);
  }
});
