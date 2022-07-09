var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BringrAbort from "./BringrAbort.js";
import BringrCache from "./BringrCache.js";
import BringrRequest from "./BringrRequest.js";
import BringrResponse from "./BringrResponse.js";
import DeepMerge from "./DeepMerge.js";
class Bringr {
    constructor(options) {
        this.config = {
            cache: {
                name: "myAPI",
                version: "1.0.0"
            },
            request: {
                default: {
                    cacheable: 0,
                    cancellable: false,
                    timeout: 0,
                    retry: {
                        max: 1,
                        delay: 1000,
                        attempt: 0,
                        condition: [408, 504, 598, 599, "BringrTimeoutError"]
                    }
                },
                basePath: "",
                queryStringStrategy: "standard"
            },
            response: {
                normalize: true,
                transform: true,
                type: "auto",
                blobAsBase64: true
            }
        };
        this.loading = false;
        this.config = DeepMerge(this.config, options);
        this.cache = new BringrCache(this.config.cache);
        this.aborter = new BringrAbort();
        this.response = new BringrResponse(this.config.response);
    }
    fetch(method, requestDefinition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loading = true;
            if (!this.cache.ready) {
                /** REPEAT UNTIL CACHE IS READY */
                return new Promise(resolve => {
                    window.requestAnimationFrame(() => {
                        return resolve(this.fetch(method, requestDefinition));
                    });
                });
            }
            else {
                let request;
                try {
                    /** BUILD REQUEST */
                    requestDefinition.method = method;
                    request = new BringrRequest(requestDefinition, this.config.request);
                }
                catch (e) {
                    this.loading = false;
                    return Promise.reject(yield this.response.build(null, requestDefinition, e));
                }
                /** CANCELLABLE SUPPORT */
                if (request.cancellable) {
                    this.aborter.abort(request);
                    this.aborter.register(request);
                }
                /** CACHE STORAGE SUPPORT */
                if (this.cache.cacheStorageSupported && request.cacheable && !request.ignoreCache) {
                    const cache = yield this.cache.getCache(request.url);
                    if (cache) {
                        this.loading = false;
                        return yield this.response.build(cache, request, null, true);
                    }
                }
                /** TIMEOUT SUPPORT */
                if (request.timeout) {
                    let timeout = Number(request.timeout);
                    this.aborter.abortAfter(request, timeout);
                }
                try {
                    let response = yield window.fetch(request.url, request);
                    /** CLEAR TIMEOUT */
                    if (request.timeout) {
                        this.aborter.clear(request);
                    }
                    /** STORE CACHE */
                    if (response.ok && request.cacheable) {
                        yield this.cache.add(request.url, response, request.cacheable);
                    }
                    /** SEND RESPONSE */
                    if (response.ok) {
                        return yield this.response.build(response, request);
                    }
                    else {
                        /** THROW HTTP 40x/50x */
                        /** ALLOW TO 'CATCH' NOT OK RESPONSE*/
                        throw response;
                    }
                }
                catch (e) {
                    /** CATCH 40x/50x AND THROWN ERROR */
                    let response = yield this.response.build(null, request, e);
                    /** RETRY SUPPORT */
                    if (yield request.checkRetry(response, request)) {
                        return yield this.fetch(method, request);
                    }
                    return Promise.reject(response);
                }
                finally {
                    this.loading = false;
                }
            }
        });
    }
    GET(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof request === "string") {
                request = {
                    url: request
                };
            }
            return yield this.fetch("GET", request);
        });
    }
    DELETE(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch("DELETE", request);
        });
    }
    HEAD(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch("HEAD", request);
        });
    }
    POST(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch("POST", request);
        });
    }
    PUT(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch("PUT", request);
        });
    }
    PATCH(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch("PATCH", request);
        });
    }
    abortRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            this.aborter.abort(request);
        });
    }
    deleteCache(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cache.remove(request.url);
        });
    }
    clearCache(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cache.clear();
        });
    }
}
export default Bringr;
//# sourceMappingURL=Bringr.js.map