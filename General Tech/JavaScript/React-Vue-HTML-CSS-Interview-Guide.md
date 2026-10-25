# React, Vue, React Native, HTML5 & CSS3 — Complete Staff Frontend Interview Guide

---

## 1. React Core Architecture, Virtual DOM & Reconciliation

- **What React Is**: A declarative, component-based JavaScript UI library (open-sourced by Facebook/Meta in **March 2013**). Unlike monolithic MVC frameworks, React focuses on the View layer using **unidirectional data flow** (`UI = f(state)`).
- **Why Traditional MVC Struggled at Frontend Scale**: Bidirectional data binding between Models and Views created cascading update loops, unpredictable state mutations, and expensive direct DOM manipulation.
- **Drawbacks / Trade-offs of React**: It is a UI library (not a full batteries-included framework unless paired with Next.js/Remix), requires build tooling (Babel/SWC/Vite/Webpack) for JSX, and integrating it incrementally into legacy server-rendered MVC apps (e.g., Rails/JSP) requires careful state/hydration boundaries.

### React vs Angular vs Vue (X vs Y)

| Dimension | **React** | **Vue (Vue 3)** | **Angular** |
| --- | --- | --- | --- |
| **Type** | UI Library (ecosystem-driven) | Progressive Framework | Full Opinionated Framework |
| **Rendering / Reactivity** | Virtual DOM + Fiber explicit immutability (`useState`) | Virtual DOM + **Fine-grained ES6 `Proxy` reactivity** (`ref`/`reactive`) | Incremental DOM / Signals + Zone.js change detection |
| **Templating** | **JSX / TSX** (full JavaScript expressiveness) | Single-File Components (`.vue` HTML templates) or JSX | HTML templates with structural directives (`*ngIf`, `*ngFor`) |
| **Data Binding** | **One-way** (downward props, upward event callbacks) | One-way props + syntactic **Two-way `v-model`** | One-way + Two-way `[(ngModel)]` |

### Real DOM vs Virtual DOM & React Fiber Reconciliation

| Attribute | **Real DOM** | **Virtual DOM (React Fiber)** |
| --- | --- | --- |
| **Update mechanism** | Directly mutates browser layout tree; triggers synchronous reflow/repaint | Computes diff between previous and next lightweight JS object trees in memory, batching minimal DOM mutations |
| **Diffing complexity** | Finding the optimal edit sequence between arbitrary trees is expensive; direct DOM writes are not inherently O(N³) | React's heuristic reconciliation is typically linear in the elements visited: different `type` replaces a subtree; stable `key` matches siblings |
| **Interruptibility (Fiber)** | Synchronous — blocks main thread | **Render Phase** (pure, asynchronous, interruptible time-slicing) vs **Commit Phase** (synchronous DOM mutation) |

### JSX Internals, Elements vs Components & Event Binding

- **How browsers read JSX**: Browsers cannot execute JSX directly. A compiler (**Babel**, **SWC**, or **esbuild**) transforms `<Button color="blue">Click</Button>` into `_jsx(Button, { color: 'blue', children: 'Click' })` (or `React.createElement`).
- **Why Component names in JSX must start with a Capital Letter**: Lowercase tags (`<div />`) compile as string literals (`_jsx('div', ...)` → built-in HTML element), whereas capitalized tags (`<MyCard />`) compile as variable references (`_jsx(MyCard, ...)`).
- **Why `className` and `htmlFor` instead of `class` and `for`**: JSX compiles to JavaScript objects targeting DOM properties (`HTMLElement.className`, `HTMLLabelElement.htmlFor`), and historically `class`/`for` were reserved JS keywords.
- **React Element vs Component**:
  - **Element**: An immutable plain JS object `{ type, props, key }` describing what should appear on screen.
  - **Component**: A function or class that accepts `props` and returns React Elements.
- **Fragments (`<>...</>` or `<React.Fragment key={...}>`)**: Group multiple sibling elements without injecting an extra wrapper `<div>` into the DOM.
- **SyntheticEvents**: React's cross-browser wrapper around native browser events normalizing `.stopPropagation()` and `.preventDefault()`. Since **React 17+**, React attaches a single delegated event listener per event type at the **root DOM container (`#root`)** rather than `document`.
- **3 Ways to Bind Events in Class Components**:
  1. **Class field arrow function (`handleClick = () => {}`)** — cleanest; lexically binds `this` once per instance.
  2. **Bind in `constructor` (`this.handleClick = this.handleClick.bind(this)`)** — binds once on prototype method.
  3. **Inline arrow in `render()` (`onClick={() => this.handleClick()}`)** — creates a new function reference per render; optimize only if profiling shows memoized children rerender unnecessarily.

---

## 2. React Components, Lifecycle, Hooks & State Management

### Function Components vs Class Components

| Aspect | **Function Component (+ Hooks)** | **Class Component** |
| --- | --- | --- |
| **State & Lifecycle** | `useState`, `useReducer`, `useEffect` | `this.state`, `this.setState()`, lifecycle methods |
| **`this` binding bugs** | None (closures over props/state) | Requires manual `.bind(this)` or arrow properties |
| **Logic reuse** | **Custom Hooks (`useAuth`, `useFetch`)** — zero wrapper hell | Higher-Order Components (HOCs) or Render Props |
| **When Class is still required** | Standard for 99.9% of modern React | **Error Boundaries (`getDerivedStateFromError` / `componentDidCatch`)** — no Hook equivalent yet |

### Lifecycle Mapping (Class vs Hooks)

