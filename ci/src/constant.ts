import fs from "fs"
import path from "path"
import { $, fileURLToPath } from "bun"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(__dirname, "../../")
export const ExtensionsDir = path.resolve(REPO_ROOT, "extensions")
export const DOCKER_BUILD_ENTRYPOINT = path.resolve(REPO_ROOT, "scripts", "docker", "entrypoint.sh")
if (!Bun.env.DISCORD_WEBHOOK_URL) {
	console.error("DISCORD_WEBHOOK_URL is not set")
	process.exit(1)
}
export const DISCORD_WEBHOOK_URL = Bun.env.DISCORD_WEBHOOK_URL
/* -------------------------------------------------------------------------- */
/*                            Check Path Existence                            */
/* -------------------------------------------------------------------------- */

if (!fs.existsSync(DOCKER_BUILD_ENTRYPOINT)) {
	console.error(`Docker build entrypoint not found: ${DOCKER_BUILD_ENTRYPOINT}`)
	process.exit(1)
}

if (!fs.existsSync(REPO_ROOT)) {
	console.error(`Repo root not found: ${REPO_ROOT}`)
	process.exit(1)
}
