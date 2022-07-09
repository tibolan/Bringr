var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BringrCache {
    /**
     * BringrCache operate CacheStorageAPI by request
     * Could cache a request and operate expired management
     * Internal code, should not use directly
     * @param options
     */
    constructor(options) {
        this.ready = false;
        this.store = {};
        this.options = {
            name: 'BringrCache',
            version: '1.0.0'
        };
        this.cacheStorageSupported = false;
        this.options = Object.assign(this.options, options);
        this.store = this.getStore();
        this.ready = false;
        this.checkSupport().then(support => {
            this.cacheStorageSupported = support;
            this.ready = true;
        });
    }
    getCache(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                return new Promise(resolve => {
                    window.requestAnimationFrame(() => {
                        return resolve(this.getCache(url));
                    });
                });
            }
            else {
                let cacheStorage = yield caches.open(this.options.name);
                let cachedRequest = yield cacheStorage.match(encodeURI(url));
                if (cachedRequest) {
                    return this.check(url) && cachedRequest;
                }
                return false;
            }
        });
    }
    check(url) {
        let cacheEntry = this.store[this.options.version][url];
        if (cacheEntry && cacheEntry > Date.now()) {
            return true;
        }
        else if (cacheEntry) {
            this.remove(url).catch();
        }
        return false;
    }
    add(url, response, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cacheStorage = yield caches.open(this.options.name);
                yield cacheStorage.put(encodeURI(url), yield response.clone());
                this.store[this.options.version][url] = Date.now() + duration;
                this.save();
            }
            catch (e) {
                //
            }
        });
    }
    remove(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheStorage = yield caches.open(this.options.name);
            yield cacheStorage.delete(encodeURI(url));
            delete this.store[this.options.version][url];
            this.save();
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield caches.delete(this.options.name);
            this.store = Object.create({});
            this.save();
        });
    }
    getStore() {
        let store = JSON.parse(localStorage.getItem(this.options.name) || 'false');
        if (!store) {
            store = {};
        }
        if (!store[this.options.version]) {
            store[this.options.version] = {};
        }
        return store;
    }
    save() {
        let store = JSON.stringify(this.store);
        if (store) {
            localStorage.setItem(this.options.name, store);
        }
    }
    checkSupport() {
        return __awaiter(this, void 0, void 0, function* () {
            let isCacheStorageSupported = caches instanceof CacheStorage;
            if (isCacheStorageSupported) {
                // try to open cache to ensure the avaibility of the CacheStorage API
                // some security configuration can lead to false support
                // caches exists but are not accessible (privacy configuration)
                yield caches.open(this.options.name)
                    .catch(() => {
                    isCacheStorageSupported = false;
                });
            }
            return isCacheStorageSupported;
        });
    }
}
export default BringrCache;
//# sourceMappingURL=BringrCache.js.map