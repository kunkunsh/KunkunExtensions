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

// Pre-fill file with zeros to a given size (in MB)
async function initializeFile(filePath: string, sizeInMB: number) {
	const file = await Deno.open(filePath, { write: true, create: true })
	const data = new Uint8Array(1024 * 1024) // 1MB buffer filled with zeros
	const start = performance.now()
	const writer = file.writable.getWriter()
	for (let i = 0; i < sizeInMB; i++) {
		await writer.write(data)
	}

	file.close()
	return (performance.now() - start) / 1000
	// console.log(`File Initialization: ${sizeInMB}MB took ${duration.toFixed(3)} seconds`)
}

// Random Write
async function randomWrite(filePath: string, iterations: number, blockSize: number) {
	const file = await Deno.open(filePath, { write: true, create: true })
	const fileSize = (await Deno.stat(filePath)).size
	const data = new Uint8Array(blockSize)
	const start = performance.now()
	const writer = file.writable.getWriter()
	const totalDataMB = (iterations * blockSize) / (1024 * 1024) // Total data in MB

	for (let i = 0; i < iterations; i++) {
		const offset = Math.floor(Math.random() * (fileSize - blockSize))
		await file.seek(offset, Deno.SeekMode.Start)
		await writer.write(data)
	}

	file.close()
	const duration = (performance.now() - start) / 1000
	return totalDataMB / duration

	// const speed = totalDataMB / duration // Speed in MB/s
	// console.log(
	// 	`Random Write: ${iterations} iterations (${totalDataMB.toFixed(
	// 		3
	// 	)}MB) took ${duration.toFixed(3)} seconds`
	// )
	// console.log(`Write Speed: ${speed.toFixed(3)} MB/s`)
}

// Random Read
async function randomRead(filePath: string, iterations: number, blockSize: number) {
	const file = await Deno.open(filePath, { read: true })
	const fileSize = (await Deno.stat(filePath)).size
	const buffer = new Uint8Array(blockSize)
	const start = performance.now()
	const totalDataMB = (iterations * blockSize) / (1024 * 1024) // Total data in MB

	for (let i = 0; i < iterations; i++) {
		const offset = Math.floor(Math.random() * (fileSize - blockSize))
		await file.seek(offset, Deno.SeekMode.Start)
		await file.read(buffer)
	}

	file.close()
	const duration = (performance.now() - start) / 1000
	const speed = totalDataMB / duration
	return speed
	// console.log(
	// 	`Random Read: ${iterations} iterations (${totalDataMB.toFixed(
	// 		3
	// 	)}MB) took ${duration.toFixed(3)} seconds`
	// )
	// console.log(`Read Speed: ${speed.toFixed(3)} MB/s`)
}

// Example Usage
await initializeFile("./testfile.dat", 1000) // Pre-fill the file with 100MB of data
const writeSpeed = await randomWrite("./testfile.dat", 10000, 4096) // Perform 1000 random writes (4KB blocks)
const readSpeed = await randomRead("./testfile.dat", 10000, 4096) // Perform 1000 random reads (4KB blocks)

const output: DiskSpeedTestOutput = {
	writeSpeedMBps: writeSpeed,
	readSpeedMBps: readSpeed
}

console.log(JSON.stringify(output))

// remove the file
await Deno.remove("./testfile.dat")
