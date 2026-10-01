# Express.js — Staff/Principal Interview Deep Dive

---

## 1. What is Express.js?

Express is a minimal, fast, and flexible web application framework for Node.js. It provides:

- Routing for HTTP methods and URL paths.
- Middleware pipeline for request/response processing.
- Template engine integration.
- Static file serving.
- Easy integration with databases, authentication, and other Node modules.

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 2. Middleware

Middleware functions process requests before they reach route handlers. They can:

- Execute any code.
- Modify `req` and `res` objects.
- End the request-response cycle.
- Call `next()` to pass control to the next middleware.

```javascript
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

app.use(logger);
```

### Built-in middleware

| Middleware | Purpose |
|---|---|
| `express.json()` | Parse JSON request bodies |
| `express.urlencoded()` | Parse URL-encoded form bodies |
| `express.static()` | Serve static files |
| `express.raw()` / `express.text()` | Parse raw/text bodies |

### Error-handling middleware

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

Staff point: **Error-handling middleware has four arguments; Express distinguishes it by arity.**

---

## 3. Routing

Routes map HTTP methods and paths to handler functions.

```javascript
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});
```

### Route parameters, query parameters, and body

| Source | Access | Example URL |
|---|---|---|
| Route params | `req.params` | `/users/:userId` |
| Query params | `req.query` | `/search?q=express` |
| Body | `req.body` | `POST /create` with JSON |

```javascript
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`User ID: ${userId}`);
});

app.get('/search', (req, res) => {
  const term = req.query.q;
  res.send(`Searching for: ${term}`);
});

app.post('/create', express.json(), (req, res) => {
  const data = req.body;
  res.status(201).json(data);
});
```

---

## 4. Form Data and File Uploads

### URL-encoded forms

```javascript
app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  res.json(req.body);
});
```

### File uploads with `multer`

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded');
});
```

For large files, prefer streaming to avoid loading the whole file into memory.

---

## 5. Express Router

Routers modularize route handlers into separate files.

```javascript
// routes/user.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('All users'));
router.get('/:id', (req, res) => res.send(`User ${req.params.id}`));

module.exports = router;
```

```javascript
// app.js
const userRouter = require('./routes/user');
app.use('/users', userRouter);
```

---

## 6. Static Files

```javascript
app.use(express.static('public'));
```

Serves files from the `public` directory at the root URL.

---

## 7. Template Engines

Express supports EJS, Pug, Handlebars, and Mustache.

```javascript
app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
  res.render('home', { title: 'My Express App' });
});
```

| Engine | Style | Best for |
|---|---|---|
| EJS | HTML + embedded JS | Teams comfortable with HTML |
| Pug | Indentation-based, minimal | Concise templates |
| Handlebars | Logicless | Strong separation of concerns |
| Mustache | Logicless, multi-language | Cross-language templating |

---

## 8. Sessions and Cookies

```javascript
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // set true with HTTPS
}));

app.get('/login', (req, res) => {
  req.session.user = { id: 1, username: 'user123' };
  res.send('Logged in');
});

app.get('/profile', (req, res) => {
  const user = req.session.user;
  if (user) res.send(`Welcome, ${user.username}`);
  else res.status(401).send('Please log in');
});
```

For production, store session state in Redis or a database instead of in-memory.

---

## 9. CORS

Cross-Origin Resource Sharing controls which domains can request resources from your API.

### Key headers

| Header | Purpose |
|---|---|
| `Access-Control-Allow-Origin` | Allowed origin(s) |
| `Access-Control-Allow-Methods` | Allowed HTTP methods |
| `Access-Control-Allow-Headers` | Allowed request headers |
| `Access-Control-Allow-Credentials` | Whether cookies/auth headers are allowed |

### Simple vs preflight requests

- **Simple requests**: `GET`, `POST`, `HEAD` with safelisted headers and content types.
- **Preflight requests**: Browser sends `OPTIONS` first for non-simple methods/headers.

### Using the `cors` middleware

```javascript
const cors = require('cors');

// Allow all origins (not recommended for production)
app.use(cors());

