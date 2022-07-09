import BringrAbort from "./BringrAbort.js";
import BringrCache from "./BringrCache.js";
import BringrRequest from "./BringrRequest.js";
import BringrResponse from "./BringrResponse.js";
import DeepMerge from "./DeepMerge.js";
import {
  BringrMethodsType,
  BringrRequestInterface,
  BringrRequestDefaultType,
  BringrOptionsInterface
} from "./types";

class Bringr {
  public config: BringrOptionsInterface = {
    cache: {
      name: "BringrCache",
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
      blobAsBase64: false
    }
  };
  private cache: BringrCache;
  protected aborter: BringrAbort;
  private response: BringrResponse;
  private loading: boolean = false;


  constructor(options: BringrOptionsInterface) {
    this.config = DeepMerge(this.config, options);
    this.cache = new BringrCache(this.config.cache);
    this.aborter = new BringrAbort();
    this.response = new BringrResponse(this.config.response);
  }

  async fetch(method: BringrMethodsType, requestDefinition: BringrRequestDefaultType): Promise<any> {
    this.loading = true;
    if (!this.cache.ready) {
      /** REPEAT UNTIL CACHE IS READY */
      return new Promise(resolve => {
        window.requestAnimationFrame(() => {
          return resolve(this.fetch(method, requestDefinition));
        });
      });
    } else {
      let request: any;
      try {
        /** BUILD REQUEST */
        requestDefinition.method = method;
        request = new BringrRequest(requestDefinition, this.config.request);
      } catch (e) {
        this.loading = false;
        return Promise.reject(await this.response.build(null, requestDefinition as BringrRequestInterface, e as Error));
      }

      /** CANCELLABLE SUPPORT */
      if (request.cancellable) {
        // try to abort a previous request
        this.aborter.abort(request);
        this.aborter.register(request);
      }

      /** CACHE STORAGE SUPPORT */
      if (this.cache.cacheStorageSupported && request.cacheable && !request.ignoreCache) {
        const cache: Response | Boolean = await this.cache.getCache(request.url);
        if (cache) {
          this.loading = false;
          return await this.response.build(cache as Response, request, null, true);
        }
      }

      /** TIMEOUT SUPPORT */
      if (request.timeout) {
        let timeout = Number(request.timeout);
        this.aborter.abortAfter(request, timeout);
      }

      try {
        let response = await window.fetch(request.url, request);

        /** CLEAR TIMEOUT */
        if (request.timeout) {
          this.aborter.clear(request);
        }

        /** STORE CACHE */
        if (response.ok && request.cacheable) {
          await this.cache.add(request.url, response, request.cacheable);
        }

        /** SEND RESPONSE */
        if (response.ok) {
          return await this.response.build(response, request);
        } else {
          /** THROW HTTP 40x/50x */
          /** ALLOW TO 'CATCH' NOT OK RESPONSE*/
          throw response;
        }
      } catch (e) {
        /** CATCH 40x/50x AND THROWN ERROR */
        let response = await this.response.build(null, request, e);

        /** RETRY SUPPORT */
        if (await request.checkRetry(response, request)) {
          return await this.fetch(method, request);
        }
        return Promise.reject(response);
      } finally {
        this.loading = false;
      }
    }
  }

  async GET(request: BringrRequestDefaultType | String): Promise<any> {
    if (typeof request === "string") {
      request = {
        url: request
      };
    }
    return await this.fetch("GET", request as BringrRequestInterface);
  }

  async DELETE(request: BringrRequestDefaultType): Promise<any> {
    if (typeof request === "string") {
      request = {
        url: request
      };
    }
    return await this.fetch("DELETE", request as BringrRequestInterface);
  }

  async HEAD(request: BringrRequestDefaultType): Promise<any> {
    return await this.fetch("HEAD", request as BringrRequestInterface);
  }

  async POST(request: BringrRequestDefaultType): Promise<any> {
    return await this.fetch("POST", request as BringrRequestInterface);
  }

  async PUT(request: BringrRequestDefaultType): Promise<any> {
    return await this.fetch("PUT", request as BringrRequestInterface);
  }

  async PATCH(request: BringrRequestDefaultType): Promise<any> {
    return await this.fetch("PATCH", request as BringrRequestInterface);
  }

  async abortRequest(request: BringrRequestInterface): Promise<void> {
    this.aborter.abort(request);
  }

  async deleteCache(request: BringrRequestInterface): Promise<void> {
    await this.cache.remove(request.url);
  }

  async clearCache(request: BringrRequestInterface): Promise<void> {
    await this.cache.clear();
  }
}

export default Bringr;
