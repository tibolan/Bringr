export type BringrMethodsType =
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'

export type BringrResponseTypeType =
    | 'json'
    | 'form'
    | 'buffer'
    | 'text'
    | 'blob'
    | 'base64'
    | 'auto'

export type BringrQueryStringStrategyType =
    | 'standard'
    | 'duplicate'
    | 'bracket'

/** BRINGR */
export interface BringrOptionsInterface {
  cache: BringrCacheOptionsInterface,
  request: BringrRequestOptionsInterface,
  response: BringrResponseOptionsInterface
}

/** CACHE */
export interface BringrCacheInterface {
  options: BringrCacheOptionsInterface,
  store: BringrCacheStoreInterface
  ready: boolean
}

export interface BringrCacheOptionsInterface {
  name: string
  version: string
}

export interface BringrCacheStoreInterface {
  [key: string]: {
    [key: string]: number
  }
}

/** ABORT */
export interface BringrAbortStoreInterface {
  [key: string]: AbortController
}

export interface BringrAbortTimerInterface {
  [key: string]: number
}

/** REQUEST */
export interface BringrRequestOptionsInterface {
  default: BringrRequestDefaultType,
  basePath: string,
  queryStringStrategy: BringrQueryStringStrategyType
}

export interface BringrRequestRetryInterface {
  max: number,
  delay: number,
  attempt: number,
  condition: any
}

export interface BringrRequestDefaultType {
  url?: string
  method?: BringrMethodsType
  id?: string
  cacheable?: number
  cancellable?: boolean
  timeout?: number
  query?: any
  headers?: any
  signal?: AbortSignal
  ignoreCache?: boolean
  body?: any
  duration?: number
  retry?: BringrRequestRetryInterface
  response?: BringrResponseOptionsInterface
  json?: any
  form?: any
  blob?: any

  [key: string]: any
}

export interface BringrRequestInterface extends BringrRequestDefaultType {
  url: string
  method: BringrMethodsType
  body?: any
  [key: string]: any
}

/** RESPONSE */
export interface BringrResponseOptionsInterface {
  normalize: boolean,
  transform: boolean,
  type: BringrResponseTypeType
}

export interface BringrResponseInterface {
  request?: BringrRequestInterface,
  response?: Response,
  data?: any,
  ok?: boolean,
  status?: number,
  statusText?: string;
  error?: boolean,
  cached?: boolean
  aborted?: boolean,
  timeout?: boolean
  redirected?: boolean
}
