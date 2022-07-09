import DeepMerge from "./DeepMerge.js";
import sleep from "./sleep.js";
import {
  BringrMethodsType,
  BringrRequestOptionsInterface,
  BringrQueryStringStrategyType,
  BringrRequestDefaultType,
  BringrRequestInterface
} from "./types";

class BringrRequest implements BringrRequestInterface {
  public url: string = ''
  public body: any;
  public cacheable: number = 0
  public cancellable: boolean = false
  public duration: number = 0
  public startAt: number = 0
  public endAt: number = 0
  public headers: any = {}
  public ignoreCache: boolean = false
  public method: BringrMethodsType = "GET";
  public query: any;
  public retry: { max: number; delay: number; attempt: number; condition: any } = {
    max: 0,
    delay: 0,
    condition: [408, 504, 598, 599, 'BringrTimeoutError'],
    attempt: 0
  }
  public timeout: number = 0

  /**
   * BringrRequest build a valid Request
   * Advanced query build options and a retry management
   * Internal code, should not use directly
   * @param request
   * @param config
   */
  constructor(request: BringrRequestDefaultType, config: BringrRequestOptionsInterface) {
    /** BUILD BODY FIRST TO NOT POLLUTE OBJECT WITH SUGAR KEY (json, form...) */
    this.buildBody(request)
    /** MERGE WITH DEFAULT */
    DeepMerge(this, config.default, request)
    this.buildURI(config.basePath, request, config.queryStringStrategy)
  }

  buildURI(basePath: string, request: BringrRequestDefaultType, strategy: BringrQueryStringStrategyType): void {
    let baseUrl = `${basePath}${request.url}`

    /** TREAT DOUBLE CONCATENATION WHILE RETRY */
    if (basePath && request.url?.match(basePath)) {
      baseUrl = request.url
    }

    /** MONITOR TIME */
    this.startAt = performance.now()

    /** BUILD PROPER URL */
    try {
      let url = new URL(baseUrl)
      /** PROCESS QUERY */
      this.processQuery(url, strategy)
      this.url = url.toString()
    } catch (err) {
      throw err
    }
  }

  processQuery(url: URL, strategy: BringrQueryStringStrategyType) {
    /** GET QUERY STRING PARAMETERS IN this.url */
    let searchParams = (url.toString().split('?'))[1]
    if (searchParams) {
      /** TRANSFORM PARAMETERS INTO ARRAY OF 'KEY=VALUE' */
      let queryParams: any[] = searchParams.split('&')
      /** STORAGE */
      let urlQuery: any = {}

      /** PARSE AND MERGE INTO REQUEST THE QUERY PARAMS PRESENTS IN this.url */
      for (let param of queryParams) {
        let [key, value] = param.split('=')

        /** IF VALUE IS LIKE "v1,v2,v3", CAST AS ARRAY */
        if (/,/.test(value)) {
          value = value.split(',')
        }

        /** MERGE SAME KEY IN ARRAY */
        if (urlQuery[key] && !Array.isArray(urlQuery[key])) {
          urlQuery[key] = [urlQuery[key]]
        }

        /** UPDATE STORAGE */
        if (Array.isArray(urlQuery[key])) {
          urlQuery[key].push(value)
        } else {
          urlQuery[key] = value
        }
      }

      /** CLEAR QUERY PARAMS IN this.url */
      for (let q in urlQuery) {
        url.searchParams.delete(q)
      }

      /** MERGE QUERY SOURCE */
      this.query = DeepMerge({}, urlQuery, this.query)
    }

    if (this.query) {
      /** ADD QUERY PARAMS FROM this.query IN this.url */
      for (let q in this.query) {
        url.searchParams.append(q, this.query[q])
      }

      /** APPLY REPEATED KEY STRATEGY */
      if (['duplicate', 'bracket'].includes(strategy)) {
        for (let param in this.query) {
          if (Array.isArray(this.query[param])) {
            url.searchParams.delete(param)
            for (let value of this.query[param]) {
              if (strategy === 'duplicate') {
                url.searchParams.append(param, value)
              } else if (strategy === 'bracket') {
                url.searchParams.append(`${param}[]`, value)
              }
            }
          }
        }
      }
    }
  }

  buildBody(request: BringrRequestDefaultType) {
    /* GET or HEAD request can't get a body */
    if (request.method && ['GET', 'HEAD'].includes(request.method)) {
      console.warn('Request with GET/HEAD method cannot have body.', request)
      return false
    }

    /* JSON type */
    if (request.json) {
      try {
        this.body = JSON.stringify(request.json)
        if (!this.headers['Content-Type']) {
          this.headers['Content-Type'] = "application/json"
        }
        // @ts-ignore
        delete request.json
      } catch (e) {
        throw e
      }
    }
    /* FORM type*/
    else if (request.form) {
      try {
        let form = new FormData()
        for (let field in request.form) {
          form.append(field, request.form[field])
        }
        this.body = form
        delete request.form
      } catch (e) {
        throw e
      }
    }

    else if (request.blob) {
      try {
        this.body = request.blob
        delete request.blob
      } catch (e) {
        throw e
      }
    }
  }

  async checkRetry(response: any, request: BringrRequestInterface) {
    try {
      if (this.retry.max > this.retry.attempt && this.checkCondition(this.retry.condition, response, request)) {
        this.retry.attempt++
        if (this.retry.delay) {
          await sleep(this.retry.delay)
        }
        return true
      }
      return false
    } catch (e) {
      return false
    }

  }

  checkCondition(condition: any, response: any, request: BringrRequestInterface) {
    let isValid = false
    switch (true) {
      case typeof condition === "boolean": {
        isValid = condition
        break
      }
      case typeof condition === "function": {
        isValid = condition(response, request)
        break
      }
      case typeof condition === "string" && Boolean(Object.keys(response.error).length): {
        isValid = condition === response.error.name
        break
      }
      case typeof condition === "number": {
        isValid = condition === response.status
        break
      }
      case Array.isArray(condition): {
        isValid = condition.some((item: any) => {
          return this.checkCondition(item, response, request)
        })
        break
      }
    }
    return isValid
  }
}

export default BringrRequest
