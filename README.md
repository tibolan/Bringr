# Bringr

window.fetch wrapper with 
- [cacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) support, 
- [abortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), 
- timeout
- retry
- response transformation

A Bringr request is a basic [window.fetch request](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with additional options

- cacheable: number // duration in ms of the CacheStorage entry
- cancellable: boolean // give the request the power to be aborted
- timeout: number // cancel request if takes too long
- retry: object // retry request for instable API

Furthermore, Bringr is predictive:

- if an error occur or the request fail (http 4xx / 5xx), the promise will be reject
- else the promise will be resolve

# Demo
[https://tibolan.github.io/Bringr/](https://tibolan.github.io/Bringr/)

README to be completed...
