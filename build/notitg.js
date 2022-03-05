"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotITG = void 0;
var memoryjs_1 = __importDefault(require("memoryjs"));
var NOTITG_VERSION = {
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
};
var NOTITG_FILENAMES = {
    V1: 'NotITG.exe',
    V2: 'NotITG-170405.exe',
    V3: 'NotITG-V3.exe',
    'V3.1': 'NotITG-V3.1.exe',
    V4: 'NotITG-V4.exe',
    'V4.0.1': 'NotITG-V4.0.1.exe',
    'V4.2': 'NotITG-v4.2.0.exe',
};
var NotITG = /** @class */ (function () {
    function NotITG() {
        this.maxIndex = -1;
        this.startingAddress = -1;
        this.Process = undefined;
        this._version = '';
        this._filename = '';
        this._gamePath = '';
    }
    Object.defineProperty(NotITG.prototype, "Connected", {
        get: function () {
            return this.Process !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotITG.prototype, "Version", {
        get: function () {
            return this.Connected ? this._version : undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotITG.prototype, "Filename", {
        get: function () {
            return this.Connected ? this._filename : undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotITG.prototype, "GamePath", {
        get: function () {
            return this.Connected ? this._gamePath : undefined;
        },
        enumerable: false,
        configurable: true
    });
    NotITG.prototype.Connect = function (process, version, filename) {
        this._version = version;
        this._filename = filename;
        var DETAILS = NOTITG_VERSION[version];
        this.maxIndex = DETAILS.Size - 1;
        this.startingAddress = DETAILS.Address;
        this.Process = memoryjs_1.default.openProcess(process.th32ProcessID);
        this._gamePath = memoryjs_1.default
            .getModules(process.th32ProcessID)
            .find(function (module) { return module.szExePath.endsWith(filename); }).szExePath;
    };
    NotITG.prototype.Scan = function (deep) {
        if (deep === void 0) { deep = false; }
        if (this.Connected)
            return true;
        if (!deep) {
            try {
                var PROCESSES = memoryjs_1.default.getProcesses();
                for (var _i = 0, PROCESSES_1 = PROCESSES; _i < PROCESSES_1.length; _i++) {
                    var PROCESS = PROCESSES_1[_i];
                    for (var _a = 0, _b = Object.entries(NOTITG_FILENAMES); _a < _b.length; _a++) {
                        var _c = _b[_a], VERSION = _c[0], FILENAME = _c[1];
                        if (FILENAME.toLowerCase() === PROCESS.szExeFile.toLowerCase()) {
                            this.Connect(PROCESS, VERSION, PROCESS.szExeFile);
                            return true;
                        }
                    }
                }
            }
            catch (_) {
                //
            }
        }
        else {
            try {
                var PROCESSES = memoryjs_1.default.getProcesses();
                for (var _d = 0, PROCESSES_2 = PROCESSES; _d < PROCESSES_2.length; _d++) {
                    var PROCESS = PROCESSES_2[_d];
                    for (var _e = 0, _f = Object.entries(NOTITG_FILENAMES); _e < _f.length; _e++) {
                        var VERSION = _f[_e][0];
                        var ADDRESSES = NOTITG_VERSION[VERSION];
                        if (parseInt(memoryjs_1.default.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs_1.default.STRING)) ===
                            ADDRESSES.BuildDate) {
                            this.Connect(PROCESS, VERSION, PROCESS.szExeFile);
                            return true;
                        }
                    }
                }
            }
            catch (_) {
                //
            }
        }
        return false;
    };
    NotITG.prototype.FromProcessID = function (id) {
        if (this.Connected)
            return true;
        try {
            var PROCESS = memoryjs_1.default.openProcess(id);
            for (var _i = 0, _a = Object.entries(NOTITG_FILENAMES); _i < _a.length; _i++) {
                var VERSION = _a[_i][0];
                var ADDRESSES = NOTITG_VERSION[VERSION];
                if (parseInt(memoryjs_1.default.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs_1.default.STRING)) ===
                    ADDRESSES.BuildDate) {
                    this.Connect(PROCESS, VERSION, PROCESS.szExeFile);
                    return true;
                }
            }
        }
        catch (_) {
            //
            console.log(_);
        }
        return false;
    };
    NotITG.prototype.Disconnect = function () {
        if (!this.Connected)
            return;
        this.Process = undefined;
    };
    NotITG.prototype.Heartbeat = function () {
        var _this = this;
        if (!this.Connected)
            return false;
        try {
            return memoryjs_1.default.getProcesses().some(function (p) { return p.th32ProcessID === _this.Process.th32ProcessID; });
        }
        catch (_) {
            return false;
        }
    };
    NotITG.prototype.GetExternal = function (index) {
        if (!this.Connected)
            return 0;
        if (index < 0 || index > this.maxIndex)
            return 0;
        return parseInt(memoryjs_1.default.readMemory(this.Process.handle, this.startingAddress + index * 4, memoryjs_1.default.INT));
    };
    NotITG.prototype.SetExternal = function (index, flag) {
        if (flag === void 0) { flag = 0; }
        if (!this.Connected)
            return;
        if (index < 0 || index > this.maxIndex)
            return;
        memoryjs_1.default.writeMemory(this.Process.handle, this.startingAddress + index * 4, flag, memoryjs_1.default.INT);
    };
    return NotITG;
}());
exports.NotITG = NotITG;