| Lifecycle Phase | Class Component Method | Functional Hook Equivalent |
| --- | --- | --- |
| **Mounting** (attaching to DOM) | `constructor` → `render` → `componentDidMount` | `useEffect(() => { /* mount */ }, [])` |
| **Updating** (state/props change) | `shouldComponentUpdate` → `render` → `componentDidUpdate` | `useEffect(() => { /* run on dep change */ }, [dep])` + `React.memo` |
| **Unmounting** (detaching from DOM) | `componentWillUnmount` | `useEffect(() => { return () => { /* cleanup */ }; }, [])` |
| **Error Handling** | `static getDerivedStateFromError(err)` + `componentDidCatch(err, info)` | Wrap subtree in `<ErrorBoundary fallback={<ErrorUI />}>` |

### Essential React Hooks & Patterns Matrix

| Concept / Hook | Interview Explanation & Trap to Avoid |
| --- | --- |
| **Props vs State** | **Props** are read-only (immutable) inputs passed from parent to child; **State** is private, mutable data managed inside the component across renders via `useState`/`useReducer`. |
| **Why avoid mutating state directly?** | Mutating an object and passing the same reference to a Hook setter may bail out via `Object.is`; direct class-state mutation bypasses `setState`. Return a new value (`setState(prev => ({ ...prev, count: prev.count + 1 }))`). |
| **`setState` Callback / Batching** | State updates are **asynchronous and batched** (in React 18+, automatic batching applies across `setTimeout`, Promises, and native events). Class `setState(updater, callback)` runs `callback` after commit; in Hooks, use `useEffect([state])`. |
| **`useMemo` vs `useCallback`** | `useMemo(() => compute(a, b), [a, b])` caches a **computed value**; `useCallback(fn, [deps])` caches a **function reference** so memoized children (`React.memo`) or effect dependencies don't re-trigger unnecessarily. |
| **`useRef`** | Mutable container (`{ current }`) that persists across renders **without triggering a re-render when mutated** — used for imperative DOM access (`inputRef.current.focus()`) and storing timer IDs or latest callbacks. |
| **Controlled vs Uncontrolled** | **Controlled**: form value driven by React state (`value={val} onChange={...}`); **Uncontrolled**: form value lives in the DOM node and is read via `ref.current.value` or `new FormData(e.currentTarget)`. |
| **`PureComponent` / `React.memo`** | Skips re-rendering when a **shallow comparison** of `props` (and `state` for `PureComponent`) shows no change. |
| **Higher-Order Component (HOC)** | A function `withAuth(WrappedComponent)` that takes a component and returns an enhanced component (largely superseded by Custom Hooks, still used for cross-cutting UI wrappers). |
| **Keys in Lists (`key={item.id}`)** | Gives each element a stable identity during reconciliation. **Never use array `index` as `key`** if the list can reorder, filter, or insert — sibling state and input focus will attach to the wrong item! |
| **Portals (`createPortal(child, domNode)`)** | Renders a child into a DOM node outside the parent DOM hierarchy (e.g., `document.body`) so modals/tooltips escape parent `overflow: hidden` or `z-index` stacking contexts while **still bubbling React SyntheticEvents** up the React tree! |
| **`StrictMode`** | In development, React may rerun render and an extra effect setup/cleanup cycle to surface impure rendering and missing cleanup; exact effect behavior depends on root placement and version. No extra production cycle. |
| **Prop Drilling Solutions** | (1) **Component Composition** (pass `<UserAvatar user={user} />` as `children` or a slot prop so intermediate layout components don't even know `user` exists), or (2) **Context API (`useContext`)** / Zustand / Redux. |
| **Preventing API Re-Fetch on Remount** | Component-local `useState` + `useEffect` wipes state when unmounted. To prevent re-fetching when remounted: cache server state outside the component lifecycle using **TanStack Query (React Query) / SWR** (`staleTime`), a module-level single-flight cache, or lift state to a persistent ancestor/store. |
| **Force Re-render without `setState`** | Class components have `this.forceUpdate()`; in Function components, increment a dummy reducer `const [, forceRender] = useReducer(x => x + 1, 0)` (rarely needed outside external store subscriptions — prefer `useSyncExternalStore`). |
| **Prop Validation (`PropTypes` vs TypeScript)** | `MyComp.propTypes = { count: PropTypes.number.isRequired, items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })) }` gives **runtime** dev-mode warnings (still useful for JS-only libs consumed externally); TypeScript interfaces give **compile-time** safety — the production default. |
| **React Router (`react-router-dom`)** | Client-side routing: `<BrowserRouter>` (History API) vs `<HashRouter>` (legacy/no server config); `<Routes><Route path="/u/:id" element={<User />}/></Routes>`, `useNavigate()`/`useParams()`/`useSearchParams()`/`NavLink` (active styling), nested `<Outlet />` layouts, lazy `React.lazy` route code-splitting; **SPA caveat**: deep links need a server fallback (`/*` → `index.html`) so `GET /u/5` doesn't 404. |
| **`render()` Purpose & Calling Functions in Render** | `render()` (class) / the function body (FC) must stay **pure** — it maps `props+state → element tree`; calling a function in JSX like `onClick={handleClick}` passes a reference, while `onClick={handleClick()}` **invokes it during render** (common bug — use `onClick={() => handleClick(id)}` only when passing args). |

### React 18+ Concurrent Features, Race-Safe `useEffect` & Hydration Mismatches

- **`useTransition` vs `useDeferredValue`**: Both let React prioritize urgent updates over expensive rendering; neither guarantees 60 fps or moves work to a background thread. Keep the controlled input state urgent, transition an expensive derived update; defer a value when you do not control its setter.
- **React Server Components (RSC) vs SSR**: **RSCs** execute *exclusively* on the server, can directly `await db.query()`, and ship **zero kilobytes of component JS to the client bundle** (streaming serialized UI trees); **SSR** renders Client Components to HTML on the server for fast FCP, then downloads and **hydrates** their JS bundle in the browser.
- **Hydration Mismatch Causes & Fixes**: Happens when server-rendered HTML differs from the client's first render (`new Date()`, `Math.random()`, reading `window`/`localStorage` during render, or invalid HTML nesting like `<div>` inside `<p>`). Fix: move browser-only reads into `useEffect` or gate with `suppressHydrationWarning` on timestamps.
- **Race-Condition-Safe `useEffect` Data Fetching**: If `userId` changes from `1` to `2` while request `1` is slow, request `1` can resolve *after* request `2` and overwrite the UI with stale data. Always abort stale requests in the cleanup function:

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((err) => { if (err.name !== 'AbortError') setError(err); });
  return () => controller.abort();
}, [userId]);
```

---

## 3. Flux vs Redux & Modern State Management

```text
Unidirectional Flow:  View ──dispatches──▶ Action ──▶ (Middleware: Thunk/Saga) ──▶ Pure Reducer(prevState, action) ──▶ Store (Single State Tree) ──notifies──▶ View
```

| Dimension | **Flux (Architecture Pattern)** | **Redux (Library / Toolkit)** |
| --- | --- | --- |
| **Stores** | **Multiple Stores** (one per domain) | **Single Store** (single source of truth tree combined via `combineReducers`) |
| **Dispatcher** | Explicit central **Dispatcher** broadcasting actions to stores | **No Dispatcher** — `store.dispatch(action)` pipes directly through Middleware into pure Reducers |
| **State Mutation** | Stores hold and mutate state internally | **State is read-only / immutable** — Reducers are pure functions `(state, action) => newState` (Redux Toolkit uses **Immer** under the hood for safe draft syntax) |
| **Async Side Effects** | Handled inside Action Creators / Stores | Handled via **Middleware** (`redux-thunk`, `redux-saga`, or **RTK Query**) |

- **7 Key Advantages of Redux**: (1) Predictable state transitions (pure reducers), (2) Maintainable strict structure, (3) Trivial **Server-Side Rendering (SSR)** hydration (`preloadedState`), (4) Time-travel debugging with Redux DevTools, (5) Trivial unit testing of pure reducer functions, (6) Rich middleware ecosystem, (7) Clear separation of state from UI tree.

---

## 4. React Native Deep Dive

| Topic | Staff-Level React Native Answer |
| --- | --- |
| **Threading Model (3 Main Threads)** | 1. **UI (Main) Thread**: Native iOS/Android thread rendering native views. 2. **JavaScript Thread**: Executes React business logic, API calls, and reconciliation. 3. **Shadow Thread (Yoga)**: Calculates Flexbox layout in C++ and sends layout frames to the UI thread (plus native module background threads). |
| **New Architecture: Hermes + JSI + Fabric** | **Hermes** compiles JS to bytecode ahead-of-time (AOT) during build for fast cold-start and lower RAM. **JSI (JavaScript Interface)** lets JS hold direct C++ host object references (replacing the slow, asynchronous JSON-serialized Bridge). **Fabric** is the new synchronous C++ renderer, and **TurboModules** lazy-load native modules on demand. |
| **`ScrollView` vs `FlatList`** | `ScrollView` renders all children, becoming costly for large datasets (no universal 30-item limit). `FlatList` virtualizes around a configurable window; tune `windowSize`, `initialNumToRender`, `keyExtractor`, and `getItemLayout` where heights are known. |
| **Storing Data vs Sensitive Data** | Non-sensitive data uses `AsyncStorage` or **MMKV** (synchronous C++ key-value store, ~30× faster). **Sensitive data (JWTs, refresh tokens, PII, keys) must NEVER be stored in `AsyncStorage`** (unencrypted SQLite/plist on disk!) — always use **`react-native-keychain`** or **`expo-secure-store`** backed by **iOS Keychain Services** and **Android Keystore (Hardware-backed AES)**. |
| **Navigation, Bundler & Native Deps** | Routing uses **React Navigation** (`NativeStackNavigator` uses native `UINavigationController`/`Fragment` vs JS-based `StackNavigator`). Bundling uses **Metro** (optimized for fast refresh & platform extensions `.ios.tsx`/`.android.tsx`). iOS native C/Obj-C/Swift dependencies are managed via **CocoaPods (`Podfile` / `pod install`)**. |
| **Inline Styles vs `StyleSheet.create`** | Define reusable static styles at module scope with `StyleSheet.create`. Inline dynamic styles are valid; avoid large per-render style objects when profiling reveals a cost. It does not guarantee immutable references or a bridge optimization. |
| **HTTP Client (`fetch` vs `axios`) & Native Libraries** | `axios` auto-parses JSON, rejects on non-2xx, and supports request/response **interceptors** (JWT attach, retry, logging) — common in RN where `fetch` lacks upload progress; community native modules like `react-native-camera`/`react-native-maps` expose platform APIs; **custom native modules** are written in Swift/Kotlin exposed through TurboModules/JSI (old Bridge) so JS calls native code and vice versa via event emitters/callbacks. |
| **Calling REST APIs in RN** | Same `fetch`/`axios` + `useEffect`/`TanStack Query` patterns as web React, plus RN specifics: certificate pinning for sensitive APIs, `NetInfo` offline detection + retry queues, and Keychain-stored token attach — never hardcode API keys (they're extractable from the JS bundle). |

---

## 5. Vue.js Complete Interview Guide (Vue 2 vs Vue 3)

### Reactivity Internals: How Vue Tracks Changes

- **Vue 2 (`Object.defineProperty`)**: Walked every object property recursively at initialization, converting them into getter/setter pairs. *Limitations*: Could not detect adding/deleting object properties without `Vue.set()`/`Vue.delete()`, nor direct array index mutation (`arr[0] = val`).
- **Vue 3 (ES6 `Proxy` + `Reflect`)**: Wraps objects in a lazy **ES6 `Proxy`** (`reactive()`) and primitives in a getter/setter wrapper (`ref()`). Tracks property reads (`track()`), intercepts mutations/additions/deletions/array operations natively (`trigger()`), and only proxies nested objects lazily when accessed!

### Vue Directives, Lifecycle & Data Handling Matrix

| Question / Concept | Staff-Level Vue Answer |
| --- | --- |
| **`v-if` vs `v-show`** | **`v-if`** is "real" conditional rendering — lazily mounts and destroys DOM nodes + child component lifecycles (higher toggle cost, zero initial cost if `false`). **`v-show`** always renders the element into the DOM and only toggles CSS `display: none` (higher initial cost, cheap frequent toggles). |
| **Why NEVER use `v-if` and `v-for` on the same element?** | In Vue 2, `v-for` had higher precedence (ran the `v-if` check on every loop iteration even when the whole list was hidden); in Vue 3, `v-if` has higher precedence (so `v-if` cannot access the `v-for` loop variable, throwing a ReferenceError!). **Fix**: Wrap `<template v-for>` around `<li v-if>`, or filter the array first in a **`computed` property**. |
| **Types of Directives** | Built-in (`v-bind`/`:`, `v-on`/`@`, `v-model`, `v-if`/`v-else`, `v-show`, `v-for`, `v-slot`/`#`, `v-once`, `v-memo`), Literal/Empty (`v-cloak`, `v-pre`), and **Custom Directives** (`app.directive('focus', { mounted(el) { el.focus(); } })`). |
| **`computed` Properties vs `methods`** | **`computed`** properties are **cached based on their reactive dependencies** and only re-evaluate when a tracked dependency changes. **`methods`** execute on **every single re-render** whenever invoked in a template. |
| **One-Way (`v-bind`) vs Two-Way (`v-model`) Binding** | Props follow strict **one-way downward binding** (`:prop="val"`). `v-model` is syntactic sugar over one-way prop + upward event: `<input :modelValue="text" @update:modelValue="val => text = val" />`. |
| **Vue Instance Lifecycle** | `setup()` → `beforeCreate` → `created` (reactive data ready, no DOM yet) → `beforeMount` → `mounted` (`onMounted` — DOM ready, make client API calls or attach 3rd-party DOM libs) → `beforeUpdate` → `updated` → `beforeUnmount` (`beforeDestroy` in Vue 2) → `unmounted` (`onUnmounted` — clear timers/listeners). |
| **Mixins vs Vue 3 Composables** | **Mixins** share component options across components but suffer from **naming collisions, unclear property origin, and implicit cross-mixin coupling**. Vue 3 **Composables (`useFeature()`)** replace Mixins with explicit function imports and clear reactive return values. |
| **Parent/Child Access, `ref`, `key`, Filters, Async Components, Vuex/Pinia** | Avoid `this.$parent` (tightly couples child to parent tree); use `props`/`emit` or `provide`/`inject`. `ref` accesses DOM nodes or holds reactive values (`ref(0).value`). `key` gives VNodes identity in `v-for`. **Filters (`{{ date \| format }}`)** were removed in Vue 3 (use `computed` or helper functions). **Async Components (`defineAsyncComponent(() => import('./Modal.vue'))`)** code-split heavy UI chunks. **Pinia** (modern successor to **Vuex**) provides modular, TypeScript-native stores without Vuex `mutations` boilerplate. |
| **Vue Router & Calling REST APIs** | `createRouter({ history: createWebHistory(), routes })` gives `<router-link>`/`<router-view>`, `useRoute()`/`useRouter()`, navigation guards (`beforeEach` auth checks), and lazy route chunks; API calls run in `onMounted`/`watch` with `fetch`/`axios` or a reactive composable (`useFetch` from VueUse) — keep fetch logic in composables, not components. |
| **What is Vue & Its Advantages** | A **progressive** framework — adopt incrementally from a single `<script>` tag widget up to a full SPA; gentle learning curve (HTML templates), built-in reactivity without immutability discipline, SFC colocation of template+script+style, smaller bundle than Angular, official ecosystem (Router/Pinia/Nuxt). |

