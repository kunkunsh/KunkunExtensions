import { parseArgs } from "jsr:@std/cli/parse-args"
import { DiskSpeedTestInput, DiskSpeedTestOutput } from "../src/model.ts"

const args = parseArgs(Deno.args)

if (args._.length !== 1) {
	console.error("Missing Arguments")
	Deno.exit(1)
}
const encodedArgs = args._[0]
const base64Decoded = atob(encodedArgs as string)

const decodedJsonArgs: DiskSpeedTestInput = JSON.parse(base64Decoded)

// Sequential Write
async function sequentialWrite(filePath: string, sizeInMB: number) {
	const file = await Deno.open(filePath, { write: true, create: true })
	const data = new Uint8Array(1024 * 1024) // 1MB buffer
	const start = performance.now()
	const writer = file.writable.getWriter()
	for (let i = 0; i < sizeInMB; i++) {
		// await Deno.write(file.rid, data);
		// await Deno.open()
		await writer.write(data)
	}

	file.close()
	return (performance.now() - start) / 1000
}

// Sequential Read
async function sequentialRead(filePath: string) {
	const file = await Deno.open(filePath, { read: true })
	const buffer = new Uint8Array(1024 * 1024) // 1MB buffer
	const start = performance.now()

	while ((await file.read(buffer)) !== null) {}

	file.close()
	return (performance.now() - start) / 1000
}

// Example Usage
const writeDuration = await sequentialWrite(
	decodedJsonArgs.targetPath,
	decodedJsonArgs.sequential.stressFileSizeMB
) // Write 100MB sequentially
const readDuration = await sequentialRead(decodedJsonArgs.targetPath) // Read the same 100MB file sequentially
// remove the file
await Deno.remove(decodedJsonArgs.targetPath)
const result: DiskSpeedTestOutput = {
	writeSpeedMBps: decodedJsonArgs.sequential.stressFileSizeMB / writeDuration,
	readSpeedMBps: decodedJsonArgs.sequential.stressFileSizeMB / readDuration
}
console.log(JSON.stringify(result))
