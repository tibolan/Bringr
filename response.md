# Bringr Response

```json5
{
    normalize: true,
    transform: true,
    type: 'auto',
    blobAsBase64: false
  }
```

## normalize
**type: `Boolean`, default `true`**  

When set to `true`, request will be resolve in a standarize object, that containing all the data of your request.This mode give you all the sugar and the information that make Bringr a cool package to use.

When set to `false`, request will be resolve with the raw data received from the API.

## transform
**type : `Boolean`, default `true`**

In javascript the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object have [methods](https://developer.mozilla.org/en-US/docs/Web/API/Response#methods) to process the representation of the response body.

When set to true, response will be processed by using the option `type` (see below).

When set to false, response will not be processed. You have to do the job.

## type
**type: `BringrResponseTypeType`, default `'auto'`**
```typescript
export type BringrResponseTypeType =
    | 'json'
    | 'form'
    | 'buffer'
    | 'text'
    | 'blob'
    | 'auto'
```
When set to `'auto'`, Bringr will guess the type by reading the `'content-type'` header in the response.

If you need to have the control, you can specify it in your request:
```javascript
myApi.GET({
  url: "https://mock-bringr-demo.herokuapp.com/ressource/json",
  response: {
    type: "blob"
  }
})
```

## blobAsBase64
**type : `Boolean`, default `false`**

When set to `true`, the blob will be processed as a base64 string, using `FileReader.readAsDataURL` method.
