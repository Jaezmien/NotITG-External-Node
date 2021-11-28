import memoryjs from "memoryjs";

interface INotITGVersion {
	BuildAddress: number;
	Address: number;
	BuildDate: number;
	Size: number;
}
const NOTITG_VERSION : { [key: string]: INotITGVersion } = {
	"V1": {
		"BuildAddress": 0x006AED20,
		"Address": 0x00896950,
		"BuildDate": 20161224,
		"Size": 10
	},
	"V2": {
		"BuildAddress": 0x006B7D40,
		"Address": 0x008A0880,
		"BuildDate": 20170405,
		"Size": 10
	},
	"V3": {
		"BuildAddress": 0x006DFD60,
		"Address": 0x008CC9D8,
		"BuildDate": 20180617,
		"Size": 64
	},
	"V3.1": {
		"BuildAddress": 0x006E7D60,
		"Address": 0x008BE0F8,
		"BuildDate": 20180827,
		"Size": 64
	},
	"V4": {
		"BuildAddress": 0x006E0E60,
		"Address": 0x008BA388,
		"BuildDate": 20200112,
		"Size": 64
	},
	"V4.0.1": {
		"BuildAddress": 0x006C5E40,
		"Address": 0x00897D10,
		"BuildDate": 20200126,
		"Size": 64
	},
	"V4.2": {
		"BuildAddress": 0x006FAD40,
		"Address": 0x008BFF38,
		"BuildDate": 20210420,
		"Size": 256
	}
}

const NOTITG_FILENAMES : { [key: string]: string } = {
    "V1"    : "NotITG.exe",
    "V2"    : "NotITG-170405.exe",
    "V3"    : "NotITG-V3.exe",
    "V3.1"  : "NotITG-V3.1.exe",
    "V4"    : "NotITG-V4.exe",
    "V4.0.1": "NotITG-V4.0.1.exe",
	"V4.2"  : "NotITG-v4.2.0.exe",
}

export class NotITG {

	private maxIndex: number = -1;
	private startingAddress: number = -1;

	private process: (memoryjs.ProcessObject | undefined) = undefined;
	get Connected() { return this.process !== undefined }

	private _version = "";
	private _filename = "";
	get Version()  { return this.Connected ? this._version  : undefined }
	get Filename() { return this.Connected ? this._filename : undefined }

	private Connect( process: memoryjs.ProcessObject, version: string, filename: string ) {
		this._version = version
		this._filename = filename

		const DETAILS = NOTITG_VERSION[version]
		this.maxIndex = DETAILS.Size - 1
		this.startingAddress = DETAILS.Address

		this.process = memoryjs.openProcess( process.th32ProcessID )
	}
	Scan( deep: boolean = false ) : boolean {
		if( this.Connected ) return true

		if( !deep ) {

			try {
				const PROCESSES = memoryjs.getProcesses()
				for( const PROCESS of PROCESSES ) {
					for( const [VERSION, FILENAME] of Object.entries(NOTITG_FILENAMES) ) {
						if( FILENAME.toLowerCase() === PROCESS.szExeFile.toLowerCase() ) {
							this.Connect( PROCESS, VERSION, FILENAME );
							return true;
						}
					}
				}
			}
			catch(_){console.error(_)}

		}
		else {

			try {
				const PROCESSES = memoryjs.getProcesses()
				for( const PROCESS of PROCESSES ) {
					for( const [VERSION, FILENAME] of Object.entries(NOTITG_FILENAMES) ) {
						const ADDRESSES = NOTITG_VERSION[ VERSION ]
						if( parseInt(memoryjs.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs.INT)) === ADDRESSES.BuildDate ) {
							this.Connect( PROCESS, VERSION, FILENAME );
							return true;
						}
					}
				}
			}
			catch(_){console.error(_)}

		}

		return false
	}
	FromProcessID( id: number ) : boolean {
		if( this.Connected ) return true
		
		try {
			const PROCESS = memoryjs.openProcess( id )
			for( const [VERSION, FILENAME] of Object.entries(NOTITG_FILENAMES) ) {
				const ADDRESSES = NOTITG_VERSION[ VERSION ]
				if( parseInt(memoryjs.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs.INT)) === ADDRESSES.BuildDate ) {
					this.Connect( PROCESS, VERSION, FILENAME );
					return true;
				}
			}
		}
		catch(_){}

		return false;

	}
	Disconnect() {
		if( !this.Connected ) return; this.process = undefined
	}
	Heartbeat() : boolean {
		if( !this.Connected ) return false;
		try {
			return memoryjs.getProcesses().some(p => p.th32ProcessID === this.process!.th32ProcessID)
		}
		catch(_){
			return false
		}
	}

	GetExternal( index: number ) : number {
		if( !this.Connected ) return 0
		if( index < 0 || index > this.maxIndex ) return 0

		return parseInt(
			memoryjs.readMemory( this.process!.handle, this.startingAddress + (index * 4), memoryjs.INT )
		)
	}
	SetExternal( index: number, flag: number = 0 ) {
		if( !this.Connected ) return
		if( index < 0 || index > this.maxIndex ) return

		memoryjs.writeMemory( this.process!.handle, this.startingAddress + (index * 4), flag, memoryjs.INT )
	}

}