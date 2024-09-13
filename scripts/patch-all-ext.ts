import {inc} from 'semver'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXTENSIONS_DIR = path.resolve(__dirname, "../extensions")

for (const ext of fs.readdirSync(EXTENSIONS_DIR)) {
	const extPath = path.resolve(EXTENSIONS_DIR, ext)
	const pkgJsonPath = path.resolve(extPath, "package.json")
	if (!fs.existsSync(pkgJsonPath)) {
		console.log(`${extPath} is not a valid extension`)
		continue
	}
	const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"))
	pkgJson.version = inc(pkgJson.version, 'patch')
	fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, "\t") + "\n")
}
