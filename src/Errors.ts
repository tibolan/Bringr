/** TIMEOUT ERROR */
class BringrTimeoutError extends Error {
  constructor(message = "", cause: any = {}) {
    // @ts-ignore
    super(message, cause);
    this.message = message
    this.name = "BringrTimeoutError"
  }
}

/** NO CONNECTION ERROR */
class BringrConnectionError extends Error {
  constructor(message:string, cause: any = {}) {
    // @ts-ignore
    super(message, cause);
    this.message = `${message}`
    this.name = "BringrConnectionError"
  }
}
/** GENERIC BRINGR ERROR */
class BringrError extends Error {
  constructor(message:string, cause: any = {}) {
    // @ts-ignore
    super(message, cause);
    this.message = `${message}`
    this.name = "BringrError"
  }
}
export {
  BringrTimeoutError,
  BringrConnectionError,
  BringrError
}
