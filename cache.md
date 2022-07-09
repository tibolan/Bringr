# Bringr Cache

Bringr integrate the [CacheStorage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage).

```json5
{
  name: 'BringrCache',
  version: '1.0.0'
}
```

## name

**type: `String`, default `BringrCache`**

The name to use for create a cache instance. 

If you have multiple endpoint, you can choose to share or not the same cache.

## version

**type : `String`, default `1.0.0`**

This option can be useful to bust your cache when you upgrade your application.
