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
import sleep from "./sleep.js";
class BringrRequest {
    /**
     * BringrRequest build a valid Request
     * Advanced query build options and a retry management
     * Internal code, should not use directly
     * @param request
     * @param config
     */
    constructor(request, config) {
        this.url = '';
        this.cacheable = 0;
        this.cancellable = false;
        this.duration = 0;
        this.startAt = 0;
        this.endAt = 0;
        this.headers = {};
        this.ignoreCache = false;
        this.method = "GET";
        this.retry = {
            max: 0,
            delay: 0,
            condition: [408, 504, 598, 599, 'BringrTimeoutError'],
            attempt: 0
        };
        this.timeout = 0;
        /** BUILD BODY FIRST TO NOT POLLUTE OBJECT WITH SUGAR KEY (json, form...) */
        this.buildBody(request);
        /** MERGE WITH DEFAULT */
        DeepMerge(this, config.default, request);
        this.buildURI(config.basePath, request, config.queryStringStrategy);
    }
    buildURI(basePath, request, strategy) {
        var _a;
        let baseUrl = `${basePath}${request.url}`;
        /** TREAT DOUBLE CONCATENATION WHILE RETRY */
        if (basePath && ((_a = request.url) === null || _a === void 0 ? void 0 : _a.match(basePath))) {
            baseUrl = request.url;
        }
        /** MONITOR TIME */
        this.startAt = performance.now();
        /** BUILD PROPER URL */
        try {
            let url = new URL(baseUrl);
            /** PROCESS QUERY */
            this.processQuery(url, strategy);
            this.url = url.toString();
        }
        catch (err) {
            throw err;
        }
    }
    processQuery(url, strategy) {
        /** GET QUERY STRING PARAMETERS IN this.url */
        let searchParams = (url.toString().split('?'))[1];
        if (searchParams) {
            /** TRANSFORM PARAMETERS INTO ARRAY OF 'KEY=VALUE' */
            let queryParams = searchParams.split('&');
            /** STORAGE */
            let urlQuery = {};
            /** PARSE AND MERGE INTO REQUEST THE QUERY PARAMS PRESENTS IN this.url */
            for (let param of queryParams) {
                let [key, value] = param.split('=');
                /** IF VALUE IS LIKE "v1,v2,v3", CAST AS ARRAY */
                if (/,/.test(value)) {
                    value = value.split(',');
                }
                /** MERGE SAME KEY IN ARRAY */
                if (urlQuery[key] && !Array.isArray(urlQuery[key])) {
                    urlQuery[key] = [urlQuery[key]];
                }
                /** UPDATE STORAGE */
                if (Array.isArray(urlQuery[key])) {
                    urlQuery[key].push(value);
                }
                else {
                    urlQuery[key] = value;
                }
            }
            /** CLEAR QUERY PARAMS IN this.url */
            for (let q in urlQuery) {
                url.searchParams.delete(q);
            }
            /** MERGE QUERY SOURCE */
            this.query = DeepMerge({}, urlQuery, this.query);
        }
        if (this.query) {
            /** ADD QUERY PARAMS FROM this.query IN this.url */
            for (let q in this.query) {
                url.searchParams.append(q, this.query[q]);
            }
            /** APPLY REPEATED KEY STRATEGY */
            if (['duplicate', 'bracket'].includes(strategy)) {
                for (let param in this.query) {
                    if (Array.isArray(this.query[param])) {
                        url.searchParams.delete(param);
                        for (let value of this.query[param]) {
                            if (strategy === 'duplicate') {
                                url.searchParams.append(param, value);
                            }
                            else if (strategy === 'bracket') {
                                url.searchParams.append(`${param}[]`, value);
                            }
                        }
                    }
                }
            }
        }
    }
    buildBody(request) {
        /* GET or HEAD request can't get a body */
        if (request.method && ['GET', 'HEAD'].includes(request.method)) {
            console.warn('Request with GET/HEAD method cannot have body.', request);
            return false;
        }
        /* JSON type */
        if (request.json) {
            try {
                this.body = JSON.stringify(request.json);
                if (!this.headers['Content-Type']) {
                    this.headers['Content-Type'] = "application/json";
                }
                // @ts-ignore
                delete request.json;
            }
            catch (e) {
                throw e;
            }
        }
        /* FORM type*/
        else if (request.form) {
            try {
                let form = new FormData();
                for (let field in request.form) {
                    form.append(field, request.form[field]);
                }
                this.body = form;
                delete request.form;
            }
            catch (e) {
                throw e;
            }
        }
        /* FILES type */
        else if (request.files) {
            try {
                let data = new FormData();
                for (let field in request.files) {
                    data.append(field, request.files[field]);
                }
                this.body = data;
                delete request.files;
            }
            catch (e) {
                throw e;
            }
        }
    }
    checkRetry(response, request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.retry.max > this.retry.attempt && this.checkCondition(this.retry.condition, response, request)) {
                    this.retry.attempt++;
                    if (this.retry.delay) {
                        yield sleep(this.retry.delay);
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        });
    }
    checkCondition(condition, response, request) {
        let isValid = false;
        switch (true) {
            case typeof condition === "boolean": {
                isValid = condition;
                break;
            }
            case typeof condition === "function": {
                isValid = condition(response, request);
                break;
            }
            case typeof condition === "string" && Boolean(Object.keys(response.error).length): {
                isValid = condition === response.error.name;
                break;
            }
            case typeof condition === "number": {
                isValid = condition === response.status;
                break;
            }
            case Array.isArray(condition): {
                isValid = condition.some((item) => {
                    return this.checkCondition(item, response, request);
                });
                break;
            }
        }
        return isValid;
    }
}
export default BringrRequest;
//# sourceMappingURL=BringrRequest.js.map