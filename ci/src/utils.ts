import crypto from "crypto"
import fs from "fs"
import { exec, spawn } from "node:child_process"
import path, { join } from "path"
import {
	GetObjectCommand,
	ListBucketsCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3"
import { ExtPackageJson } from "@kksh/api/models"
import sharp from "sharp"
import * as v from "valibot"
import { z } from "zod"
import { DOCKER_BUILD_ENTRYPOINT, REPO_ROOT } from "./constant"
import { supabase } from "./supabase"

/**
 * Package Name can be scoped or not
 * Use regex to extract package name
 * @param packageName
 * @param version
 */
export function computeTarballName(packageName: string, version: string): string {
	const scoped = packageName.startsWith("@")
	if (scoped) {
		const [scope, name] = packageName.split("/")
		return `${scope.substring(1)}-${name}-${version}.tgz`
	} else {
		return `${packageName}-${version}.tgz`
	}
}

export function parsePackageJson(pkgJsonPath: string) {
	const parse = v.safeParse(ExtPackageJson, JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")))
	if (parse.issues) {
		console.error(`Error parsing ${pkgJsonPath}: ${v.flatten(parse.issues)}`)
		process.exit(1)
	}
	const pkgJson = parse.output
	return pkgJson
}

export function checkPackagesValidity(extPaths: string[]) {
	/* ------------------- make sure package.json is parseable ------------------ */
	const pkgs = extPaths.map((ext) => parsePackageJson(join(ext, "package.json")))

	/* --------------------- make sure identifier is unique --------------------- */
	const identifiers = pkgs.map((pkg) => pkg.kunkun.identifier)
	const uniqueIdentifiers = new Set(identifiers)
	if (identifiers.length !== uniqueIdentifiers.size) {
		console.error("Identifiers are not unique")
		// find the duplicates
		const duplicates = identifiers.filter((item, index) => identifiers.indexOf(item) !== index)
		console.error("duplicates", duplicates)
		process.exit(1)
	}

	/* ------------------ Check Demo Images and files Existence ----------------- */
	for (const extPath of extPaths) {
		const pkg = parsePackageJson(join(extPath, "package.json"))
		for (const imgPath of pkg.kunkun.demoImages) {
			const imgFullPath = join(extPath, imgPath)
			if (!fs.existsSync(imgFullPath)) {
				console.error(`Demo Image not found: ${imgFullPath} in ${extPath}`)
				process.exit(1)
			}
		}
		for (const file of pkg.files) {
			const fileFullPath = join(extPath, file)
			if (!fs.existsSync) {
				console.error(`File not found: ${fileFullPath} in ${extPath}`)
				process.exit(1)
			}
		}
	}

	/* ------ make sure there is no tarball .tgz file in the each extension ----- */
	for (const extPath of extPaths) {
		const files = fs.readdirSync(extPath)
		const tgzFiles = files.filter((file) => file.endsWith(".tgz"))
		if (tgzFiles.length > 0) {
			console.error(`Extension ${extPath} contains tarball files: ${tgzFiles.join(", ")}`)
			console.error(
				"If you are developing, run scripts/clean.sh to remove all .tgz file in the top level of each extension"
			)
			process.exit(1)
		}
	}
}

export function computeFileHash(filePath: string, algorithm: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash(algorithm)
		const stream = fs.createReadStream(filePath)

		stream.on("data", (data) => {
			// @ts-ignore
			hash.update(data)
		})

		stream.on("end", () => {
			const shasum = hash.digest("hex")
			resolve(shasum)
		})

		stream.on("error", (err) => {
			reject(err)
		})
	})
}

export function computeFileSha1(filePath: string): Promise<string> {
	return computeFileHash(filePath, "sha1")
}

export function computeFileSha512(filePath: string): Promise<string> {
	return computeFileHash(filePath, "sha512")
}

/**
 * Docker is used to build each individual extension for safety
 * Packages could potentially modify other extensions if they share environment.
 * There is also a possibility of leaking environment variables.
 * docker run -v $(pwd)/scripts/docker/entrypoint.sh:/entrypoint.sh \
 *     -v $(pwd)/extensions/$ext:/workspace \
 *     -w /workspace --rm \
 *     --platform=linux/amd64 \
 *     node:20 /entrypoint.sh
 * @param extPath
 * @returns shasum of the tarball parsed from stderr output
 */
