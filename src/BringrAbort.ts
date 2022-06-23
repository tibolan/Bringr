import {BringrAbortStoreInterface, BringrAbortTimerInterface, BringrRequestInterface} from "./types";

class BringrAbort {
  public store: BringrAbortStoreInterface;
  private timers: BringrAbortTimerInterface = {}

  /**
   * BringrAbort operate AbortController by request
   * Could cancel a request to prevent repeated call
   * Could operate timeout on Request
   * Internal code, should not use directly
   */
  constructor() {
    this.store = {}
  }

  register(request: BringrRequestInterface) {
    const controller = new AbortController();
    request.signal = controller.signal
    this.store[request.url] = controller
  }

  abort(request: BringrRequestInterface) {
    let canceler: AbortController = this.store[request.url]
    if (canceler) {
      canceler.abort()
    }
    this.clear(request)
  }

  abortAfter(request: BringrRequestInterface, duration: number) {
    this.register(request)
    this.timers[request.url] = setTimeout(() => {
      this.abort(request)
    }, duration) as unknown as number
  }

  clear(request: BringrRequestInterface) {
    clearTimeout(this.timers[request.url])
    delete this.timers[request.url]
    delete this.store[request.url]
  }
}

export default BringrAbort
