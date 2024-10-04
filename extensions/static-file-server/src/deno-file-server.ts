import { serveDir, serveFile } from "jsr:@std/http/file-server"

Deno.serve((req: Request) => {
	const pathname = new URL(req.url).pathname

	if (pathname.startsWith("/")) {
		return serveDir(req, {
			fsRoot: "static",
			urlRoot: "static"
		})
	}

	return new Response("404: Not Found", {
		status: 404
	})
})