// Restricted configuration
const corsOptions = {
  origin: 'https://example.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
```

---

## 10. Authentication & Authorization

### Authentication middleware with Passport

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) return done(err);
    if (!user || !user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect credentials.' });
    }
    return done(null, user);
  });
}));

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/dashboard');
});
```

### Authorization middleware

```javascript
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).send('Access denied');
};

app.get('/admin', isAdmin, (req, res) => {
  res.send('Admin dashboard');
});
```

### Security checklist

- Hash passwords with bcrypt or Argon2.
- Use JWTs signed with strong secrets; keep payloads small and claim expiration.
- Serve over HTTPS.
- Validate and sanitize all inputs.
- Implement rate limiting.
- Store sessions server-side (Redis, DB).
- Configure CORS strictly.
- Avoid exposing detailed errors to clients.

---

## 11. Configuration Management

Use environment-specific configuration files or environment variables.

```javascript
// config/index.js
const env = process.env.NODE_ENV || 'development';

const configs = {
  development: { port: 3000, db: 'localhost/dev' },
  production: { port: process.env.PORT, db: process.env.DB_URI },
};

module.exports = configs[env];
```

Popular packages: `dotenv` for `.env` loading, `convict`, `config`.

---

## 12. Testing Express Applications

| Type | Tools |
|---|---|
| Unit | Jest + mocked request/response objects |
| Integration | Jest + Supertest |
| E2E | Playwright/Cypress or full Supertest flows |

```javascript
// Supertest integration test
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  it('returns users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
```

---

## 13. Performance Optimization

| Technique | How |
|---|---|
| Caching | Redis for frequent data; HTTP cache headers for static assets |
| Compression | `compression` middleware for gzip/deflate |
| Load balancing | NGINX, AWS ALB, PM2 cluster mode |
| Database optimization | Indexes, connection pooling |
| Async I/O | Avoid synchronous/blocking operations |
| CDN | Offload static assets |
| Reverse proxy | Handle SSL termination and static serving |
| Stateless design | Scale horizontally without sticky sessions |

---

## 14. Additional Production Patterns

### Request lifecycle and the "headers already sent" trap

Once a response is sent (`res.send`, `res.json`, `res.status(...).end`), headers are finalized. Any later attempt to send another response or set a header throws:

```
Error: Cannot set headers after they are sent to the client
```

This usually happens when middleware or an async callback sends a response after the route handler already ended. Always use `return` after `res.send()` or centralize response handling.

### Route specificity and ordering

Express matches routes in registration order. A generic parameter route can swallow a specific route if defined first.

```javascript
// BAD: /products/new is shadowed
app.get('/products/:id', handler);
app.get('/products/new', handler);

// GOOD
app.get('/products/new', handler);
app.get('/products/:id', handler);
```

### Controllers: keep route handlers thin

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', userController.create);

module.exports = router;
```

Benefits:

- Routes are pure wiring; controllers hold domain logic.
- Easier to unit test business logic without mocking `req`/`res`.
- Consistent error handling patterns.

### Security headers with Helmet

```javascript
const helmet = require('helmet');
app.use(helmet());
```

Helmet sets baseline security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP, etc.). Customize CSP to allow required scripts and sources.

### Health and readiness endpoints

```javascript
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/ready', async (req, res) => {
  const dbOk = await db.ping();
  const cacheOk = await cache.ping();
  if (dbOk && cacheOk) return res.status(200).json({ ready: true });
  res.status(503).json({ ready: false });
});
```

- **Liveness** (`/health`): "Is the process alive?"
- **Readiness** (`/ready`): "Can the process accept traffic?"

K8s uses these for restart and traffic routing decisions.

### Rate limiting strategies

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use('/api', limiter);
```

For multi-instance deployments use a Redis-backed store so limits are global, not per-process.

### Express 5 async error handling

Express 4.x does not automatically catch rejected promises in route handlers. Express 5.x forwards rejected promises to error middleware without a wrapper.

