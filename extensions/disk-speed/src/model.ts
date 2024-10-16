export interface DiskSpeedTestInput {
	targetPath: string
	sequential: {
		stressFileSizeMB: number
	}
	random: {
		stressFileSizeMB: number
		iterations: number
		blockSize: number
	}
}

export interface DiskSpeedTestOutput {
	writeSpeedMBps: number
	readSpeedMBps: number
}
