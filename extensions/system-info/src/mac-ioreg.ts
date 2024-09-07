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
	sysInfo,
	toast,
	ui,
	utils,
	WorkerExtension
} from "@kksh/api/ui/worker"

export async function getMacBatteryInfo() {
	const batteryInfoRet = await shell.Command.create("ioreg", [
		"-arn",
		"AppleSmartBattery"
	]).execute()
	if (batteryInfoRet.code !== 0) {
		toast.error("Failed to get battery info")
	}
	const batteryInfoStdout = batteryInfoRet.stdout

	const ioreg: any = await utils.plist.parse(batteryInfoStdout)

	// check if ioreg is an array
	if (!Array.isArray(ioreg)) {
		toast.error("Failed to get battery info")
		return null
	}
	const batteryInfo = ioreg[0]
	const {
		TimeRemaining,
		Voltage,
		Amperage,
		PermanentFailureStatus,
		AppleRawCurrentCapacity,
		CurrentCapacity,
		AppleRawMaxCapacity,
		MaxCapacity,
		CycleCount,
		ExternalConnected,
		AdapterDetails,
		Temperature
	} = batteryInfo
	/* -------------------------------------------------------------------------- */
	/*                               Time Remaining                               */
	/* -------------------------------------------------------------------------- */
	const hoursRemaining = Math.floor(TimeRemaining / 60)
	const minutesRemaining = (TimeRemaining % 60).toLocaleString("en-US", {
		minimumIntegerDigits: 2
	})
	/* -------------------------------------------------------------------------- */
	/*                                  Condition                                 */
	/* -------------------------------------------------------------------------- */
	const status = PermanentFailureStatus === 0 ? "Good" : "Failure"
	const formattedCondition = PermanentFailureStatus !== undefined ? `${status}` : "--"

	const timeRemainingFormatted =
		TimeRemaining !== undefined && TimeRemaining < 1500 && TimeRemaining !== 0
			? `${hoursRemaining}:${minutesRemaining}`
			: "--"
	/* -------------------------------------------------------------------------- */
	/*                                Power Usage                                 */
	/* -------------------------------------------------------------------------- */
	const power = Math.round((Voltage / 1000) * (Amperage / 1000))
	const powerUsage = Amperage && Voltage ? `${power} W (${Amperage} mA)` : "--"
	/* -------------------------------------------------------------------------- */
	/*                              Current Capacity                              */
	/* -------------------------------------------------------------------------- */
	const currentCap = AppleRawCurrentCapacity || CurrentCapacity
	const maxCap = AppleRawMaxCapacity || MaxCapacity
	const formattedCurrentCapacity = currentCap && maxCap ? `${currentCap} mAh / ${maxCap} mAh` : "--"

	/* -------------------------------------------------------------------------- */
	/*                                Power Source                                */
	/* -------------------------------------------------------------------------- */
	const adapterName = AdapterDetails ? AdapterDetails["Name"] : ""
	const adapterSerial = AdapterDetails ? AdapterDetails["SerialString"] : ""
	const adapterLabel =
		adapterName && adapterSerial ? `${adapterName} (${adapterSerial})` : "Power Adapter"
	const powerSource = ExternalConnected === true ? adapterLabel : "Battery"

	const formattedPowerSource = ExternalConnected !== undefined ? `${powerSource}` : "--"

	/* -------------------------------------------------------------------------- */
	/*                                 Temperature                                */
	/* -------------------------------------------------------------------------- */
	const celcius = Math.round(Temperature / 100)
	const fahrenheit = Math.round(celcius * (9 / 5) + 32)
	const temeratureFormatted = Temperature ? `${celcius} °C / ${fahrenheit} °F` : "--"
	return {
		minutesRemaining,
		CurrentCapacity,
		formattedCondition,
		timeRemainingFormatted,
		powerUsage,
		formattedCurrentCapacity,
		formattedPowerSource,
		temeratureFormatted
	}
}

// return ui.render(
//     new List.List({
//         items: [
//             new List.Item({
//                 title: "Time Remaining",
//                 value: "time-remaining",
//                 subTitle: timeRemainingFormatted
//             }),
//             new List.Item({
//                 title: "Percentage",
//                 value: "percentage",
//                 subTitle: `${CurrentCapacity.toString()}%`
//             }),
//             new List.Item({
//                 title: "Power Usage",
//                 value: "power-usage",
//                 subTitle: powerUsage
//             }),
//             new List.Item({
//                 title: "Condition",
//                 value: "condition",
//                 subTitle: formattedCondition
//             }),
//             new List.Item({
//                 title: "Charge",
//                 value: "charge",
//                 subTitle: formattedCurrentCapacity
//             }),
//             new List.Item({
//                 title: "Cycle Count",
//                 value: "cycle-count",
//                 subTitle: CycleCount.toString()
//             }),
//             new List.Item({
//                 title: "Power Source",
//                 value: "power-source",
//                 subTitle: formattedPowerSource
//             }),
//             new List.Item({
//                 title: "Temperature",
//                 value: "temperature",
//                 subTitle: temeratureFormatted
//             })
//         ]
//     })
// )
