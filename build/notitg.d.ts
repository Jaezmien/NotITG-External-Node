export declare class NotITG {
    private maxIndex;
    private startingAddress;
    private process;
    get Connected(): boolean;
    private _version;
    private _filename;
    get Version(): string | undefined;
    get Filename(): string | undefined;
    private Connect;
    Scan(deep?: boolean): boolean;
    FromProcessID(id: number): boolean;
    Disconnect(): void;
    Heartbeat(): boolean;
    GetExternal(index: number): number;
    SetExternal(index: number, flag?: number): void;
}
