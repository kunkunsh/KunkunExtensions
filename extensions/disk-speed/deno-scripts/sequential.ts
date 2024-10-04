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
	const duration = (performance.now() - start) / 1000
	console.log(`Sequential Write: ${sizeInMB}MB took ${duration.toFixed(3)} seconds`)
}

// Sequential Read
async function sequentialRead(filePath: string) {
	const file = await Deno.open(filePath, { read: true })
	const buffer = new Uint8Array(1024 * 1024) // 1MB buffer
	const start = performance.now()

	while ((await file.read(buffer)) !== null) {}

	file.close()
	const duration = (performance.now() - start) / 1000
	console.log(`Sequential Read took ${duration.toFixed(3)} seconds`)
}

// Example Usage
await sequentialWrite("./testfile.dat", 5000) // Write 100MB sequentially
await sequentialRead("./testfile.dat") // Read the same 100MB file sequentially
// remove the file
await Deno.remove("./testfile.dat")
