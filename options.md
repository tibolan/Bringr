# Options

## Default Options

```json5
{
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
}
```
