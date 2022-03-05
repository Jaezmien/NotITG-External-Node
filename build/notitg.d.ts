import memoryjs from 'memoryjs';
export declare class NotITG {
    private maxIndex;
    private startingAddress;
    Process: memoryjs.ProcessObject | undefined;
    get Connected(): boolean;
    private _version;
    private _filename;
    private _gamePath;
    get Version(): string | undefined;
    get Filename(): string | undefined;
    get GamePath(): string | undefined;
    private Connect;
    Scan(deep?: boolean): boolean;
    FromProcessID(id: number): boolean;
    Disconnect(): void;
    Heartbeat(): boolean;
    GetExternal(index: number): number;
    SetExternal(index: number, flag?: number): void;
}
