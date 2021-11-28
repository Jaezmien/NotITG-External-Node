"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotITG = void 0;
var memoryjs_1 = __importDefault(require("memoryjs"));
var NOTITG_VERSION = {
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
};
var NOTITG_FILENAMES = {
    "V1": "NotITG.exe",
    "V2": "NotITG-170405.exe",
    "V3": "NotITG-V3.exe",
    "V3.1": "NotITG-V3.1.exe",
    "V4": "NotITG-V4.exe",
    "V4.0.1": "NotITG-V4.0.1.exe",
    "V4.2": "NotITG-v4.2.0.exe",
};
var NotITG = /** @class */ (function () {
    function NotITG() {
        this.maxIndex = -1;
        this.startingAddress = -1;
        this.process = undefined;
        this._version = "";
        this._filename = "";
    }
    Object.defineProperty(NotITG.prototype, "Connected", {
        get: function () { return this.process !== undefined; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotITG.prototype, "Version", {
        get: function () { return this.Connected ? this._version : undefined; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotITG.prototype, "Filename", {
        get: function () { return this.Connected ? this._filename : undefined; },
        enumerable: false,
        configurable: true
    });
    NotITG.prototype.Connect = function (process, version, filename) {
        this._version = version;
        this._filename = filename;
        var DETAILS = NOTITG_VERSION[version];
        this.maxIndex = DETAILS.Size - 1;
        this.startingAddress = DETAILS.Address;
        this.process = memoryjs_1.default.openProcess(process.th32ProcessID);
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
                            this.Connect(PROCESS, VERSION, FILENAME);
                            return true;
                        }
                    }
                }
            }
            catch (_) {
                console.error(_);
            }
        }
        else {
            try {
                var PROCESSES = memoryjs_1.default.getProcesses();
                for (var _d = 0, PROCESSES_2 = PROCESSES; _d < PROCESSES_2.length; _d++) {
                    var PROCESS = PROCESSES_2[_d];
                    for (var _e = 0, _f = Object.entries(NOTITG_FILENAMES); _e < _f.length; _e++) {
                        var _g = _f[_e], VERSION = _g[0], FILENAME = _g[1];
                        var ADDRESSES = NOTITG_VERSION[VERSION];
                        if (parseInt(memoryjs_1.default.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs_1.default.INT)) === ADDRESSES.BuildDate) {
                            this.Connect(PROCESS, VERSION, FILENAME);
                            return true;
                        }
                    }
                }
            }
            catch (_) {
                console.error(_);
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
                var _b = _a[_i], VERSION = _b[0], FILENAME = _b[1];
                var ADDRESSES = NOTITG_VERSION[VERSION];
                if (parseInt(memoryjs_1.default.readMemory(PROCESS.handle, ADDRESSES.BuildAddress, memoryjs_1.default.INT)) === ADDRESSES.BuildDate) {
                    this.Connect(PROCESS, VERSION, FILENAME);
                    return true;
                }
            }
        }
        catch (_) { }
        return false;
    };
    NotITG.prototype.Disconnect = function () {
        if (!this.Connected)
            return;
        this.process = undefined;
    };
    NotITG.prototype.Heartbeat = function () {
        var _this = this;
        if (!this.Connected)
            return false;
        try {
            return memoryjs_1.default.getProcesses().some(function (p) { return p.th32ProcessID === _this.process.th32ProcessID; });
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
        return parseInt(memoryjs_1.default.readMemory(this.process.handle, this.startingAddress + (index * 4), memoryjs_1.default.INT));
    };
    NotITG.prototype.SetExternal = function (index, flag) {
        if (flag === void 0) { flag = 0; }
        if (!this.Connected)
            return;
        if (index < 0 || index > this.maxIndex)
            return;
        memoryjs_1.default.writeMemory(this.process.handle, this.startingAddress + (index * 4), flag, memoryjs_1.default.INT);
    };
    return NotITG;
}());
exports.NotITG = NotITG;
