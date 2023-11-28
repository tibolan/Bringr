import BringrRequest from "./BringrRequest";
import DeepMerge from "./DeepMerge.js";
import {BringrConnectionError, BringrError, BringrTimeoutError} from "./Errors.js";
import {
    BringrRequestInterface,
    BringrResponseInterface,
    BringrResponseOptionsInterface
} from "./types";

class BringrResponse {
    public options: BringrResponseOptionsInterface = {
        normalize: true,
        transform: true,
        type: 'auto',
        blobAsBase64: false
    }

    /**
     * BringrResponse transform response into usable data
     * Could normalize response to a predictive and exhaustive format
     * Could automatically transform your response based on mime type
     * Supply text, json, blob, arrayBuffer, formData, and even base64 output
     * Could manage fetch duration
     * Internal code, should not use directly
     * @param options
     */
    constructor(options: BringrResponseOptionsInterface) {
        this.options = DeepMerge(this.options, options)
    }

    private static setDuration(request: BringrRequestInterface) {
        const endAt = request.endAt || performance.now()
        const startAt = request.startAt || endAt
        delete request.startAt
        delete request.endAt
        return Number((endAt - startAt).toFixed(0))
    }

    async build(response: Response | null, request: BringrRequestInterface, error?: any, fromCache: boolean = false): Promise<any> {
        const output: BringrResponseInterface = {
            cached: fromCache,
            request: request as BringrRequest
        }

        const shouldNormalize = request.response && request.response.normalize !== undefined ? request.response.normalize : this.options.normalize
        const shouldTransform = request.response && request.response.transform !== undefined ? request.response.transform : this.options.transform
        const responseType = request.response && request.response.type !== undefined ? request.response.type : this.options.type

        /* if an error was thrown somewhere */
        if (error && error instanceof Error) {
            // cast specific timeout error
            request.duration = BringrResponse.setDuration(request)
            const isOnline = navigator.onLine !== undefined ? navigator.onLine : true

            if (!isOnline) {
                error = new BringrConnectionError('No connection available')
            } else if (error.name === "TypeError") {
                error = new BringrError(error.message)
            } else if (error.name === 'AbortError' && request.timeout && request.duration >= request.timeout) {
                error = new BringrTimeoutError('request aborted by timeout', {
                    cause: error
                })
                Object.assign(output, {
                    timeout: true
                })
            } else if (error.name === 'AbortError') {
                Object.assign(output, {
                    aborted: true
                })
            }

            if (shouldNormalize) {
                if (response) {
                    Object.assign(output, {
                        response
                    })
                }
                return Object.assign(output, {
                    error: {
                        name: error.name,
                        message: error.message
                    },
                    data: null
                })
            } else {
                return error
            }
        }
        /* if fetch succeed, aka the server has responded something */
        else {
            const fetchResponse = error && error.ok === false ? error : response

            /**  GET RESPONSE BODY TRANSFORMED */
            let transformedResponse: any = false
            if (shouldTransform) {
                try {
                    // @ts-ignore
                    transformedResponse = await this[responseType](fetchResponse.clone())
                } catch (e: any) {
                    transformedResponse = e
                }
            }

            if (shouldNormalize) {

                /** BASE OBJECT */
                Object.assign(output, {
                    response: fetchResponse,
                    redirected: fetchResponse.redirected,
                    status: fetchResponse.status,
                    statusText: fetchResponse.statusText
                })

                /** ATTACH ERROR */
                if (!fetchResponse.ok) {
                    Object.assign(output, {
                        error: {
                            name: error.status,
                            message: error.statusText
                        }
                    })
                }

                /** ATTACH RESPONSE DATA */
                if (transformedResponse instanceof Error) {
                    Object.assign(output, {
                        data: {
                            name: transformedResponse.name,
                            message: transformedResponse.message
                        },
                        transformError: true
                    })
                } else {
                    Object.assign(output, {
                        data: transformedResponse || fetchResponse
                    })
                }

                /** ATTACH TIMING */
                request.duration = BringrResponse.setDuration(request)

                /* RETURN OUTPUT*/
                return output
            } else {
                /* RETURN TRANSFORMED OR RAW RESPONSE*/
                return transformedResponse || fetchResponse
            }
        }
    }

    async json(res: Response) {
        return await res.json()
    }

    async form(res: Response) {
        return await res.formData()
    }

    async buffer(res: Response) {
        return await res.arrayBuffer()
    }

    async blob(res: Response) {
        return await res.blob()
    }

    async base64(res: Response) {
        const blob = await this.blob(res)
        return await new Promise(async (resolve, reject) => {
            try {
                const reader = await new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result)
                }
                reader.onerror = (err) => {
                    reject(err)
                }
                reader.onabort = (err) => {
                    reject(err)
                }
                reader.readAsDataURL(blob);
            } catch (err) {
                resolve(err)
            }
        })
    }

    async text(res: Response) {
        return await res.text()
    }

    async auto(res: Response) {
        const mime = res.headers.get('content-type')

        if (!mime) {
            return await this.autoBrutForce(res)
        } else if (/^text/.test(mime)) {
            return await this.text(res)
        } else if (/json/.test(mime)) {
            return await this.json(res)
        } else if (mime === "multipart/form-data") {
            return await this.form(res)
        } else if (mime === "application/octet-stream") {
            return await this.buffer(res)
        } else if (
            /^image/.test(mime)
            || /^video/.test(mime)
            || /^audio/.test(mime)
            || /^font/.test(mime)
        ) {
            if (this.options.blobAsBase64) {
                return await this.base64(res)
            }
            return await this.blob(res)
        }
        return await this.autoBrutForce(res)
    }

    async autoBrutForce(res: Response) {
        const methods = ['json', 'form', 'text']
        for (const method of methods) {
            const clone = res.clone()
            try {
                // @ts-ignore
                return await this[method](clone)
            } catch (e) {
                //
            }
        }
        return res
    }
}

export default BringrResponse