---

## 6. HTML5, DOM, SEO, Accessibility (A11y) & Web Performance

### HTML5 Structure, DOM & Browser APIs

| Topic | Key Details |
| --- | --- |
| **`<!DOCTYPE html>` Importance** | Instructs the browser to render the document in **Standards Mode** (HTML5 spec). Omitting it triggers **Quirks Mode** (emulating buggy 1990s IE5/Navigator box model and layout quirks). |
| **HTML vs XHTML & HTML5 Features** | **XHTML** was HTML reformulated as strict XML (fatal parser errors on unclosed tags or lowercase/uppercase mismatches). **HTML5** introduced semantic landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`), native media (`<audio>`, `<video>`), graphics (`<canvas>`, `<svg>`), rich form inputs (`date`, `email`, `range`), and Web Storage/Workers/History/Geolocation APIs. |
| **`<span>` vs `<div>` & Links** | `<div>` is a block-level container (starts on a new line, takes full width); `<span>` is an inline container for phrasing content. Links: `<img src="..." alt="...">` embeds an image; `<a href="https://...">` navigates; `<a href="mailto:user@example.com">` opens mail client. |
| **`data-*` Attributes & Templating** | Custom attributes (`data-user-id="42"`) store private metadata on DOM elements, read in JS via `el.dataset.userId`. Server/client templating engines (**Handlebars, Mustache, Pug/Jade, EJS**) interpolate data into HTML templates and escape variables by default (`{{name}}`) to prevent XSS. |
| **DOM Manipulation & Event Phases** | Select via `getElementById` / `querySelector` / `querySelectorAll`. Mutate via `document.createElement`, `el.textContent` (safe — never parses HTML, unlike `innerHTML`), `el.append()`, `el.replaceWith()`, `el.remove()`, and `el.classList.add/remove/toggle('active')`. Events travel in **3 phases**: **1. Capturing Phase** (`window → target`), **2. Target Phase**, **3. Bubbling Phase** (`target → window`, default unless `addEventListener(type, fn, { capture: true })`). |
| **Web Components & Shadow DOM** | 3 building blocks: (1) **Custom Elements** (`customElements.define('my-card', MyCard)`), (2) **Shadow DOM** (`this.attachShadow({ mode: 'open' })` — encapsulates internal DOM and **scopes CSS** so external styles don't leak in or out), (3) **HTML Templates (`<template>` & `<slot>`)**. |
| **What is the DOM?** | The **Document Object Model** — the browser's in-memory, live tree representation of parsed HTML (`document` root → element/text/attribute nodes). JS interacts with the page *only* through the DOM API; changes to it trigger the render pipeline (style → layout → paint → composite). It is *not* the HTML source — `document.body.innerHTML` reflects live mutations, not the original bytes. |

### Resource Hints (`dns-prefetch`, `preconnect`, `preload`, `prefetch`) & Web Animations API

| Hint / API | What It Does & When to Use |
| --- | --- |
| **`dns-prefetch`** | `<link rel="dns-prefetch" href="//cdn.example.com">` resolves the **DNS lookup only** (~20–120 ms saved) for a third-party origin you'll need later — cheapest hint, use for many origins. |
| **`preconnect`** | `<link rel="preconnect" href="https://api.example.com">` completes **DNS + TCP handshake + TLS negotiation** (~100–500 ms saved) — use for 1–2 critical origins (API host, font CDN); each preconnect holds a socket open ~10 s so don't overuse. |
| **`preload`** | `<link rel="preload" as="font\|script\|style\|image">` forces a **high-priority fetch of a resource needed on *this* page** before the parser would discover it (critical fonts, hero LCP image, above-fold CSS). |
| **`prefetch`** | `<link rel="prefetch" href="/next-page.js">` fetches a resource at **lowest priority during idle time for a *future* navigation** (next likely page's bundle). |
| **`prerender` (deprecated → Speculation Rules)** | `Speculation Rules API` (`{"prerender": [{"source":"list","urls":["/next"]}]}`) fully prerenders the likely next page in Chrome — instant LCP on SPA/MPA transitions. |
| **Web Animations API (WAAPI)** | `el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(200px)' }], { duration: 300, easing: 'ease-out', fill: 'forwards' })` — combines CSS-declarative performance (compositor thread for `transform`/`opacity`) with JS control (`pause()`, `reverse()`, `playbackRate`, timeline scrubbing, `onfinish` promises) — the middle ground between keyframes and `requestAnimationFrame`. |

