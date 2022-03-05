import memoryjs from 'memoryjs'

interface INotITGVersion {
	BuildAddress: number
	Address: number
	BuildDate: number
	Size: number
}
const NOTITG_VERSION: { [key: string]: INotITGVersion } = {
	V1: {
		BuildAddress: 0x006aed20,
		Address: 0x00896950,
		BuildDate: 20161224,
		Size: 10,
	},
	V2: {
		BuildAddress: 0x006b7d40,
		Address: 0x008a0880,
		BuildDate: 20170405,
		Size: 10,
	},
	V3: {
		BuildAddress: 0x006dfd60,
		Address: 0x008cc9d8,
		BuildDate: 20180617,
		Size: 64,
	},
	'V3.1': {
		BuildAddress: 0x006e7d60,
		Address: 0x008be0f8,
		BuildDate: 20180827,
		Size: 64,
	},
	V4: {
		BuildAddress: 0x006e0e60,
		Address: 0x008ba388,
		BuildDate: 20200112,
		Size: 64,
	},
	'V4.0.1': {
		BuildAddress: 0x006c5e40,
		Address: 0x00897d10,
		BuildDate: 20200126,
		Size: 64,
	},
	'V4.2': {
		BuildAddress: 0x006fad40,
		Address: 0x008bff38,
		BuildDate: 20210420,
		Size: 256,
	},
}

const NOTITG_FILENAMES: { [key: string]: string } = {
	V1: 'NotITG.exe',
	V2: 'NotITG-170405.exe',
	V3: 'NotITG-V3.exe',
	'V3.1': 'NotITG-V3.1.exe',
	V4: 'NotITG-V4.exe',
	'V4.0.1': 'NotITG-V4.0.1.exe',
	'V4.2': 'NotITG-v4.2.0.exe',
}

export class NotITG {
	private maxIndex: number = -1
	private startingAddress: number = -1

	public Process: memoryjs.ProcessObject | undefined = undefined
	get Connected() {
		return this.Process !== undefined
	}

	private _version = ''
	private _filename = ''
	private _gamePath = ''
	get Version() {
		return this.Connected ? this._version : undefined
	}
	get Filename() {
		return this.Connected ? this._filename : undefined
	}
	get GamePath() {
		return this.Connected ? this._gamePath : undefined
	}

	private Connect(process: memoryjs.ProcessObject, version: string, filename: string) {
		this._version = version
		this._filename = filename

		const DETAILS = NOTITG_VERSION[version]
		this.maxIndex = DETAILS.Size - 1
		this.startingAddress = DETAILS.Address

		this.Process = memoryjs.openProcess(process.th32ProcessID)
		this._gamePath = memoryjs
			.getModules(process.th32ProcessID)
			.find((module) => module.szExePath.endsWith(filename))!.szExePath
	}
	Scan(deep: boolean = false): boolean {
		if (this.Connected) return true

		if (!deep) {
			try {
				const PROCESSES = memoryjs.getProcesses()
				for (const PROCESS of PROCESSES) {
					for (const [VERSION, FILENAME] of Object.entries(NOTITG_FILENAMES)) {
						if (FILENAME.toLowerCase() === PROCESS.szExeFile.toLowerCase()) {
							this.Connect(PROCESS, VERSION, PROCESS.szExeFile)
							return true
						}
					}
				}
			} catch (_) {
				//
			}
		} else {
			try {
				const PROCESSES = memoryjs.getProcesses()
				for (const PROCESS of PROCESSES) {
					for (const [VERSION] of Object.entries(NOTITG_FILENAMES)) {
						const ADDRESSES = NOTITG_VERSION[VERSION]
						if (
							parseInt(memoryjs.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs.STRING)) ===
							ADDRESSES.BuildDate
						) {
							this.Connect(PROCESS, VERSION, PROCESS.szExeFile)
							return true
						}
					}
				}
			} catch (_) {
				//
			}
		}

		return false
	}
	FromProcessID(id: number): boolean {
		if (this.Connected) return true

		try {
			const PROCESS = memoryjs.openProcess(id)
			for (const [VERSION] of Object.entries(NOTITG_FILENAMES)) {
				const ADDRESSES = NOTITG_VERSION[VERSION]
				if (
					parseInt(memoryjs.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs.STRING)) ===
					ADDRESSES.BuildDate
				) {
					this.Connect(PROCESS, VERSION, PROCESS.szExeFile)
					return true
				}
			}
		} catch (_) {
			//
		}

		return false
	}
	Disconnect() {
		if (!this.Connected) return
		this.Process = undefined
	}
	Heartbeat(): boolean {
		if (!this.Connected) return false
		try {
			return memoryjs.getProcesses().some((p) => p.th32ProcessID === this.Process!.th32ProcessID)
		} catch (_) {
			return false
		}
	}

	GetExternal(index: number): number {
		if (!this.Connected) return 0
		if (index < 0 || index > this.maxIndex) return 0

		return parseInt(memoryjs.readMemory(this.Process!.handle, this.startingAddress + index * 4, memoryjs.INT))
	}
	SetExternal(index: number, flag: number = 0) {
		if (!this.Connected) return
		if (index < 0 || index > this.maxIndex) return

		memoryjs.writeMemory(this.Process!.handle, this.startingAddress + index * 4, flag, memoryjs.INT)
	}
}