export function buildWithDocker(extPath: string): Promise<{
	stderrShasum: string
	stderrTarballFilename: string
	pkg: ExtPackageJson
}> {
	console.log(`Building ${extPath}`)
	return new Promise((resolve, reject) => {
		const pkg = parsePackageJson(join(extPath, "package.json"))
		// get folder name of extPath
		const extFolderName = path.basename(extPath)
		const dockerCmd = `
    run -v ${DOCKER_BUILD_ENTRYPOINT}:/entrypoint.sh -v ${extPath}:/workspace/${extFolderName} -w /workspace/${extFolderName} --rm --platform=linux/amd64 huakunshen/kunkun-ext-builder:latest /entrypoint.sh`
		const args = dockerCmd
			.split(" ")
			.filter((arg) => arg.length > 0)
			.filter((arg) => arg !== "\n")
		const subprocess = spawn("docker", args)
		let stderrShasum = ""
		let stderrTarballFilename = ""
		subprocess.stdout.on("data", (data) => {
			console.log(`stdout: ${data}`)
		})
		subprocess.stderr.on("data", (data) => {
			const dataStr = data.toString()
			console.error(`stderr: ${dataStr}`)
			//   if (data instanceof String) {
			if (dataStr.includes("npm notice shasum")) {
				console.log("shasum found")
				const shasumMatch = dataStr.match(/npm notice shasum:\s+([a-f0-9]+)/)

				if (shasumMatch) {
					stderrShasum = shasumMatch[1]
					console.log("Parsed shasum:", stderrShasum)
				}
			}

			if (dataStr.includes("npm notice filename:")) {
				const tarballFilename = dataStr.match(/npm notice filename:\s+([^\s]+)/)
				if (tarballFilename) {
					stderrTarballFilename = tarballFilename[1]
					console.log("Parsed tarball:", stderrTarballFilename)
				}
			} else if (dataStr.includes("filename:")) {
				const tarballFilename = dataStr.match(/filename:\s+([^\s]+)/)
				if (tarballFilename) {
					stderrTarballFilename = tarballFilename[1]
					console.log("Parsed tarball:", stderrTarballFilename)
				}
			}
			//   } else {
			//     console.error("data is not string");
			//   }
		})
		subprocess.on("close", (code) => {
			console.log(`child process exited with code ${code}`)
			if (stderrShasum.trim().length === 0 || stderrTarballFilename.trim().length === 0) {
				return reject("shasum or tarball filename not found")
			}
			if (code !== 0) {
				return reject(`child process exited with code ${code}`)
			} else {
				return resolve({ stderrShasum, stderrTarballFilename, pkg })
			}
		})
	})
}

export type BuildResult = {
	shasum: string
	tarballFilename: string
	tarballPath: string
	extPath: string
	pkg: ExtPackageJson
}

/**
 * Use this function to build an extension with docker and validate the tarball
 * If this passes, the tarball is ready to be inserted into the database
 * @param extPath Extension Path
 * @returns
 */
export function buildWithDockerAndValidate(extPath: string): Promise<BuildResult> {
	return buildWithDocker(extPath)
		.then((res) => {
			const parsedTarballPath = join(extPath, res.stderrTarballFilename)
			if (!fs.existsSync(parsedTarballPath)) {
				console.error(`Tarball not found: ${parsedTarballPath}`)
				process.exit(1)
			}
			return computeFileSha1(parsedTarballPath).then((computedShasum) => {
				if (computedShasum !== res.stderrShasum) {
					console.error(
						`Shasum mismatch: Computed(${computedShasum}) !== Output from docker(${res.stderrShasum})`
					)
					process.exit(1)
				} else {
					console.log("Shasum matches")
				}
				return {
					shasum: computedShasum,
					tarballFilename: res.stderrTarballFilename,
					tarballPath: parsedTarballPath,
					extPath: extPath,
					pkg: res.pkg
				}
			})
		})
		.catch((err) => {
			console.error(err)
			process.exit(1)
		})
}

/**
 *
 * @param tarballPath
 * @param identifier
 * @param version
 * @param tarballName
 * @returns Path
 */
