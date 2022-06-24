import Bringr from "./js/Bringr.js";
import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js'
import DeepMerge from "./js/DeepMerge.js";
import httpCodes from "./medias/httpCodes.js";
import demoUrls from "./medias/demoUrls.js";
import docs from "./medias/docs.js";

const defaultConfig = {
    cache: {
        name: "myAPI",
        version: "1.0.0"
    },
    request: {
        default: {
            cacheable: 0,
            cancellable: false,
            method: 'GET',
            timeout: 0,
            retry: {
                max: 0,
                delay: 500,
                attempt: 0,
                condition: [408, 504, 598, 599, "BringrTimeoutError"]
            },
        },
        basePath: "",
        queryStringStrategy: "standard"
    },
    response: {
        normalize: true,
        transform: true,
        type: 'auto'
    }
}


var app = new Vue({
    el: '#app',
    data: {
        api: {
            loading: false
        },
        response: null,
        autoRequest: false,
        forceRetry: false,
        base64Response: null,
        loading: false,
        isError: false,
        model: {
            url: demoUrls.text,
            cacheable: defaultConfig.request.default.cacheable,
            cancellable: defaultConfig.request.default.cancellable,
            timeout: defaultConfig.request.default.timeout,
            method: defaultConfig.request.default.method,
            responseType: defaultConfig.response.type,
            retry: {
                max: defaultConfig.request.default.retry.max,
                delay: defaultConfig.request.default.retry.delay,
                attempt: 0,
                condition: defaultConfig.request.default.retry.condition
            },
            errorType: 400,
            delay: 0,
            body: "none"
        },
        queryStringStrategy: 'standard',
        responseNormalize: true,
        responseTransform: true,
        httpCodes,
        demoUrls,
        defaultConfig,
        expr: /object (\w+)/,
        maxChars: 500,
        requests: []
    },
    computed: {
        request() {
            let url = this.model.url === this.demoUrls.error ? `${this.model.url}/${this.model.errorType}` : this.model.url
            let json = {
                firstname: "Donald",
                lastname: "Duck",
                desc: "Got 3 nephews"
            }
            let request = {
                url: url,
                method: this.model.method
            }

            if (Number(this.model.cacheable) !== defaultConfig.request.default.cacheable) {
                request.cacheable = Number(this.model.cacheable)
            }
            if (this.model.cancellable !== defaultConfig.request.default.cancellable) {
                request.cancellable = this.model.cancellable
            }
            if (Number(this.model.timeout) !== defaultConfig.request.default.timeout) {
                request.timeout = Number(this.model.timeout)
            }


            let retry = {}
            if (Number(this.model.retry.max) !== defaultConfig.request.default.retry.max) {
                retry.max = Number(this.model.retry.max)
            }
            if (Number(this.model.retry.delay) !== defaultConfig.request.default.retry.delay) {
                retry.delay = Number(this.model.retry.delay)
            }
            if (this.forceRetry) {
                retry.condition = true
            }

            if (Object.keys(retry).length) {
                request.retry = retry
            } else {
                delete request.retry
            }

            let resp = {}
            if (this.model.responseType !== defaultConfig.response.type) {
                resp.type = this.model.responseType
            }
            if (!this.responseNormalize) {
                Object.assign(resp, {
                    normalize: false
                })
            }
            if (!this.responseTransform) {
                Object.assign(resp, {
                    transform: false
                })
            }
            if (Object.keys(resp).length) {
                request.response = resp
            } else {
                delete request.response
            }

            if (Number(this.model.delay)) {
                request.query = Object.assign(request.query || {}, {
                    sleep: Number(this.model.delay)
                })
            }

            if (this.model.body === "json") {
                request.json = json
            } else if (this.model.body === "formData") {
                request.form = json
            } else if (this.model.body === "blob") {
                let blob = new Blob(["This is some important text"],
                    { type: "text/plain" });
                request.blob = blob
            } else if (['POST', 'PUT', 'PATCH'].includes(this.model.method)){
                request.body = JSON.stringify(json)
            }


            return request

        },
        httpErrors() {
            return JSON.parse(JSON.stringify(this.httpCodes, (key, value) => {
                return !key.length || Number(key) >= 400 ? value : undefined
            }))
        },

        loader() {
            return Loader
        },

        cacheToDelete() {
            try {
                let url = new URL(this.request.url)
                delete url.searchParams
                if (this.request.query) {
                    for (let q in this.request.query) {
                        url.searchParams.append(q, this.request.query[q])
                    }
                }
                return url.toString()
            } catch (e) {
                return this.request.url
            }
        },

        renderedRequest() {
            // return `const myApi = new Bringr(${this.stringifyCorrectly(defaultConfig)})
            return `const myApi = new Bringr(defaultOptions)
// same as myApi.fetch("${this.request.method}", {...}) 
myApi.${this.request.method}(${this.stringifyCorrectly(this.request)})
  .then(...)
  .catch(...)`
        }
    },
    methods: {
        onSubmit() {
            this.base64Response = null
            this.requests.push(DeepMerge({}, this.request))
            this.api.fetch(this.request.method, this.request)
                .then(async (res) => {
                    this.isError = false
                    this.setResponse(res)
                })
                .catch((err) => {
                    this.isError = true
                    this.setResponse(err)
                })
        },
        onChange() {
            if (this.autoRequest) {
                this.onSubmit()
            }
        },
        onClear() {
            this.response = null
            this.requests = []
        },
        deleteCache() {
            this.api.deleteCache(this.request)
        },
        deleteCaches() {
            this.api.clearCache()
        },
        setResponse(response) {
            this.response = response
            if (/^data:/.test(response.data)) {
                this.base64Response = response.data
            }
        },
        refreshHighlight(type) {
            if (type) {
                this.$nextTick(() => {
                    console.log(type, this.$refs[type])
                    window.Prism.highlightAllUnder(this.$refs[type])
                })
            } else {
                this.$nextTick(() => {
                    window.Prism.highlightAll()
                })
            }
        },
        stringifyCorrectly(response) {
            let responseAsString = response instanceof String ? response : JSON.stringify(response, (key, value) => {
                let type = value ? value.toString() : ''
                let match = type.match(this.expr)
                if (match && match[1] !== 'Object') {
                    return type
                }
                if (typeof value === "string") {
                    return value.length > this.maxChars ? `${value.substring(0, this.maxChars)}...` : value
                }
                return value
            }, 2)
            return responseAsString
        },

        automaticDocumentation(source, event) {

            function skipTo(elm, char) {
                prev = elm.previousElementSibling
                while (prev) {
                    let text = getRawText(prev)
                    prev = prev.previousElementSibling
                    if (char === text) {
                        break
                    }
                }
                return prev
            }


            function getRawText(node) {
                let text = node.textContent
                return text.replace(/['"`]/g, '')
            }

            let target = event.target
            if (!target.classList.contains('property')) {
                return false
            }

            let code = target.closest("code")
            let path = [getRawText(target)]
            let prev = target.previousElementSibling

            while (prev !== code) {
                let text = getRawText(prev)
                if (text === ')') {
                    prev = skipTo(prev, '(')
                } else if (text === ']') {
                    prev = skipTo(prev, '[')
                } else if (text === '}') {
                    prev = skipTo(prev, '{')
                } else if (prev.classList.contains('punctuation')) {
                    let beforePrev = prev.previousElementSibling
                    let beforeBeforePrev = beforePrev && beforePrev.previousElementSibling
                    if (beforePrev && beforeBeforePrev && beforePrev.classList.contains('operator') && beforeBeforePrev.classList.contains('property')) {
                        path.push(getRawText(beforeBeforePrev))
                        prev = beforeBeforePrev
                    } else {
                        prev = prev.previousElementSibling
                    }
                } else {
                    prev = prev.previousElementSibling
                }
                if (!prev) {
                    break
                }
            }

            return this.showDoc(source, path.reverse().join('.'))
        },

        showDoc(source, path) {
            let item = docs[source] && docs[source][path] && docs[source][path].desc
            if (item) {
                console.log(item)
            } else {
                console.log('no doc:', path)
            }

        },

        switchMode () {
            this.$root.$el.classList.toggle('hideForm')
        }
    },
    watch: {
        'api.loading': {
            immediate: true,
            handler(state) {
                this.loading = state || false
            }
        },
        renderedRequest(request) {
            this.refreshHighlight('request')
        },
        response(request) {
            this.refreshHighlight('response')
        }
    },
    beforeMount() {
        this.api = new Bringr(defaultConfig)
        this.refreshHighlight()
    }
})
