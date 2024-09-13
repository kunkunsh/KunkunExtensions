import {
	Action,
	clipboard,
	dialog,
	event,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	Markdown,
	path,
	shell,
	system,
	toast,
	ui,
	WorkerExtension
} from "@kksh/api/ui/worker"
import { markdownInstruction } from "./instruction"

async function disableAppleQuarantine(path: string) {
	const confirm = await dialog.confirm(
		`Are you sure you want to disable Apple Quarantine on this file? Will run "xattr -cr ${path}"`
	)
	if (!confirm) {
		return
	}
	const ret = await shell.createCommand("xattr", ["-cr", path]).execute()
	if (ret.code === 0) {
		toast.success(`Disabled Apple Quarantine on ${path}`)
	} else {
		toast.error(`Error disabling Apple Quarantine on ${path}`)
	}
}

async function disableMultipleAppleQuarantine(paths: string[]) {
	for (const path of paths) {
		await disableAppleQuarantine(path)
	}
}

class ExtensionTemplate extends WorkerExtension {
	async load() {
		event.onDragDrop(async (files) => {
			console.log("Dropped Files: ", files)
			disableMultipleAppleQuarantine(files.paths.filter((path) => /\.app\/?$/.test(path)))
		})
		clipboard.readFiles().then((files) => {
			console.log("Clipboard Copied Files", files)
			disableMultipleAppleQuarantine(files.filter((path) => /\.app\/?$/.test(path)))
		})
		system.getSelectedFilesInFileExplorer().then((files) => {
			console.log("Finder Selected Files", files)
			disableMultipleAppleQuarantine(files.filter((path) => /\.app\/?$/.test(path)))
		})
		return ui.render(new Markdown(markdownInstruction))
		// return ui.render(
		// 	new Form.Form({
		// 		key: "form1",
		// 		fields: [
		// 			new Form.NumberField({
		// 				key: "age",
		// 				label: "Age",
		// 				placeholder: "Enter your age"
		// 			})
		// 			// new Form.NumberField({
		// 			// 	key: "age"
		// 			// }),
		// 			// new Form.Form({
		// 			// 	key: "random",
		// 			// 	fields: [
		// 			// 		new Form.BooleanField({ key: "Server On" }),
		// 			// 		new Form.ArrayField({
		// 			// 			key: "birthday",
		// 			// 			content: new Form.DateField({ key: "birthday" })
		// 			// 		})
		// 			// 	]
		// 			// })
		// 		]
		// 	})
		// )
	}

	async onFormSubmit(value: Record<string, any>): Promise<void> {
		console.log("Form submitted", value)
		toast.success(`Form submitted: ${JSON.stringify(value)}`)
	}

	onSearchTermChange(term: string): Promise<void> {
		console.log("Search term changed to:", term)
		return Promise.resolve()
	}

	onItemSelected(value: string): Promise<void> {
		console.log("Item selected:", value)
		return Promise.resolve()
	}
}

expose(new ExtensionTemplate())
