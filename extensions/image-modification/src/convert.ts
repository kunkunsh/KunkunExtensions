// @ts-types="npm:@types/sharp"
import { extname } from "https://deno.land/std/path/mod.ts"
import { parseArgs } from "jsr:@std/cli/parse-args"
import sharp from "npm:sharp"

const args = parseArgs(Deno.args)
const outputFormat = args.f

// listen to stdin
let imageFiles: string[] = []
const decoder = new TextDecoder()
for await (const chunk of Deno.stdin.readable) {
	const text = decoder.decode(chunk)
    console.log("text", text);
    
	imageFiles = JSON.parse(text)
	break
}
// filter out non-files
imageFiles = imageFiles.filter((file) => {
	return Deno.statSync(file).isFile
})

imageFiles.forEach(async (file) => {
	// file is a absolute path, replace the extension with outputFormat
	const ext = extname(file) // ext is like .png, .jpg, etc
	// replace last ext.length characters with outputFormat
	const newFilePath = file.slice(0, -ext.length) + "." + outputFormat
	console.log("newFilePath", newFilePath)
	try {
		await sharp(file).toFile(newFilePath)
	} catch (error) {
		console.log("error")
		console.log(error)
	}
})
