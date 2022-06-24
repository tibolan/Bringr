var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import DeepMerge from "./DeepMerge.js";
import { BringrConnectionError, BringrError, BringrTimeoutError } from "./Errors.js";
class BringrResponse {
    /**
     * BringrResponse transform response into usable data
     * Could normalize response to a predictive and exhaustive format
     * Could automatically transform your response based on mime type
     * Supply text, json, blob, arrayBuffer, formData, and even base64 output
     * Could manage fetch duration
     * Internal code, should not use directly
     * @param options
     */
    constructor(options) {
        this.options = {
            normalize: true,
            transform: true,
            type: 'json',
            blobAsBase64: false
        };
        this.options = DeepMerge(this.options, options);
    }
    static setDuration(request) {
        let endAt = request.endAt || performance.now();
        let startAt = request.startAt || endAt;
        delete request.startAt;
        delete request.endAt;
        return Number((endAt - startAt).toFixed(0));
    }
    build(response, request, error, fromCache = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = {
                cached: fromCache,
                request: request
            };
            let shouldNormalize = request.response && request.response.normalize !== undefined ? request.response.normalize : this.options.normalize;
            let shouldTransform = request.response && request.response.transform !== undefined ? request.response.transform : this.options.transform;
            let responseType = request.response && request.response.type !== undefined ? request.response.type : this.options.type;
            /* if an error was thrown somewhere */
            if (error && error instanceof Error) {
                // cast specific timeout error
                request.duration = BringrResponse.setDuration(request);
                let isOnline = navigator.onLine !== undefined ? navigator.onLine : true;
                if (!isOnline) {
                    error = new BringrConnectionError('No connection available');
                }
                else if (error.name === "TypeError") {
                    error = new BringrError(error.message);
                }
                else if (error.name === 'AbortError' && request.timeout && request.duration >= request.timeout) {
                    error = new BringrTimeoutError('request aborted by timeout', {
                        cause: error
                    });
                    Object.assign(output, {
                        timeout: true
                    });
                }
                else if (error.name === 'AbortError') {
                    Object.assign(output, {
                        aborted: true
                    });
                }
                if (shouldNormalize) {
                    if (response) {
                        Object.assign(output, {
                            response
                        });
                    }
                    return Object.assign(output, {
                        error: {
                            name: error.name,
                            message: error.message
                        },
                        data: null
                    });
                }
                else {
                    return error;
                }
            }
            /* if fetch succeed, aka the server has responded something */
            else {
                let fetchResponse = error && error.ok === false ? error : response;
                /**  GET RESPONSE BODY TRANSFORMED */
                let transformedResponse = false;
                if (shouldTransform) {
                    try {
                        // @ts-ignore
                        transformedResponse = yield this[responseType](fetchResponse.clone());
                    }
                    catch (e) {
                        transformedResponse = e;
                    }
                }
                if (shouldNormalize) {
                    /** BASE OBJECT */
                    Object.assign(output, {
                        response: fetchResponse,
                        redirected: fetchResponse.redirected,
                        status: fetchResponse.status,
                        statusText: fetchResponse.statusText
                    });
                    /** ATTACH ERROR */
                    if (!fetchResponse.ok) {
                        Object.assign(output, {
                            error: {
                                name: error.status,
                                message: error.statusText
                            }
                        });
                    }
                    /** ATTACH RESPONSE DATA */
                    if (transformedResponse instanceof Error) {
                        Object.assign(output, {
                            data: {
                                name: transformedResponse.name,
                                message: transformedResponse.message
                            },
                            transformError: true
                        });
                    }
                    else {
                        Object.assign(output, {
                            data: transformedResponse || fetchResponse
                        });
                    }
                    /** ATTACH TIMING */
                    request.duration = BringrResponse.setDuration(request);
                    /** RETURN OUTPUT*/
                    return output;
                }
                else {
                    /** RETURN TRANSFORMED OR RAW RESPONSE*/
                    return transformedResponse || fetchResponse;
                }
            }
        });
    }
    json(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield res.json();
        });
    }
    form(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield res.formData();
        });
    }
    buffer(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield res.arrayBuffer();
        });
    }
    blob(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield res.blob();
        });
    }
    base64(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let blob = yield this.blob(res);
            return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // await ??
                    const reader = yield new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.onerror = (err) => {
                        reject(err);
                    };
                    reader.onabort = (err) => {
                        reject(err);
                    };
                    // await ??
                    reader.readAsDataURL(blob);
                }
                catch (err) {
                    resolve(err);
                }
            }));
        });
    }
    text(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield res.text();
        });
    }
    auto(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let mime = res.headers.get('content-type');
            if (!mime) {
                return yield this.autoBrutForce(res);
            }
            else if (/^text/.test(mime)) {
                return yield this.text(res);
            }
            else if (/json/.test(mime)) {
                return yield this.json(res);
            }
            else if (mime === "multipart/form-data") {
                return yield this.form(res);
            }
            else if (mime === "application/octet-stream") {
                return yield this.buffer(res);
            }
            else if (/^image/.test(mime)
                || /^video/.test(mime)
                || /^audio/.test(mime)
                || /^font/.test(mime)) {
                console.log(this.options.blobAsBase64);
                if (this.options.blobAsBase64) {
                    return yield this.base64(res);
                }
                return yield this.blob(res);
            }
            return yield this.autoBrutForce(res);
        });
    }
    autoBrutForce(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let methods = ['json', 'form', 'text'];
            for (let method of methods) {
                let clone = res.clone();
                try {
                    // @ts-ignore
                    return yield this[method](clone);
                }
                catch (e) {
                    //
                }
            }
            return res;
        });
    }
}
export default BringrResponse;
//# sourceMappingURL=BringrResponse.js.map