import { $ } from "bun"
import { DiskSpeedTestInput } from "./src/model.ts"

const input: DiskSpeedTestInput = {
	targetPath: "./testfile.dat",
	sequential: {
		stressFileSizeMB: 2000
	},
	random: {
		stressFileSizeMB: 1000,
		iterations: 1000,
		blockSize: 4096
	}
}
const encoded = btoa(JSON.stringify(input))
// sequential
;(async () => {
	const res =
		await $`deno run --allow-read --allow-write deno-scripts/sequential.ts ${encoded}`.quiet()
	const stdoutSplit = res.stdout.toString("utf-8").split("\n")
	console.log(JSON.parse(stdoutSplit[stdoutSplit.length - 2]))
})()

// random
;(async () => {
	const res = await $`deno run --allow-read --allow-write deno-scripts/random.ts ${encoded}`.quiet()
	console.log("stdout", res.stdout.toString("utf-8"))

	const stdoutSplit = res.stdout.toString("utf-8").split("\n")
	console.log(JSON.parse(stdoutSplit[stdoutSplit.length - 2]))
})()