export function uploadTarballToS3(
	tarballPath: string,
	identifier: string,
	version: string,
	tarballName: string
) {
	const s3Client = new S3Client({
		endpoint: z.string().parse(process.env.S3_ENDPOINT),
		region: "auto",
		credentials: {
			accessKeyId: z.string().parse(process.env.S3_ACCESS_KEY_ID),
			secretAccessKey: z.string().parse(process.env.S3_SECRET_ACCESS_KEY)
		}
	})
	const key = `extensions/${identifier}/${version}/${path.basename(tarballName)}`
	const tarball = fs.readFileSync(tarballPath)
	return s3Client
		.send(
			new PutObjectCommand({
				Bucket: "jarvis-extensions",
				Key: key,
				Body: tarball,
				ContentType: "application/gzip"
			})
		)
		.then((res) => {
			return key
		})
		.catch((err) => {
			console.error("Failed to upload tarball")
			console.error(err)
			process.exit(1)
		})
}

/**
 *
 * @param tarballPath
 * @param identifier
 * @param version
 * @param tarballName
 * @returns path of the tarball in supabase storage, not url
 */
export async function uploadTarballToSupabaseStorage(
	tarballPath: string,
	identifier: string,
	version: string,
	tarballName: string
) {
	const key = `extensions/${identifier}/${version}/${path.basename(tarballName)}`
	const tarball = fs.readFileSync(tarballPath)
	console.log("uploading to supabase storage")

	const { data, error } = await supabase.storage.from("extensions").upload(key, tarball, {
		cacheControl: "3600",
		upsert: true
	})
	if (error) {
		console.error("Failed to upload tarball to supabase storage")
		console.error(error)
		process.exit(1)
	}
	console.log("Tarball uploaded to supabase storage")
	return data.path
}

export function computeHash(buffer: Buffer, algorithm: "sha1" | "sha256" | "sha512") {
	const hash = crypto.createHash(algorithm)
	// @ts-ignore
	hash.update(buffer)
	return hash.digest("hex")
}

export async function uploadImage(imagePath: string) {
	// make sure imagePath exists and is a file
	if (!fs.existsSync(imagePath)) {
		console.error(`Image not found: ${imagePath}`)
		process.exit(1)
	}
	const imageSize = fs.statSync(imagePath).size
	const img =
		imageSize > 200 * 1024
			? await sharp(imagePath)
					.resize({
						height: 720,
						fit: sharp.fit.inside,
						withoutEnlargement: true
					})
					.jpeg()
					.toBuffer()
			: await sharp(imagePath).jpeg().toBuffer()
	const imgSha512 = computeHash(img, "sha512")
	/* ----------------------- Check if image exists in db ---------------------- */
	const dbRes = await supabase.from("ext_images").select("*").eq("sha512", imgSha512)
	const exists = dbRes.data && dbRes.data.length > 0
	if (exists) {
		return dbRes.data[0].image_path
	}

	/* --------------------- Upload to supabase file storage -------------------- */
	const key = `ext-images/${imgSha512}.jpeg`

	const { data, error } = await supabase.storage.from("extensions").upload(key, img, {
		cacheControl: "3600",
		upsert: true
	})
	if (error) {
		console.error(error)
		throw new Error("Failed to upload image to supabase storage.")
	}
	/* ------------------------------ Upload to S3 ------------------------------ */
	const s3Client = new S3Client({
		endpoint: z.string().parse(process.env.S3_ENDPOINT),
		region: "auto",
		credentials: {
			accessKeyId: z.string().parse(process.env.S3_ACCESS_KEY_ID),
			secretAccessKey: z.string().parse(process.env.S3_SECRET_ACCESS_KEY)
		}
	})
	await s3Client
		.send(
			new PutObjectCommand({
				Bucket: "jarvis-extensions",
				Key: key,
				Body: img,
				ContentType: "application/jpeg"
			})
		)
		.then((res) => {
			return key
		})
		.catch((err) => {
			console.error("Failed to upload tarball")
			console.error(err)
		})

	/* ------------------------- Insert into database -------------------------- */
	const { data: insertData, error: insertError } = await supabase
		.from("ext_images")
		.insert([{ sha512: imgSha512, image_path: data.path }])
	if (insertError) {
		console.error(insertError)
		throw new Error("Failed to insert image into database")
	}

	return data?.path
}
