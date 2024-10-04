// https://github.com/raycast/extensions/blob/fcdfc5a643eb998696befbf229f5a7c34533e893/extensions/port-manager/src/models/Process.ts#L44

// On Mac, this command lists all the ports that are listening
// /usr/sbin/lsof +c0 -iTCP -w -sTCP:LISTEN -P -FpcRuLPn

// enum LsofPrefix {
// 	PROCESS_NAME = "c",
// 	PROCESS_ID = "p",
// 	PARENT_PROCESS_ID = "R",
// 	USER_ID = "u",
// 	USER_NAME = "L",
// 	PROTOCOL = "P",
// 	PORTS = "n",
// 	INTERNET_PROTOCOLL = "t"
// }

// function isDigit(character: string) {
// 	return !Number.isNaN(Number(character))
// }

// async function getCurrent() {
// 	// const namedPorts = getNamedPorts()
// 	const cmd = `/usr/sbin/lsof +c0 -iTCP -w -sTCP:LISTEN -P -FpcRuLPn`

// 	const { stdout, stderr } = await exec(cmd)
// 	if (stderr) throw new Error(stderr)
// 	const processes = stdout.split("\np")
// 	const instances: Process[] = []
// 	for (const process of processes) {
// 		if (process.length === 0) continue
// 		const lines = process.split("\n")
// 		const values: ProcessInfo = { pid: 0 }
// 		for (const line of lines) {
// 			if (line.length === 0) continue
// 			const prefix = line[0]
// 			const value = line.slice(1)
// 			if (value.length === 0) continue
// 			switch (prefix) {
// 				case LsofPrefix.PROCESS_ID:
// 					values.pid = Number(value)
// 					break
// 				case LsofPrefix.PROCESS_NAME:
// 					values.name = value
// 					break
// 				case LsofPrefix.PARENT_PROCESS_ID:
// 					values.parentPid = Number(value)
// 					break
// 				case LsofPrefix.USER_NAME:
// 					values.user = value
// 					break
// 				case LsofPrefix.USER_ID:
// 					values.uid = Number(value)
// 					break
// 				case LsofPrefix.PROTOCOL:
// 					values.protocol = value
// 					break
// 				case LsofPrefix.PORTS:
// 					values.portInfo
// 						? values.portInfo.push({
// 								host: value.split(":")[0],
// 								name: namedPorts[Number(value.split(":")[1])]?.name,
// 								port: Number(value.split(":")[1])
// 							})
// 						: (values.portInfo = [
// 								{
// 									host: value.split(":")[0],
// 									name: namedPorts[Number(value.split(":")[1])]?.name,
// 									port: Number(value.split(":")[1])
// 								}
// 							])
// 					break
// 				case LsofPrefix.INTERNET_PROTOCOLL:
// 					values.internetProtocol = value
// 					break
// 				default:
// 					if (isDigit(prefix)) values.pid = Number(`${prefix}${value}`)
// 					break
// 			}
// 		}
// 		const p = new Process(
// 			values.pid,
// 			values.name,
// 			values.parentPid,
// 			values.user,
// 			values.uid,
// 			values.protocol,
// 			values.portInfo
// 		)
// 		await p.loadPath()
// 		await p.loadParentPath()
// 		instances.push(p)
// 	}
// 	return instances
// }
