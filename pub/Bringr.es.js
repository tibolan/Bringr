class d {
  /**
   * BringrAbort operate AbortController by request
   * Could cancel a request to prevent repeated call
   * Could operate timeout on Request
   * Internal code, should not use directly
   */
  constructor() {
    this.timers = {}, this.store = {};
  }
  register(t) {
    const e = new AbortController();
    t.signal = e.signal, this.store[t.url] = e;
  }
  abort(t) {
    let e = this.store[t.url];
    e && e.abort(), this.clear(t);
  }
  abortAfter(t, e) {
    this.register(t), this.timers[t.url] = setTimeout(() => {
      this.abort(t);
    }, e);
  }
  clear(t) {
    clearTimeout(this.timers[t.url]), delete this.timers[t.url], delete this.store[t.url];
  }
}
class b {
  /**
   * BringrCache operate CacheStorageAPI by request
   * Could cache a request and operate expired management
   * Internal code, should not use directly
   * @param options
   */
  constructor(t) {
    this.ready = !1, this.store = {}, this.options = {
      name: "BringrCache",
      version: "1.0.0"
    }, this.cacheStorageSupported = !1, this.options = Object.assign(this.options, t), this.store = this.getStore(), this.ready = !1, this.checkSupport().then((e) => {
      this.cacheStorageSupported = e, this.ready = !0;
    });
  }
  async getCache(t) {
    if (this.ready) {
      const s = await (await caches.open(this.options.name)).match(encodeURI(t));
      return s ? this.check(t) && s : !1;
    } else
      return new Promise((e) => {
        window.requestAnimationFrame(() => e(this.getCache(t)));
      });
  }
  check(t) {
    const e = this.store[this.options.version][t];
    return e && e > Date.now() ? !0 : (e && this.remove(t).catch(), !1);
  }
  async add(t, e, s) {
    try {
      await (await caches.open(this.options.name)).put(encodeURI(t), await e.clone()), this.store[this.options.version][t] = Date.now() + s, this.save();
    } catch {
    }
  }
  async remove(t) {
    await (await caches.open(this.options.name)).delete(encodeURI(t)), delete this.store[this.options.version][t], this.save();
  }
  async clear() {
    await caches.delete(this.options.name), this.store = /* @__PURE__ */ Object.create({}), this.save();
  }
  getStore() {
    let t = JSON.parse(localStorage.getItem(this.options.name) || "false");
    return t || (t = {}), t[this.options.version] || (t[this.options.version] = {}), t;
  }
  save() {
    const t = JSON.stringify(this.store);
    t && localStorage.setItem(this.options.name, t);
  }
  async checkSupport() {
    let t = caches instanceof CacheStorage;
    return t && await caches.open(this.options.name).catch(() => {
      t = !1;
    }), t;
  }
}
function m(i) {
  return i && typeof i == "object" && !Array.isArray(i) && i !== null;
}
function f(i, ...t) {
  if (!t.length)
    return i;
  const e = t.shift();
  if (m(i) && m(e))
    for (const s in e)
      m(e[s]) ? (i[s] || Object.assign(i, { [s]: {} }), f(i[s], e[s])) : Object.assign(i, { [s]: e[s] });
  return f(i, ...t);
}
async function w(i = 1e3) {
  return await new Promise((t) => {
    setTimeout(() => {
      t(!0);
    }, i);
  });
}
const g = {
  ms: 1,
  s: 1e3,
  m: 1e3 * 60,
  h: 1e3 * 60 * 60,
  d: 1e3 * 60 * 60 * 24
}, p = (i) => typeof i != "string" ? Number(i) : (i = i.replace(/\s/g, ""), i = i.replace(/([a-z])(\d)/gi, (t, e, s) => `${e} ${s}`), i.split(" ").reduce((t, e) => t + E(e), 0)), E = (i) => {
  i = i.replace(/\D+/, (s) => ` ${s}`);
  const [t, e] = i.split(" ");
  return (g[e] || 0) * Number(t);
};
class A {
  /**
   * BringrRequest build a valid Request
   * Advanced query build options and a retry management
   * Internal code, should not use directly
   * @param request
   * @param config
   */
  constructor(t, e) {
    this.url = "", this.cacheable = 0, this.cancellable = !1, this.duration = 0, this.startAt = 0, this.endAt = 0, this.headers = {}, this.ignoreCache = !1, this.method = "GET", this.retry = {
      max: 0,
      delay: 0,
      condition: [408, 504, 598, 599, "BringrTimeoutError"],
      attempt: 0
    }, this.timeout = 0, this.buildBody(t), f(this, e.default, t), this.buildURI(e.basePath, t, e.queryStringStrategy);
  }
  buildURI(t, e, s) {
    var r;
    let a = `${t}${e.url}`;
    t && ((r = e.url) != null && r.match(t)) && (a = e.url), this.startAt = performance.now();
    try {
      const o = new URL(a);
      this.processQuery(o, s), this.url = o.toString();
    } catch (o) {
      throw o;
    }
  }
  processQuery(t, e) {
    const s = t.toString().split("?")[1];
    if (s) {
      const a = s.split("&"), r = {};
      for (const o of a) {
        let [n, h] = o.split("=");
        /,/.test(h) && (h = h.split(",")), r[n] && !Array.isArray(r[n]) && (r[n] = [r[n]]), Array.isArray(r[n]) ? r[n].push(h) : r[n] = h;
      }
      for (const o in r)
        r[o] && t.searchParams.delete(o);
      this.query = f({}, r, this.query);
    }
    if (this.query) {
      for (const a in this.query)
        a in this.query && t.searchParams.append(a, this.query[a]);
      if (["duplicate", "bracket"].includes(e)) {
        for (const a in this.query)
          if (Array.isArray(this.query[a])) {
            t.searchParams.delete(a);
            for (const r of this.query[a])
              e === "duplicate" ? t.searchParams.append(a, r) : e === "bracket" && t.searchParams.append(`${a}[]`, r);
          }
      }
    }
  }
  buildBody(t) {
    if (t.method && ["GET", "HEAD"].includes(t.method))
      return !1;
    if (t.json)
      try {
        this.body = JSON.stringify(t.json), this.headers["Content-Type"] || (this.headers["Content-Type"] = "application/json"), delete t.json;
      } catch (e) {
        throw e;
      }
    else if (t.form)
      try {
        const e = new FormData();
        for (const s in t.form)
          s in t.d && e.append(s, t.form[s]);
        this.body = e, delete t.form;
      } catch (e) {
        throw e;
      }
    else if (t.blob)
      try {
        this.body = t.blob, delete t.blob;
      } catch (e) {
        throw e;
      }
  }
  async checkRetry(t, e) {
    try {
      return this.retry.max > this.retry.attempt && this.checkCondition(this.retry.condition, t, e) ? (this.retry.attempt++, this.retry.delay && await w(p(this.retry.delay)), !0) : !1;
    } catch {
      return !1;
    }
  }
  checkCondition(t, e, s) {
    let a = !1;
    switch (!0) {
      case typeof t == "boolean": {
        a = t;
        break;
      }
      case typeof t == "function": {
        a = t(e, s);
        break;
      }
      case (typeof t == "string" && !!Object.keys(e.error).length): {
        a = t === e.error.name;
        break;
      }
      case typeof t == "number": {
        a = t === e.status;
        break;
      }
      case Array.isArray(t): {
        a = t.some((r) => this.checkCondition(r, e, s));
        break;
      }
    }
    return a;
  }
}
class T extends Error {
  constructor(t = "", e = {}) {
    super(t, e), this.message = t, this.name = "BringrTimeoutError";
  }
}
class j extends Error {
  constructor(t, e = {}) {
    super(t, e), this.message = `${t}`, this.name = "BringrConnectionError";
  }
}
class v extends Error {
  constructor(t, e = {}) {
    super(t, e), this.message = `${t}`, this.name = "BringrError";
  }
}
class u {
  /**
   * BringrResponse transform response into usable data
   * Could normalize response to a predictive and exhaustive format
   * Could automatically transform your response based on mime type
   * Supply text, json, blob, arrayBuffer, formData, and even base64 output
   * Could manage fetch duration
   * Internal code, should not use directly
   * @param options
   */
  constructor(t) {
    this.options = {
      normalize: !0,
      transform: !0,
      type: "auto",
      blobAsBase64: !1
    }, this.options = f(this.options, t);
  }
  static setDuration(t) {
    const e = t.endAt || performance.now(), s = t.startAt || e;
    return delete t.startAt, delete t.endAt, Number((e - s).toFixed(0));
  }
  async build(t, e, s, a = !1) {
    const r = {
      cached: a,
      request: e
    }, o = e.response && e.response.normalize !== void 0 ? e.response.normalize : this.options.normalize, n = e.response && e.response.transform !== void 0 ? e.response.transform : this.options.transform, h = e.response && e.response.type !== void 0 ? e.response.type : this.options.type;
    if (s && s instanceof Error)
      return e.duration = u.setDuration(e), (navigator.onLine !== void 0 ? navigator.onLine : !0) ? s.name === "TypeError" ? s = new v(s.message) : s.name === "AbortError" && e.timeout && e.duration >= e.timeout ? (s = new T("request aborted by timeout", {
        cause: s
      }), Object.assign(r, {
        timeout: !0
      })) : s.name === "AbortError" && Object.assign(r, {
        aborted: !0
      }) : s = new j("No connection available"), o ? (t && Object.assign(r, {
        response: t
      }), Object.assign(r, {
        error: {
          name: s.name,
          message: s.message
        },
        data: null
      })) : s;
    {
      const c = s && s.ok === !1 ? s : t;
      let l = !1;
      if (n)
        try {
          l = await this[h](c.clone());
        } catch (y) {
          l = y;
        }
      return o ? (Object.assign(r, {
        response: c,
        redirected: c.redirected,
        status: c.status,
        statusText: c.statusText
      }), c.ok || Object.assign(r, {
        error: {
          name: s.status,
          message: s.statusText
        }
      }), l instanceof Error ? Object.assign(r, {
        data: {
          name: l.name,
          message: l.message
        },
        transformError: !0
      }) : Object.assign(r, {
        data: l || c
      }), e.duration = u.setDuration(e), r) : l || c;
    }
  }
  async json(t) {
    return await t.json();
  }
  async form(t) {
    return await t.formData();
  }
  async buffer(t) {
    return await t.arrayBuffer();
  }
  async blob(t) {
    return await t.blob();
  }
  async base64(t) {
    const e = await this.blob(t);
    return await new Promise(async (s, a) => {
      try {
        const r = await new FileReader();
        r.onloadend = () => {
          s(r.result);
        }, r.onerror = (o) => {
          a(o);
        }, r.onabort = (o) => {
          a(o);
        }, r.readAsDataURL(e);
      } catch (r) {
        s(r);
      }
    });
  }
  async text(t) {
    return await t.text();
  }
  async auto(t) {
    const e = t.headers.get("content-type");
    if (e) {
      if (/^text/.test(e))
        return await this.text(t);
      if (/json/.test(e))
        return await this.json(t);
      if (e === "multipart/form-data")
        return await this.form(t);
      if (e === "application/octet-stream")
        return await this.buffer(t);
      if (/^image/.test(e) || /^video/.test(e) || /^audio/.test(e) || /^font/.test(e))
        return this.options.blobAsBase64 ? await this.base64(t) : await this.blob(t);
    } else
      return await this.autoBrutForce(t);
    return await this.autoBrutForce(t);
  }
  async autoBrutForce(t) {
    const e = ["json", "form", "text"];
    for (const s of e) {
      const a = t.clone();
      try {
        return await this[s](a);
      } catch {
      }
    }
    return t;
  }
}
class S {
  constructor(t) {
    this.config = {
      cache: {
        name: "BringrCache",
        version: "1.0.0"
      },
      request: {
        default: {
          cacheable: 0,
          cancellable: !1,
          timeout: 0,
          retry: {
            max: 1,
            delay: 1e3,
            attempt: 0,
            condition: [408, 504, 598, 599, "BringrTimeoutError"]
          }
        },
        basePath: "",
        queryStringStrategy: "standard"
      },
      response: {
        normalize: !0,
        transform: !0,
        type: "auto",
        blobAsBase64: !1
      }
    }, this.loading = !1, this.config = f(this.config, t), this.cache = new b(this.config.cache), this.aborter = new d(), this.response = new u(this.config.response);
  }
  async fetch(t, e) {
    if (this.loading = !0, this.cache.ready) {
      let s;
      try {
        e.method = t, s = new A(e, this.config.request);
      } catch (a) {
        return this.loading = !1, Promise.reject(await this.response.build(null, e, a));
      }
      if (s.cancellable && (this.aborter.abort(s), this.aborter.register(s)), this.cache.cacheStorageSupported && s.cacheable && !s.ignoreCache) {
        const a = await this.cache.getCache(s.url);
        if (a)
          return this.loading = !1, await this.response.build(a, s, null, !0);
      }
      if (s.timeout) {
        const a = Number(s.timeout);
        this.aborter.abortAfter(s, a);
      }
      try {
        const a = await window.fetch(s.url, s);
        if (s.timeout && this.aborter.clear(s), a.ok && s.cacheable && await this.cache.add(s.url, a, p(s.cacheable)), a.ok)
          return await this.response.build(a, s);
        throw a;
      } catch (a) {
        const r = await this.response.build(null, s, a);
        return await s.checkRetry(r, s) ? await this.fetch(t, s) : Promise.reject(r);
      } finally {
        this.loading = !1;
      }
    } else
      return new Promise((s) => {
        window.requestAnimationFrame(() => s(this.fetch(t, e)));
      });
  }
  async GET(t) {
    return typeof t == "string" && (t = {
      url: t
    }), await this.fetch("GET", t);
  }
  async DELETE(t) {
    return typeof t == "string" && (t = {
      url: t
    }), await this.fetch("DELETE", t);
  }
  async HEAD(t) {
    return await this.fetch("HEAD", t);
  }
  async POST(t) {
    return await this.fetch("POST", t);
  }
  async PUT(t) {
    return await this.fetch("PUT", t);
  }
  async PATCH(t) {
    return await this.fetch("PATCH", t);
  }
  async abortRequest(t) {
    this.aborter.abort(t);
  }
  async deleteCache(t) {
    await this.cache.remove(t.url);
  }
  async clearCache(t) {
    await this.cache.clear();
  }
}
export {
  S as default
};