### Page-Load Performance & CDN Checklist ("Ways to Reduce Page Load Time")

1. **Asset Optimization**: Minify + tree-shake JS/CSS, code-split by route (`import()`), compress with **Brotli/gzip** at CDN/origin, serve **AVIF/WebP** images sized via `srcset`, inline only **critical CSS** in `<head>`, defer the rest (`media="print" onload` trick or `rel="preload"`).
2. **Caching**: Long `Cache-Control: immutable, max-age=31536000` on **content-hashed** static assets, short/no-store on HTML, `ETag`/`Last-Modified` for revalidation, and Service Worker precaching for repeat visits.
3. **CDN Benefits**: Edge PoPs can reduce RTT and offload cacheable
   assets, TLS, and compression. Actual TTFB depends on cache-hit rate,
   origin latency, geography, and configuration; measure cold and warm paths.
4. **Render Path**: `<script defer>`/`<script async>` to stop parser blocking, `font-display: swap` to avoid invisible text (FOIT), `content-visibility: auto` to skip offscreen rendering, eliminate layout shifts with explicit `width`/`height`/`aspect-ratio` (CLS), and **lazy-load** below-fold images/iframes (`loading="lazy"`).
5. **Network Budget**: HTTP/2 or HTTP/3 multiplexing (stop sprite sheets/domain sharding), reduce third-party scripts (each tag = DNS+TCP+JS parse on the main thread), `dns-prefetch`/`preconnect` required third parties, and measure with **Core Web Vitals budgets** (LCP <2.5 s, INP <200 ms, CLS <0.1).

