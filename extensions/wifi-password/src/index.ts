import {
	Action,
	clipboard,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	Markdown,
	os,
	path,
	shell,
	toast,
	ui,
	WorkerExtension
} from "@kksh/api/ui/worker"
import qrcode from "qrcode"

class ExtensionTemplate extends WorkerExtension {
	networks: string[] = []

	get listItems() {
		return this.networks.map(
			(x) =>
				new List.Item({
					title: x,
					value: x,
					icon: new Icon({
						type: IconEnum.Iconify,
						value: "mdi:wifi"
					})
				})
		)
	}

	async load() {
		ui.setSearchBarPlaceholder("Search for wifi and press enter to get password")
		const platform = await os.platform()
		if (platform === "macos") {
			const cmd = shell.createCommand("networksetup", ["-listpreferredwirelessnetworks", "en0"])
			const result = await cmd.execute()
			if (result.code !== 0) {
				toast.error("Failed to get wifi password")
				return
			}
			this.networks = result.stdout
				.trim()
				.split("\n")
				.slice(1)
				.map((x) => x.trim())
		}
		return ui.render(
			new List.List({
				items: this.listItems
			})
		)
	}

	async onListItemSelected(ssid: string): Promise<void> {
		ui.render(
			new List.List({
				inherits: ["items"],
				detail: undefined
			})
		)
		const cmd = shell.createCommand("security", [
			"find-generic-password",
			"-D",
			`AirPort network password`,
			"-a",
			ssid,
			"-w"
		])
		const result = await cmd.execute()
		if (result.code !== 0) {
			console.log(result.stderr)
			toast.error("Failed to get wifi password")
			return
		}
		const wifiPassword = result.stdout.trim()
		toast.success(`Wifi password: ${wifiPassword}, written to clipboard`)
		clipboard.writeText(wifiPassword)
		const wifiConnectUrl = `WIFI:S:${ssid};T:WPA;P:${wifiPassword};;`
		let qrcodeSvg: string | undefined
		try {
			qrcodeSvg = await qrcode.toString(wifiConnectUrl)
		} catch (error) {
			toast.error(`Failed to generate QR code: ${error}`)
			console.error(error)
		}
		// <img src="${qrcodeImageBase64}" style="display: block; margin: 0 auto;" />
		if (!qrcodeSvg) {
			return toast.error("Failed to generate QR code")
		}
		const markdown = `
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2em;">
<div style="width: 10em; height: 10em; display: block;">
	${qrcodeSvg}
</div>
<p style="text-align: center;">Wifi Password: <strong>${wifiPassword}</strong></p>
<p style="text-align: center;">Connect URL: <strong>${wifiConnectUrl}</strong></p>
</div>
`
		return ui.render(
			new List.List({
				inherits: ["items"],
				detail: new List.ItemDetail({
					width: 60,
					children: [new Markdown(markdown)]
				})
			})
		)
	}
}

expose(new ExtensionTemplate())