Express 4 safe pattern:

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await db.getUser(req.params.id);
  res.json(user);
}));
```

Packages like `express-async-handler` or `express-async-errors` provide this behavior.

### AbortController for downstream cancellation

```javascript
app.get('/proxy', async (req, res, next) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const upstream = await fetch('https://slow.api/data', {
      signal: controller.signal,
    });
    const data = await upstream.json();
    clearTimeout(timeout);
    res.json(data);
  } catch (err) {
    clearTimeout(timeout);
    next(err);
  }
});
```

Use `AbortController` to cancel slow downstream calls and avoid holding connections beyond client/server timeouts.

---

## 15. REST vs GraphQL in Express

| Factor | REST | GraphQL |
|---|---|---|
| Endpoint design | Multiple resource-specific endpoints | Single `/graphql` endpoint |
| Over-fetching | Common | Avoided |
| Under-fetching | Common | Avoided |
| Caching | HTTP cache friendly | Requires custom cache strategies |
| Contract | URL + method based | Schema based |
| Best for | Stable, simple data models | Diverse client data needs |

---

## 16. Staff-Level Sound Bites

- "Express is thin by design; it gives you freedom, but that freedom requires discipline in architecture."
- "Middleware order matters — each request flows through middleware in the order it is registered."
- "Error-handling middleware is identified by its four-argument signature."
- "Never trust user input; validate, sanitize, and escape before using it."
- "Session state should not live in memory at scale; use Redis or a database."
- "REST works well with HTTP caching; GraphQL trades caching simplicity for query flexibility."

---

## 17. Quick Reference Table

| Task | Pattern / Middleware |
|---|---|
| Parse JSON body | `express.json()` |
| Parse forms | `express.urlencoded({ extended: true })` |
| Serve static files | `express.static('public')` |
| Modular routes | `express.Router()` |
| Handle errors | 4-argument error middleware |
| Enable CORS | `cors()` middleware |
| File uploads | `multer` |
| Sessions | `express-session` + Redis store |
| Authentication | Passport or JWT middleware |
| Compression | `compression` middleware |
| Rate limiting | `express-rate-limit` |
| Request validation | `express-validator`, `joi`, or `zod` |
| Security headers baseline | `helmet()` |
| Health/readiness | `/health`, `/ready` endpoints |
| Distributed rate limiting | `express-rate-limit` + Redis store |
| Async error wrapper | `express-async-handler` or Express 5 |
| Downstream cancellation | `AbortController` |

---

## 18. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| What is Express | "Express is a minimal HTTP framework for Node that gives a middleware pipeline and routing primitives without enforcing heavy architecture." |
| Middleware | "Middleware is ordered request-processing logic; every request flows through it, so order and side effects are critical." |
| Routing | "Express routing maps method + path to handlers, with path params/query/body as distinct data channels." |
| Error handling | "Operational errors should be normalized in centralized error middleware with safe client messages and rich server logs." |
| Sessions/cookies | "Sessions store server-side identity state while cookies carry client tokens/IDs; at scale, session storage should be externalized (Redis)." |
| CORS | "CORS is a browser-enforced cross-origin policy controlled by response headers and preflight negotiation." |
| AuthN vs AuthZ | "Authenticate identity first, then authorize actions with role/permission policies at route or domain boundaries." |
| REST vs GraphQL | "REST offers cache-friendly explicit endpoints; GraphQL optimizes client data shape at the cost of more complex server governance." |
| Request lifecycle | "After a response is sent, headers are committed; any further send causes a runtime error, so centralize response handling and return early." |
| Route specificity | "Express matches routes in order, so specific paths must be registered before parameter routes to avoid shadowing." |
| Helmet | "`helmet()` gives a security header baseline; customize CSP rather than disabling it." |
| Health/readiness | "`/health` says the process is alive; `/ready` says dependencies are reachable and traffic should be routed here." |
| Rate limiting | "Rate limits should be global across instances in production, usually backed by Redis." |
| Express async errors | "Express 4 does not catch rejected promises in routes; wrap handlers or upgrade to Express 5 for automatic forwarding to error middleware." |

---

## 19. Frequent Staff-Level Follow-Ups

- **Graceful lifecycle:** implement readiness/liveness probes and drain logic before process exit.
- **Idempotency for writes:** support idempotency keys for critical POST operations (payments/orders) to handle retries safely.
- **Standardized observability:** add request IDs, latency histograms, status-code cardinality, and structured logs.
- **Security hardening defaults:** `helmet`, strict CORS origin allowlists, request-size limits, and rate limits per sensitive endpoint.
- **API evolution:** enforce backward-compatible versioning strategy and deprecation windows.
