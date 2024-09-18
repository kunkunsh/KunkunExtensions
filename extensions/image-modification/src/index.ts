import {
	Action,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	path,
	shell,
	system,
	toast,
	ui,
	WorkerExtension
} from "@kksh/api/ui/worker"
import { sharpFormats } from "./constants"

class ConvertImage extends WorkerExtension {
	async load() {
		ui.setSearchBarPlaceholder("Select image in file explorer then select an output format")
		return ui.render(
			new List.List({
				items: sharpFormats.map(
					(format) =>
						new List.Item({
							title: format,
							value: format
						})
				)
			})
		)
	}

	async onSearchTermChange(term: string): Promise<void> {}

	async onListItemSelected(value: string): Promise<void> {
		console.log(value)
		return system
			.getSelectedFilesInFileExplorer()
			.then(async (selectedFiles) => {
				const imageFiles = selectedFiles.filter(async (file) => {
					const ext = await path.extname(file)
					return sharpFormats.includes(ext.toLowerCase())
				})
				console.log("imageFiles", imageFiles)
				if (imageFiles.length === 0) {
					return toast.error("No image files selected")
				}
				const convertCmd = shell.createDenoCommand(
					"$EXTENSION/src/convert.ts",
					["-f", value.toLowerCase()],
					{
						allowAllFfi: true,
						allowAllRead: true
					}
				)
				convertCmd.stdout.on("data", (data) => {
					console.log("stdout data", data)
				})
				convertCmd.stderr.on("data", (data) => {
					console.log("stderr data", data)
				})
				convertCmd.on("close", (code) => {
					toast.success("Done!")
				})
				convertCmd.on("error", (err) => {
					console.log("error", err)
				})
				const child = await convertCmd.spawn()
				const stdinPayload = JSON.stringify(imageFiles)
				console.log("stdinPayload", stdinPayload)
				child.write(stdinPayload)
			})
			.catch((err) => {
				console.error("getSelectedFilesInFileExplorer", err)
				toast.error("Failed to get selected files")
			})
	}
}

expose(new ConvertImage())
