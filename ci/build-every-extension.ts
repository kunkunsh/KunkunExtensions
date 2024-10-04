import fs from "fs"
import path from "path"
import { $ } from "bun"
import { ExtensionsDir } from "./src/constant"

for (const dir of fs.readdirSync(ExtensionsDir)) {
	const extPath = path.resolve(ExtensionsDir, dir)
	// const nodeModulesPath = path.join(extPath, "node_modules");
	// if (fs.existsSync(nodeModulesPath)) {
	//   await $`rm -rf ${nodeModulesPath}`;
	// }
	// skip if not a directory
	if (!fs.statSync(extPath).isDirectory()) continue
	// verfiy extension with latest @kksh/cli
	console.log(`Building ${extPath}`)
	if (!fs.existsSync(path.join(extPath, "package.json"))) {
		console.log(`Skipping ${extPath} because it's not a valid extension`)
		continue
	}
	await $`npx @kksh/cli@latest verify ${extPath}`
	await $`pnpm install`.cwd(extPath)
	await $`pnpm build`.cwd(extPath)
}
