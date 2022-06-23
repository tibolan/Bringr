import { BringrCacheInterface, BringrCacheStoreInterface, BringrCacheOptionsInterface } from "./types";

class BringrCache implements BringrCacheInterface {
  public ready: boolean = false
  public store: BringrCacheStoreInterface = {}
  public options: BringrCacheOptionsInterface = {
    name: 'myAPI',
    version: '1.0.0'
  }
  public cacheStorageSupported: boolean = false

  /**
   * BringrCache operate CacheStorageAPI by request
   * Could cache a request and operate expired management
   * Internal code, should not use directly
   * @param options
   */
  constructor(options: BringrCacheOptionsInterface) {
    this.options = Object.assign(this.options, options)
    this.store = this.getStore()
    this.ready = false
    this.checkSupport().then(support => {
      this.cacheStorageSupported = support
      this.ready = true
    })
  }

  async getCache(url: string): Promise<Response | Boolean> {
    if (!this.ready) {
      return new Promise(resolve => {
        window.requestAnimationFrame(() => {
          return resolve(this.getCache(url))
        })
      })
    } else {
      let cacheStorage = await caches.open(this.options.name)
      let cachedRequest = await cacheStorage.match(encodeURI(url))
      if (cachedRequest) {
        return this.check(url) && cachedRequest
      }
      return false
    }

  }

  check(url: string): boolean {
    let cacheEntry = this.store[this.options.version][url]
    if (cacheEntry && cacheEntry > Date.now()) {
      return true
    } else if (cacheEntry) {
      this.remove(url).catch()
    }
    return false
  }

  async add(url: string, response: Response, duration: number): Promise<void> {
    try {
      let cacheStorage = await caches.open(this.options.name)
      await cacheStorage.put(encodeURI(url), await response.clone())
      this.store[this.options.version][url] = Date.now() + duration
      this.save()
    } catch (e) {
      //
    }
  }

  async remove(url: string): Promise<void> {
    let cacheStorage = await caches.open(this.options.name)
    await cacheStorage.delete(encodeURI(url))
    delete this.store[this.options.version][url]
    this.save()
  }

  async clear(): Promise<void> {
    await caches.delete(this.options.name)
    this.store = Object.create({})
    this.save()
  }

  getStore(): BringrCacheStoreInterface {

    let store = JSON.parse(localStorage.getItem(this.options.name) || 'false')

    if (!store) {
      store = {}
    }

    if (!store[this.options.version]) {
      store[this.options.version] = {}
    }
    return store
  }

  save(): void {
    let store = JSON.stringify(this.store)
    if (store) {
      localStorage.setItem(this.options.name, store)
    }
  }

  async checkSupport(): Promise<boolean> {
    let isCacheStorageSupported = caches instanceof CacheStorage
    if (isCacheStorageSupported) {
      // try to open cache to ensure the avaibility of the CacheStorage API
      // some security configuration can lead to false support
      // caches exists but are not accessible (privacy configuration)
      await caches.open(this.options.name)
          .catch(() => {
            isCacheStorageSupported = false
          })
    }
    return isCacheStorageSupported
  }
}

export default BringrCache
