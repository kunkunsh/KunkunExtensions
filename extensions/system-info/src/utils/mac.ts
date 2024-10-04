/* -------------------------------------------------------------------------- */
/*                                   Memory                                   */
/* -------------------------------------------------------------------------- */

/**
 * ```bash
 * /usr/bin/top -l 1 -o mem -n 5 -stats command,mem
 * ```
 */
export function getTopMemoryProcesses() {
	// TODO: Implement this function
	throw new Error("Not implemented")
}

// interface MemoryInterface {
// 	memTotal: number
// 	memUsed: number
// }

// https://github.com/raycast/extensions/blob/fcdfc5a643eb998696befbf229f5a7c34533e893/extensions/system-monitor/src/Memory/MemoryUtils.ts#L3
// export const getTotalMemoryUsage = async (): Promise<MemoryInterface> => {
// 	const pHwPagesize = await execp("/usr/sbin/sysctl -n hw.pagesize")
// 	const hwPagesize: number = parseFloat(pHwPagesize)
// 	const pMemTotal = await execp("/usr/sbin/sysctl -n hw.memsize")
// 	const memTotal: number = parseFloat(pMemTotal) / 1024 / 1024
// 	const pVmPagePageableInternalCount = await execp(
// 		"/usr/sbin/sysctl -n vm.page_pageable_internal_count"
// 	)
// 	const pVmPagePurgeableCount = await execp("/usr/sbin/sysctl -n vm.page_purgeable_count")
// 	const pagesApp: number =
// 		parseFloat(pVmPagePageableInternalCount) - parseFloat(pVmPagePurgeableCount)
// 	const pPagesWired = await execp("/usr/bin/vm_stat | awk '/ wired/ { print $4 }'")
// 	const pagesWired: number = parseFloat(pPagesWired)
// 	const pPagesCompressed = await execp("/usr/bin/vm_stat | awk '/ occupied/ { printf $5 }'")
// 	const pagesCompressed: number = parseFloat(pPagesCompressed) || 0
// 	const memUsed = ((pagesApp + pagesWired + pagesCompressed) * hwPagesize) / 1024 / 1024

// 	return {
// 		memTotal: memTotal,
// 		memUsed: memUsed
// 	}
// }

/* -------------------------------------------------------------------------- */
/*                                   Network                                  */
/* -------------------------------------------------------------------------- */
// https://github.com/raycast/extensions/blob/fcdfc5a643eb998696befbf229f5a7c34533e893/extensions/system-monitor/src/Network/NetworkUtils.ts#L4-L23

// Get Process Network Speed
// const nettopOptions = [
// 	"time",
// 	"interface",
// 	"state",
// 	"rx_dupe",
// 	"rx_ooo",
// 	"re-tx",
// 	"rtt_avg",
// 	"rcvsize",
// 	"tx_win",
// 	"tc_class",
// 	"tc_mgt",
// 	"cc_algo",
// 	"P",
// 	"C",
// 	"R",
// 	"W",
// 	"arch"
// ]
// const output = await execp(`/usr/bin/nettop -P -L 1 -k ${nettopOptions.join()}`)

