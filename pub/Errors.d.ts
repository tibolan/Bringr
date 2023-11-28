/** TIMEOUT ERROR */
declare class BringrTimeoutError extends Error {
    constructor(message?: string, cause?: any);
}
/** NO CONNECTION ERROR */
declare class BringrConnectionError extends Error {
    constructor(message: string, cause?: any);
}
/** GENERIC BRINGR ERROR */
declare class BringrError extends Error {
    constructor(message: string, cause?: any);
}
export { BringrTimeoutError, BringrConnectionError, BringrError };
