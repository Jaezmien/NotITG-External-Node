

declare module 'memoryjs' {

	// CONSTANTS

	const BYTE = 'byte'
	const INT = 'int'
	const INT32 = 'int32'
	const UINT32 = 'uint32'
	const INT64 = 'int64'
	const UINT64 = 'uint64'
	const DWORD = 'dword'
	const SHORT = 'short'
	const LONG = 'long'
	const FLOAT = 'float'
	const DOUBLE = 'double'
	const BOOL = 'bool'
	const BOOLEAN = 'boolean'
	const PTR = 'ptr'
	const POINTER = 'pointer'
	const STR = 'str'
	const STRING = 'string'
	const VEC3 = 'vec3'
	const VECTOR3 = 'vector3'
	const VEC4 = 'vec4'
	const VECTOR4 = 'vector4'

	type DataTypes = 'byte' | 'int' | 'int32' | 'uint32' | 'int64' | 'uint64' | 'dword' | 'short' | 'long' | 'float' | 'double' | 'bool' | 'boolean' | 'ptr' | 'pointer' | 'str' | 'string' | 'vec3' | 'vector3' | 'vec4' | 'vector4'

	const NORMAL = 0x0
	const READ = 0x1
	const SUBTRACT = 0x2

	const T_VOID = 0x0
	const T_STRING = 0x1
	const T_CHAR = 0x2
	const T_BOOL = 0x3
	const T_INT = 0x4
	const T_DOUBLE = 0x5
	const T_FLOAT = 0x6

	const PAGE_NOACCESS = 0x01
	const PAGE_READONLY = 0x02
	const PAGE_READWRITE = 0x04
	const PAGE_WRITECOPY = 0x08
	const PAGE_EXECUTE = 0x10
	const PAGE_EXECUTE_READ = 0x20
	const PAGE_EXECUTE_READWRITE = 0x40
	const PAGE_EXECUTE_WRITECOPY = 0x80
	const PAGE_GUARD = 0x100
	const PAGE_NOCACHE = 0x200
	const PAGE_WRITECOMBINE = 0x400
	const PAGE_ENCLAVE_UNVALIDATED = 0x20000000
	const PAGE_TARGETS_NO_UPDATE = 0x40000000
	const PAGE_TARGETS_INVALID = 0x40000000
	const PAGE_ENCLAVE_THREAD_CONTROL = 0x80000000

	const MEM_COMMIT = 0x00001000
	const MEM_RESERVE = 0x00002000
	const MEM_RESET = 0x00080000
	const MEM_TOP_DOWN = 0x00100000
	const MEM_RESET_UNDO = 0x1000000
	const MEM_LARGE_PAGES = 0x20000000
	const MEM_PHYSICAL = 0x00400000

	const MEM_PRIVATE = 0x20000
	const MEM_MAPPED = 0x40000
	const MEM_IMAGE = 0x1000000

	const DR0 = 0x0
	const DR1 = 0x1
	const DR2 = 0x2
	const DR3 = 0x3

	const TRIGGER_EXECUTE = 0x0
	const TRIGGER_ACCESS = 0x3
	const TRIGGER_WRITE = 0x1

	// PROCESS

	type ProcessIdentifier = string | number;

	interface ProcessObject {
		dwSize: number;
		th32ProcessID: number;
		cntThreads: number;
		th32ParentProcessID: number;
		pcPriClassBase: number;
		szExeFile: string;
		modBaseAddr: number;
		handle: number;
	}

	function openProcess( identifier: ProcessIdentifier ) : ProcessObject
	function openProcess( identifier: ProcessIdentifier, callback: (error: string, process: ProcessObject) => void ) : void

	function getProcesses( ) : ProcessObject[]
	function getProcesses( callback: (error: string, processes: ProcessObject[]) => void )

	function closeProcess( handle: number ) : void

	// MODULES

	interface ModuleObject {
		modBaseAddr: number;
		modBaseSize: number;
		szExePath: string;
		szModule: string;
		th32ProcessID: number
	}

	function findModule( moduleName: string, processID: number ) : ModuleObject
	function findModule( moduleName: string, processID: number, callback: (error: string, module: ModuleObject ) => void ) : void

	function getModules( processID: number ) : ModuleObject[]
	function getModules( processID: number, callback: (error: string, module: ModuleObject[] ) => void ) : void

	// MEMORY

	function readMemory( handle: number, address: number, dataType: DataTypes ) : any
	function readMemory( handle: number, address: number, dataType: DataTypes, callback: ( error: string, value: any ) => void ) : void

	function writeMemory( handle: number, address: number, value: any, dataType: DataTypes )



};