### `localStorage` vs `sessionStorage` vs `Cookies`

| Storage | Capacity | Lifetime | Sent with every HTTP Request? | Scope |
| --- | --- | --- | --- | --- |
| **`localStorage`** | ~5–10 MB | Persistent until explicitly cleared | No | Shared across all tabs/windows of same origin |
| **`sessionStorage`** | ~5 MB | Cleared when the **tab/window closes** | No | Isolated to the **single browser tab** (`top-level browsing context`) |
| **Cookies** | ~4 KB | Configurable (`Expires` / `Max-Age`) or session | **Yes** (adds header overhead; supports `HttpOnly`, `Secure`, `SameSite`) | Same origin/domain + path |

### SSR vs CSR vs SSG / ISR & SEO (`Meta` & `Open Graph`)

- **Meta Tags & Open Graph (`og:title`, `og:description`, `og:image`, `og:url`)**: `<meta name="description">`, `<meta name="viewport">`, and `<meta name="robots">` guide search crawlers and responsive rendering; **Open Graph** protocol controls rich social link previews on Slack/LinkedIn/X and improves click-through rate (CTR).

| Rendering Strategy | How It Works | Pros | Cons |
| --- | --- | --- | --- |
| **CSR (Client-Side Rendering)** | Server sends empty `<div id="root"></div>` + JS bundle; browser fetches data and renders DOM | Cheap static CDN hosting, rich app transitions after initial load | Slow First Contentful Paint (FCP) on slow devices, poor SEO for non-JS crawlers (blank HTML) |
| **SSR (Server-Side Rendering)** | Server fetches data and renders full HTML per request, then client **hydrates** event listeners | Fast FCP, full SEO + Open Graph tags for crawlers | Higher Time to First Byte (TTFB), server compute cost per request, hydration mismatch pitfalls |
| **SSG / ISR (Static / Incremental)** | Pre-renders HTML at build time (or revalidates in background on interval/webhook) | CDN-cached instant TTFB + full SEO | Build time scales with page count unless ISR is used |

