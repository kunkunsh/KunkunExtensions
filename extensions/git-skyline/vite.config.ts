import path from "node:path"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	css: {},
	plugins: [vue()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	base: "/git-skyline/dist"
})
