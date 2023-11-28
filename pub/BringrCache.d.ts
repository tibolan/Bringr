import { BringrCacheInterface, BringrCacheStoreInterface, BringrCacheOptionsInterface } from "./types";
declare class BringrCache implements BringrCacheInterface {
    ready: boolean;
    store: BringrCacheStoreInterface;
    options: BringrCacheOptionsInterface;
    cacheStorageSupported: boolean;
    /**
     * BringrCache operate CacheStorageAPI by request
     * Could cache a request and operate expired management
     * Internal code, should not use directly
     * @param options
     */
    constructor(options: BringrCacheOptionsInterface);
    getCache(url: string): Promise<Response | boolean>;
    check(url: string): boolean;
    add(url: string, response: Response, duration: number): Promise<void>;
    remove(url: string): Promise<void>;
    clear(): Promise<void>;
    getStore(): BringrCacheStoreInterface;
    save(): void;
    checkSupport(): Promise<boolean>;
}
export default BringrCache;