### Accessibility (A11y, WAI-ARIA & WCAG Audit Checklist)

- **First Rule of ARIA**: *Do not use ARIA if a native semantic HTML element (`<button>`, `<nav>`, `<dialog>`, `<input>`) already provides the behavior and keyboard handling natively!*
- **WCAG 2.1 AA Audit Checklist (POUR: Perceivable, Operable, Understandable, Robust)**:
  1. **Semantic Landmarks & Headings**: Single `<h1>`, sequential `<h2>`–`<h6>`, `<main>`, `<nav>`.
  2. **Keyboard Operability**: Every interactive control reachable via `Tab`/`Shift+Tab`, operable via `Enter`/`Space`, visible `:focus-visible` ring, focus trapped inside open Modals and restored to trigger on close.
  3. **Screen Reader & ARIA**: Meaningful `alt` text on informative `<img>` (`alt=""` for decorative images), explicit `<label for="id">` on every form input, `aria-expanded` on accordions/menus, `aria-live="polite" | "assertive"` for dynamic toast/error announcements.
  4. **Visual & Contrast**: Text contrast ratio `>= 4.5:1` (`3:1` for large text), UI usable at `200%` browser zoom, respects `@media (prefers-reduced-motion: reduce)`.

### SVG vs Canvas, Responsive Retina Images & Script Loading (`async` vs `defer`)

| Dimension | **SVG (Scalable Vector Graphics)** | **HTML5 `<canvas>`** |
| --- | --- | --- |
| **Model** | XML-based **DOM nodes** (vectors, paths, shapes) | Immediate-mode **2D/WebGL pixel bitmap buffer** |
| **Resolution / Retina** | Resolution-independent (crisp at any zoom / `2x`/`3x` Retina DPI) | Pixelates on zoom unless manually scaled by `window.devicePixelRatio` |
| **Events & CSS** | Every shape is a DOM node (supports CSS `:hover`, `addEventListener`, A11y) | Single `<canvas>` node (must do manual math hit-testing for clicks) |
| **Best Use Case** | **Icons (far better than Icon Fonts!), logos, charts (<1,000 nodes), animated UI** | **Games, particle systems, image manipulation, real-time graphs (>10,000 data points)** |

- **Responsive & Retina (`2x`/`3x`) Images**: Use `<img srcset="hero-400.webp 400w, hero-800.webp 800w" sizes="(max-width: 600px) 100vw, 50vw" loading="lazy" decoding="async" />` or `<picture>` for art direction and AVIF/WebP fallbacks.
- **Script Loading Timeline**:

```text
<script src="a.js">        : [HTML Parse] ──PAUSE──▶ [Fetch JS] ──▶ [Execute JS] ──▶ [Resume HTML Parse]
<script async src="a.js">  : [HTML Parse + Fetch JS in parallel] ──PAUSE──▶ [Execute immediately when downloaded (out-of-order!)]
<script defer src="a.js">  : [HTML Parse + Fetch JS in parallel] ──────────────────▶ [Execute IN ORDER after HTML parse, before DOMContentLoaded]
```

---

## 7. CSS3 Internals, Layout Engines, Architecture & Legacy Refactoring

### Cascade, Specificity, Right-to-Left Selector Matching & Box Model

- **How Browsers Match CSS Selectors**: Browsers evaluate selectors **right-to-left** (key selector first!). For `.nav ul li a`, the engine finds every `<a>` in the DOM first and walks up its ancestors checking `li → ul → .nav`.
- **Cascade & Specificity Weight `(Inline, ID, Class/Attr/Pseudo-class, Element/Pseudo-element)`**:
  1. Cascade origin, importance, layers, specificity, and order; transitions
     and animations have their own precedence. Important declarations
     reverse layer precedence, and user-important rules can beat author ones.
  2. **Specificity tuple**: Inline `style=""` `(1,0,0,0)` > `#id` `(0,1,0,0)` > `.class` / `[type="text"]` / `:hover` `(0,0,1,0)` > `div` / `::before` `(0,0,0,1)`. Universal selector `*`, combinators (`+`, `>`, `~`), and **`:where()` contribute `(0,0,0,0)`**; **`:is()` and `:not()` take the specificity of their most specific argument**.
  3. Source order decides ties after the other cascade criteria.
- **Box Model**: Default `box-sizing: content-box` adds `padding` + `border` *outside* `width` (`width: 100px; padding: 20px` = `140px` wide). Setting **`*, *::before, *::after { box-sizing: border-box; }`** includes `padding` + `border` *inside* the declared `width`/`height`, making responsive math predictable.
- **What is CSS & Anatomy of a Rule**: Cascading Style Sheets — the styling layer controlling layout/appearance. A rule = **selector** (`h1.title`) + **declaration block** `{ property: value; ... }`; the engine resolves competing declarations via the cascade (origin → specificity → source order).
- **CSS vs CSS3 & Key CSS3 Features**: CSS3 is modularized CSS adding **Flexbox/Grid, transitions/animations/transforms, `border-radius`, `box-shadow`, gradients, media queries, `calc()`, custom properties, pseudo-classes like `:nth-child()`**, and multi-column layout.
- **Inheritance in CSS**: Properties marked *inherited* (`color`, `font-*`, `line-height`, `text-align`, `visibility`, `cursor`) flow down to children unless overridden; layout properties (`margin`, `padding`, `border`, `width`, `display`) **never** inherit — force it with `inherit`/`initial`/`unset`/`revert` keywords.
- **`margin` vs `padding`**: `padding` is space **inside** the border (increases clickable/tappable area, counts toward `background`/`box-shadow` bounds); `margin` is space **outside** the border (transparent, can be **negative**, and vertical margins between siblings **collapse** to the larger value — `10px + 20px` siblings render `20px` gap, not `30px`).

