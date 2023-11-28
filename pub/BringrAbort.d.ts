import { BringrAbortStoreInterface, BringrRequestInterface } from "./types";
declare class BringrAbort {
    store: BringrAbortStoreInterface;
    private timers;
    /**
     * BringrAbort operate AbortController by request
     * Could cancel a request to prevent repeated call
     * Could operate timeout on Request
     * Internal code, should not use directly
     */
    constructor();
    register(request: BringrRequestInterface): void;
    abort(request: BringrRequestInterface): void;
    abortAfter(request: BringrRequestInterface, duration: number): void;
    clear(request: BringrRequestInterface): void;
}
export default BringrAbort;
