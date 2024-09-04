import {
	Action,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	os,
	path,
	shell,
	sysInfo,
	toast,
	ui,
	utils,
	WorkerExtension,
	type ListSchema
} from "@kksh/api/ui/worker"
import { getMacBatteryInfo } from "./mac-ioreg"

async function parseBatteryInfo(
	batteries: Awaited<ReturnType<typeof sysInfo.batteries>>[]
): Promise<List.Section[]> {
	const platform = await os.platform()
	return batteries.map((battery) => {
		const items: List.Item[] = []
		// TODO: not sure what the unit is for time_to_empty, time_to_full, and energy_rate
		// if (battery.time_to_empty) {
		// 	items.push(
		// 		new List.Item({
		// 			title: "Time Remaining",
		// 			value: "time-remaining",
		// 			subTitle: battery.time_to_empty.toString()
		// 		})
		// 	)
		// }
		// if (battery.time_to_full) {
		// 	items.push(
		// 		new List.Item({
		// 			title: "Time to Full",
		// 			value: "time-to-full",
		// 			subTitle: battery.time_to_full.toString()
		// 		})
		// 	)
		// }
		items.push(
			new List.Item({
				title: "Voltage",
				value: "voltage",
				subTitle: `${battery.voltage.toFixed(2).toString()}V`
			})
		)
		if (battery.temperature_kelvin) {
			// temperature C and F are derived from kelvin under the hood, so we can use the same value for all
			items.push(
				new List.Item({
					title: "Temperature",
					value: "temperature",
					subTitle: `${battery.temperature_celsius?.toFixed(2)}°C / ${battery.temperature_fahrenheit?.toFixed(2)}°F`
				})
			)
		}
		items.push(
			new List.Item({
				title: "State",
				value: "state",
				subTitle: battery.state.toString()
			})
		)
		items.push(
			new List.Item({
				title: "Cycle Count",
				value: "cycle-count",
				subTitle: battery.cycle_count?.toString() ?? "--"
			})
		)
		if (platform !== "macos") {
			items.push(
				new List.Item({
					title: "Percentage",
					value: "percentage",
					subTitle: `${(battery.state_of_charge * 100).toFixed(2)}%`
				})
			)
		}
		items.push(
			new List.Item({
				title: "Health",
				value: "health",
				subTitle: `${(battery.state_of_health * 100).toFixed(2)}%`
			})
		)
		return new List.Section({
			items
		})
	})
}

class ExtensionTemplate extends WorkerExtension {
	async load() {
		const platform = await os.platform()
		
		const batteries = await sysInfo.batteries()
		console.log(await sysInfo.cpus())
		const sections: List.Section[] = await parseBatteryInfo(batteries)
		if (platform === "macos") {
			// mac is expected to have only one battery
			const macInfo = await getMacBatteryInfo()
			if (macInfo) {
				sections[0].items = [
					new List.Item({
						title: "Percentage",
						value: "percentage",
						subTitle: `${macInfo.CurrentCapacity.toString()}%`
					}),
					new List.Item({
						title: "Time Remaining",
						value: "time-remaining",
						subTitle: macInfo.timeRemainingFormatted
					}),
					new List.Item({
						title: "Power Source",
						value: "power-source",
						subTitle: macInfo.formattedPowerSource
					}),
					new List.Item({
						title: "Condition",
						value: "condition",
						subTitle: macInfo.formattedCondition
					}),
					new List.Item({
						title: "Charge",
						value: "charge",
						subTitle: macInfo.formattedCurrentCapacity
					}),
					new List.Item({
						title: "Power Usage",
						value: "power-usage",
						subTitle: macInfo.powerUsage
					}),
					...sections[0].items
				]
			}
		}
		ui.setSearchBarPlaceholder("Search...")
		return ui.render(
			new List.List({
				sections
			})
		)
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