### High-Frequency CSS Interview Comparisons

| Comparison | Technical Distinction |
| --- | --- |
| **`display: none` vs `visibility: hidden` vs `opacity: 0`** | **`display: none`** removes layout/paint and accessibility presence; **`visibility: hidden`** retains layout but hides painting and generally accessibility; **`opacity: 0`** retains layout and can still receive focus/clicks and be read by assistive technology. Rendering cost depends on the browser and change, not a fixed reflow rule. |
| **Pseudo-Class (`:`) vs Pseudo-Element (`::`)** | **Pseudo-class (`:hover`, `:focus`, `:first-child`, `:nth-child`)** selects an existing element in a specific state. **Pseudo-element (`::before`, `::after`, `::placeholder`, `::selection`)** styles a virtual sub-part or inserts generated `content` not in the HTML DOM. |
| **`:nth-child(n)` vs `:nth-of-type(n)`** | `p:nth-child(2)` matches only if the **2nd child of the parent happens to be a `<p>`**. `p:nth-of-type(2)` counts only `<p>` siblings and matches the **2nd `<p>` regardless of other tags** before it. |
| **Positioning (`static`, `relative`, `absolute`, `fixed`, `sticky`)** | **`static`**: normal flow. **`relative`**: offset relative to itself without leaving normal flow (creates positioning context for `absolute` children). **`absolute`**: removed from flow, positioned relative to nearest non-`static` ancestor (or containing block with `transform`/`filter`). **`fixed`**: positioned relative to viewport (unless an ancestor has `transform`/`filter`/`perspective`!). **`sticky`**: acts `relative` until crossing scroll threshold, then sticks like `fixed` within its scroll container. |
| **`z-index` & Stacking Context** | `z-index` only compares elements **within the same Stacking Context**! A new stacking context is formed by: root `<html>`, `position: relative/absolute/fixed/sticky` with `z-index != auto`, **`opacity < 1`**, **`transform != none`**, **`filter != none`**, `isolation: isolate`, or `will-change`. (A child with `z-index: 99999` inside a parent stacking context of `z-index: 1` can NEVER sit above a sibling context with `z-index: 2`!). |
| **Block Formatting Context (BFC)** | An isolated layout mini-universe created by `display: flow-root` (modern cleanest way), `overflow != visible`, flex/grid items, or `float != none`. A BFC **(1) prevents margin collapsing** across its boundary, **(2) contains internal floats**, and **(3) stops text from wrapping around external floats**. |
| **Flexbox vs CSS Grid** | **Flexbox (`display: flex`)**: **1D layout** (row *or* column); `justify-content` aligns along the **main axis** (`flex-direction`), `align-items` aligns along the **cross axis**. **CSS Grid (`display: grid`)**: **2D layout** (rows *and* columns simultaneously via `grid-template-columns/rows` and named `grid-template-areas` / `grid-area`). |
| **RWD (Responsive) vs AWD (Adaptive)** | **Responsive Web Design (RWD)** uses a single fluid layout (`%`, `fr`, `clamp()`, media queries) that adapts smoothly across any viewport width. **Adaptive Web Design (AWD)** serves distinct pre-built fixed layouts tailored to specific detected breakpoints/devices. |
| **Units (`px`, `em`, `rem`, `vh`/`vw`)** | **`em`** is relative to the **current element's** (or parent's for `font-size`) computed `font-size` (compounds when nested!). **`rem`** is relative to the **root `<html>` `font-size`** (typically `16px` — never compounds, respects user browser font-size settings). **`vw`/`vh`** are `1%` of viewport width/height (`dvh` handles mobile browser dynamic address bars). |
| **CSS Functions & Visuals (`calc`, `attr`, `conic-gradient`, Blend, Writing-Mode)** | `calc(100% - 2rem)` mixes units at layout time; `content: attr(data-tooltip)` reads HTML attributes in `::after`; `background: conic-gradient(#4f46e5 0% 65%, #e5e7eb 65% 100%); border-radius: 50%` draws a pure-CSS **pie chart**; `mix-blend-mode` blends an element with elements behind it (`background-blend-mode` blends an element's own multiple background layers); `writing-mode: vertical-rl` / `horizontal-tb` controls horizontal/vertical text flow. |
| **CSS Animations (Declarative) vs JS Animations (Imperative)** | Prefer CSS transitions/keyframes on `transform`/`opacity` when suitable: browsers *can* composite them without relayout, depending on layers and effects. Use JS (`requestAnimationFrame` / Web Animations API) when physics, interruption, or complex sequencing is required. Tweening generates intermediate frames. |
| **Reset CSS vs Normalize.css & FOUC** | **Reset CSS** strips all default browser margins/styles to zero; **Normalize.css** preserves useful defaults (headings, lists) while fixing cross-browser bugs. **FOUC (Flash of Unstyled Content)** happens when HTML renders before critical CSS loads — prevent by putting critical CSS in `<head>` and avoiding `@import` inside CSS files (which serializes network waterfalls). |
| **Combinators (` `, `>`, `+`, `~`)** | Descendant `.a .b` (any depth); Child `.a > .b` (direct children only); **Adjacent sibling `.a + .b`** (the `.b` immediately *after* `.a` — e.g., `div + p`); **General sibling `.a ~ .b`** (all `.b` siblings after `.a` — e.g., `input:checked ~ label` toggle patterns). |
| **`word-break`, `white-space`, `overflow-wrap` & `clear`** | `white-space: nowrap` prevents wrapping, `pre` preserves newlines/spaces; `word-break: break-all` breaks words anywhere (aggressive), `overflow-wrap: anywhere`/`break-word` wraps only when the word would overflow (safer for URLs); `clear: left\|right\|both` pushes an element below preceding floats (modern equivalent: `display: flow-root` / clearfix BFC). |
| **`filter` Function vs `filter` Property** | `filter: blur(4px) brightness(0.9) contrast(1.2) grayscale(1) drop-shadow(0 2px 4px #0006)` applies GPU effects to the rendered element (vs `box-shadow` which follows the border-box — `drop-shadow` follows the element's alpha shape). **Gotcha**: `filter != none` creates a **containing block + stacking context** — `position: fixed` children inside become positioned relative to the filtered ancestor! |
| **Media Types & `@media`** | `@media screen\|print\|speech\|all` gates rules by output device; combined with feature queries — `@media (max-width: 768px)`, `(orientation: landscape)`, `(hover: hover)`, `(prefers-color-scheme: dark)`, `(prefers-reduced-motion: reduce)`, `(pointer: coarse)`. |
| **Cross-Browser Compatibility & Testing** | Check `caniuse.com` support matrices; use **vendor prefixes** (`-webkit-`, `-moz-`) via **Autoprefixer/PostCSS** (never hand-write); prefer **feature queries** `@supports (display: grid) { ... }` over UA sniffing; provide `@supports not` / default-value fallbacks; validate with real-device labs (BrowserStack) or Playwright multi-engine (`chromium`/`firefox`/`webkit`) visual tests. |
| **CSS Custom Properties (Variables)** | `:root { --brand: #4f46e5; --gap: 1rem; }` then `color: var(--brand, #000)` (second arg = fallback). They are **inherited, cascade-aware, live-updating, and JS-mutable** (`el.style.setProperty('--brand', v)`) — enabling runtime theming/dark-mode without rebuilding CSS, unlike compile-time Sass variables. |
| **Icon Fonts vs SVG Icons** | **Icon fonts** (`<i class="fa fa-home">`): single request, easy `color`/`font-size` styling — but render as blank squares while loading, can't multicolor, poor screen-reader semantics. **SVG icons**: crisp at any DPI, multicolor/animatable, accessible (`<title>` + `aria-hidden`), inlineable for zero requests — the modern default (icon font = legacy answer). |
| **Preprocessors (Sass/LESS/Stylus) & `@mixin`** | Compile-time variables, nesting, mixins (e.g., `@mixin truncate($w) { max-width:$w; overflow:hidden; text-overflow:ellipsis; }`), `@extend`, and Sass partials (`@use`/`@forward`) help share styles. Trade-offs: build step and potentially excessive specificity. Modern CSS custom properties, nesting, and layers replace some, not all, use cases. |
| **CSS Frameworks (Bootstrap/Tailwind/Bulma/Material) — Why & Why Not** | **Use when**: velocity, consistent design system, responsive grid + a11y defaults out of the box (Tailwind utility-first keeps CSS in the markup tree and purges to a tiny bundle; Bootstrap gives complete components). **Avoid when**: you need unique design language (sites look samey), bundle bloat from unused styles, or deep customization fights the framework's opinionated specificity. |

### CSS Architectures (BEM, OOCSS, SMACSS, ITCSS, CSS-in-JS) & Legacy Refactoring Playbook

- **BEM (`Block__Element--Modifier`)**: e.g., `.card__button--primary`. Keeps specificity flat at `(0,0,1,0)` (single class). *Problems faced in large teams*: verbose class names, naming bikeshedding on deeply nested components, and manual discipline required vs automatic scoping (**CSS Modules** / **Tailwind** / **Shadow DOM**).
- **OOCSS (Object-Oriented CSS)**: Separates structure from skin and container from content.
- **SMACSS / ITCSS**: Organizes styles by layer (`Settings → Tools → Generic → Elements → Objects → Components → Utilities`) in order of increasing specificity.
- **CSS-in-JS (`styled-components`, Emotion, Stitches, Vanilla Extract)**: Best practices: define styled components at module scope (never inside `render()`!), use CSS variables (`--theme-color`) for dynamic values instead of interpolating props that generate thousands of runtime `<style>` tags, or prefer **zero-runtime CSS-in-JS** (Vanilla Extract, Linaria, CSS Modules) for SSR/RSC performance.

> **Staff Scenario — "You inherit a CSS codebase bloated with `!important`, `#id` selectors, and colliding global styles. How do you fix it without breaking production?"**
>
> 1. **Audit & Freeze the Bleeding**: Run Chrome Coverage / PurgeCSS to identify dead rules and add `stylelint` (`declaration-no-important`, `selector-max-id: 0`) on modified/new files in CI.
> 2. **Introduce CSS Cascade Layers (`@layer legacy, base, components, utilities;`)**: Wrap existing legacy stylesheets inside `@layer legacy` — in CSS Cascade Layers, **any unlayered style or later `@layer components` rule automatically beats `@layer legacy` regardless of `#id` specificity** (except `!important`), giving you a clean escape hatch!
> 3. **Replace `#id` selectors with class/module selectors** (`[id="header"]` has `(0,0,1,0)` class-level specificity as a safe transitional step before refactoring HTML).
> 4. **Migrate component-by-component to scoped styles** (CSS Modules `*.module.css` or Tailwind) guarded by **Playwright / Percy visual regression snapshots** so zero pixel regressions slip into production.
