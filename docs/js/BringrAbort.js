class BringrAbort {
    /**
     * BringrAbort operate AbortController by request
     * Could cancel a request to prevent repeated call
     * Could operate timeout on Request
     * Internal code, should not use directly
     */
    constructor() {
        this.timers = {};
        this.store = {};
    }
    register(request) {
        const controller = new AbortController();
        request.signal = controller.signal;
        this.store[request.url] = controller;
    }
    abort(request) {
        let canceler = this.store[request.url];
        if (canceler) {
            canceler.abort();
        }
        this.clear(request);
    }
    abortAfter(request, duration) {
        this.register(request);
        this.timers[request.url] = setTimeout(() => {
            this.abort(request);
        }, duration);
    }
    clear(request) {
        clearTimeout(this.timers[request.url]);
        delete this.timers[request.url];
        delete this.store[request.url];
    }
}
export default BringrAbort;
//# sourceMappingURL=BringrAbort.js.map