# NestJS — Enterprise Architecture & Staff Interview Deep Dive

---

## 1. What NestJS Is & Platform Architecture

- **NestJS** is a progressive, TypeScript-first Node.js framework for building efficient, scalable, and testable enterprise server-side applications. It combines **OOP** (Object-Oriented Programming), **FP** (Functional Programming), and **FRP** (Functional Reactive Programming via RxJS).
- **HTTP Platform Adapters**: Nest wraps **Express**
  (`@nestjs/platform-express`, default) or **Fastify**
  (`@nestjs/platform-fastify`). Fastify can reduce overhead in some
  workloads, but end-to-end throughput depends on handlers and
  dependencies; benchmark your own path.

```typescript
// CLI scaffold: npm i -g @nestjs/cli && nest new project-name
// Manual install: npm i --save @nestjs/core @nestjs/common rxjs reflect-metadata
// Fast dev builds with Rust SWC: npm i -D @swc/cli @swc/core && nest start -b swc

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  abortOnError: false, // throw error on bootstrap failure instead of exiting with code 1
  bodyParser: false,   // disable default body-parser only if registering custom body-parser in MiddlewareConsumer
});
```

### NestJS vs Express vs Fastify (X vs Y)

| Dimension | **NestJS** | **Node.js + Express** | **Fastify (Standalone or Nest Adapter)** |
| --- | --- | --- | --- |
| **Architecture** | Opinionated, modular (`@Module`, `@Controller`, `@Injectable`) | Unopinionated, minimalist routing + middleware layer | Low-overhead plugin architecture with JSON Schema validation |
| **Modularity & Scalability** | Built-in domain modules with explicit `imports`/`exports` boundaries | Manual folder conventions; prone to spaghetti as teams scale | Encapsulated plugin scopes (`fastify-plugin`) |
| **Dependency Injection** | First-class IoC container with Singleton, Request, and Transient scopes | None built-in (manual wiring or 3rd-party Awilix/Inversify) | None built-in (uses decorators/plugins on `fastify` instance) |
| **Decorators & Metadata** | Extensive (`@Controller`, `@UseGuards`, `@UseInterceptors`, `reflect-metadata`) | None | None |
| **TypeScript Integration** | Built in TypeScript; DTO + OpenAPI/Swagger codegen synergy | Add-on `@types/express`; weak end-to-end request typing | Strong generic + TypeBox/JSON-schema typing |
| **Built-in Pipeline** | Middleware, Guards, Interceptors, Pipes, Exception Filters | Middleware & error-handling middleware only | Lifecycle hooks (`onRequest`, `preValidation`, `preHandler`, `onSend`) |
| **Learning Curve** | Medium–High (DI, RxJS Observables, decorators, module encapsulation) | Low | Low–Medium |
| **When to Choose** | Teams needing DI, module boundaries and multi-protocol support | Lightweight HTTP apps or custom composition | Apps prioritizing a small HTTP core; Nest can use `FastifyAdapter` |

- **When NestJS Is NOT the Right Choice**: Tiny CRUD tools, serverless functions where cold-start latency is critical (unless using `LazyModuleLoader` + SWC bundling), edge runtimes (Cloudflare Workers), or teams not using TypeScript.

---

## 2. Complete Request Processing Pipeline

```text
Incoming HTTP / RPC / WS Request
  │
  ▼
1. Middleware (Global app.use() ──▶ Module MiddlewareConsumer)
  │  • Generic Express/Fastify request preprocessing (CORS, Helmet, raw body, request-id)
  │  • "Dumb": has no ExecutionContext; does not know which handler will run after next()
  ▼
2. Guards (Global ──▶ Controller ──▶ Route @UseGuards)
  │  • Single responsibility: Authentication & Authorization (CanActivate.canActivate(ExecutionContext))
  │  • Runs AFTER all middleware, BEFORE any interceptor or pipe; returning false throws 403 ForbiddenException
  ▼
3. Interceptors — Pre-Controller (Global ──▶ Controller ──▶ Route @UseInterceptors)
  │  • AOP wrapper before calling next.handle() (Pointcut): logging start time, trace context, cache-hit short-circuit
  ▼
4. Pipes (Global ──▶ Controller ──▶ Route ──▶ Route Param @Body/@Param/@Query)
  │  • Validation, Transformation & Sanitization (PipeTransform.transform(value, metadata)) right before handler execution
  ▼
5. Controller Route Handler ──▶ Service (Business Logic) ──▶ Repository (Data Access)
  │
  ▼
6. Interceptors — Post-Controller (Route ──▶ Controller ──▶ Global RxJS Observable pipeline)
  │  • Wraps response stream via RxJS operators (map, tap, timeout, catchError)
  ▼
7. Exception Filters (Route ──▶ Controller ──▶ Global @Catch / BaseExceptionFilter)
     • Catches any unhandled exception thrown at steps 2–6 and formats standardized error response
```

---

## 3. Dependency Injection (DI), Inversion of Control (IoC) & Providers

### Core Principles of Dependency Injection

1. **Inversion of Control (IoC)**: The framework's IoC container — not the consumer class — instantiates and manages the lifecycle of dependencies.
2. **Loose Coupling**: Classes depend on abstractions/tokens rather than concrete implementations.
3. **Testability**: Dependencies are trivially swapped with mocks/stubs in `Test.createTestingModule()`.
4. **Modularity & Reusability**: Services are composed across contexts without hardcoding wiring.
5. **Runtime Configurability**: Swap implementations per environment (e.g., `MockPaymentService` in test vs `StripePaymentService` in prod).
6. **Controlled Lifecycle (Beyond Raw Singletons)**: Manages Singleton, Request-scoped, and Transient lifetimes cleanly without global mutable state.
7. **Clear Separation of Concerns**: Business logic stays separate from object-graph construction.
8. **Global State Avoidance**: Eliminates hidden module-level singletons that leak state across tests.

### 3 Classic Types of DI + NestJS Property & Optional Injection

| DI Type | Mechanism | NestJS Usage & Code Pattern |
| --- | --- | --- |
| **1. Constructor Injection** | Dependencies declared as `constructor(private readonly svc: MyService)` parameters | **Standard & preferred** in NestJS; resolved via TypeScript `emitDecoratorMetadata` (`design:paramtypes`) |
| **2. Setter Injection** | Dependencies assigned via public setter methods after instantiation | Used in Java/Spring for optional/circular deps; rare in NestJS |
| **3. Method Injection** | Dependency passed directly as a parameter to the specific method that needs it | Used when only a single method needs a context-specific collaborator |
| **4. Property-Based Injection** | `@Inject('TOKEN') private readonly client: T` on a class property | Useful when a subclass inherits from a base class and passing 5+ dependencies through `super(...)` is tedious |
| **5. Optional Injection** | `@Optional() @Inject('CONFIG') private readonly cfg?: Config` | Prevents Nest from throwing an unresolved dependency error if the token isn't registered |

### 5 Provider Registration Patterns & 3 Injection Scopes

```typescript
@Module({
  providers: [
    CatsService,                                                       // 1. Standard Class shorthand
    { provide: 'APP_CONFIG', useValue: { apiUrl: 'https://...' } },    // 2. Value Provider (constants/mocks)
    { provide: StorageService, useClass: process.env.CLOUD === 'aws' ? S3Service : BlobService }, // 3. Class Provider
    {
      provide: 'DB_CONN',                                              // 4. Factory Provider (sync or async!)
      useFactory: async (cfg: ConfigService) => createPool(cfg.get('DB_URL')),
      inject: [ConfigService],
    },
    { provide: 'ALIAS_LOGGER', useExisting: LoggerService },           // 5. Alias Provider (shares existing instance)
  ],
})
export class AppModule {}
```

| Scope (`@Injectable({ scope })`) | Instance Lifecycle | Performance & Architectural Trade-off |
| --- | --- | --- |
| **`Scope.DEFAULT` (Singleton)** | **One instance** shared across the entire application for its lifetime (instantiated at bootstrap) | **Fastest (zero per-request allocation)**. Recommended for 99% of stateless services |
| **`Scope.REQUEST`** | **New instance created per request** | **Scope bubbles up**: consumers of a request-scoped provider also become request-scoped, adding allocation/DI overhead that must be measured. Consider `AsyncLocalStorage` for context propagation. |
| **`Scope.TRANSIENT`** | **New dedicated instance** created for every consumer that injects it | Useful when each consumer needs isolated internal state (e.g., per-consumer logger context) |

---

## 4. Modules (`@Module`), Encapsulation & Lazy Loading (`LazyModuleLoader`)

- Every Nest application has a root module (`AppModule`) and domain feature modules (`UsersModule`, `OrdersModule`).
- **The 4 `@Module()` Metadata Arrays**:
  1. **`providers`**: Services/factories instantiated by the Nest injector and shared within this module.
  2. **`controllers`**: HTTP controllers instantiated within this module.
  3. **`imports`**: Other modules whose **exported** providers are needed inside this module.
  4. **`exports`**: Subset of this module's `providers` (or re-exported `imports`) made visible to any module that imports this module.
- **Encapsulation Rule**: Unlike Angular (where providers are global by default), **NestJS encapsulates providers inside their declaring module scope**. To use a provider outside its module, you must either export it and import that module, or mark the module `@Global()` (register `@Global()` modules once in `AppModule`).
- **Dynamic Modules (`forRoot` / `forRootAsync` / `forFeature`)**: Return a `DynamicModule` object (`{ module: DatabaseModule, global: true, providers: [...], exports: [...] }`) extending the base `@Module()` metadata to configure providers dynamically.
- **Eager vs Lazy Loading (`LazyModuleLoader`)**:
  - By default, all modules are **eagerly loaded** at bootstrap.
  - For serverless functions, CLI commands, or rare webhook/worker paths, inject `LazyModuleLoader` to load a module on-demand (cached after the first `.load()` call):

```typescript
@Injectable()
export class ReportsService {
  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  async generateHeavyPdfReport(data: ReportDto) {
    const { PdfEngineModule } = await import('./pdf-engine/pdf-engine.module');
    const moduleRef = await this.lazyModuleLoader.load(() => PdfEngineModule);
    const pdfService = moduleRef.get(PdfEngineService);
    return pdfService.render(data);
  }
}
```

---

## 5. Controllers (`@Controller`) & Decorators Reference

- **Routing & Parameter Order**: `@Controller('cats')` + `@Get('breed')` maps to `GET /cats/breed`. Supports wildcards (`@Get('ab*cd')`). **Always declare static routes (`@Get('profile')`) before parameterized routes (`@Get(':id')`)** so `:id` doesn't swallow `'profile'`.
- **Standard vs Library-Specific Response Handling (`@Res({ passthrough: true })`)**:
  - **Standard (Recommended)**: Return JS objects/arrays (auto-serialized to JSON), Promises, or RxJS `Observable`s; status defaults to `200` (`201` for `POST`), customized via `@HttpCode(204)` and `@Header('Cache-Control', 'none')`.
  - **Library-Specific (`@Res() res: Response`)**: Gives full Express/Fastify control (`res.status(200).send()`), but **disables** NestJS interceptors, `@HttpCode()`, and standard serialization unless you pass **`@Res({ passthrough: true })`** (which lets you set cookies/headers on `res` while letting Nest serialize the return value normally!).
- **Dynamic Redirects**: `@Redirect('https://nestjs.com', 301)` — returning `{ url, statusCode }` from the handler dynamically overrides the decorator arguments.

### Complete Built-in Decorators & Express Equivalents

| NestJS Decorator | Underlying Express / Platform Object or Purpose |
| --- | --- |
| `@Module(metadata)` / `@Global()` | Declares module boundaries / global provider visibility |
| `@Controller(prefix)` | Marks class as request controller for `prefix` |
| `@Injectable(options?)` | Marks class as DI-managed provider (`Scope.DEFAULT \| REQUEST \| TRANSIENT`) |
| `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` | Binds HTTP verb + sub-route to handler method |
| `@Request()` / `@Req()` | `req` (full Express/Fastify request object) |
| `@Response({ passthrough? })` / `@Res()` | `res` (response object; use `passthrough: true` to keep Nest pipeline active) |
| `@Next()` | `next` function |
| `@Session()` | `req.session` |
| `@Param(key?)` | `req.params` / `req.params[key]` |
| `@Body(key?)` | `req.body` / `req.body[key]` |
| `@Query(key?)` | `req.query` / `req.query[key]` |
| `@Headers(name?)` | `req.headers` / `req.headers[name]` |
| `@Ip()` / `@HostParam()` | `req.ip` / `req.hosts` |
| `@HttpCode(code)` / `@Header(k, v)` / `@Redirect(url, code)` | Sets default status code, response header, or redirect |
| `@Render(view)` | Renders server-side template view |
| `@UseGuards(...)` / `@UseInterceptors(...)` / `@UsePipes(...)` / `@UseFilters(...)` | Binds pipeline enhancers at controller, method, or param level |
| `@SetMetadata(key, value)` | Attaches custom reflection metadata to class/method for Guards/Interceptors |
| `@Inject(token)` / `@Optional()` | Injects custom token (`string \| symbol \| class`) / marks dependency optional |
| `@Interval(ms)` / `@Timeout(ms)` / `@Cron(expr)` | `@nestjs/schedule` task scheduling decorators |

### Custom Parameter Decorators (`createParamDecorator`) & Composition (`applyDecorators`)

```typescript
// 1. Custom Parameter Decorator: @User() or @User('email')
export const User = createParamDecorator((data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return data ? user?.[data] : user;
});

// 2. Decorator Composition: combine Auth + RBAC + Swagger into a single @Auth('admin') decorator
export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
```

---

## 6. Middleware, Guards, Interceptors, Pipes & Exception Filters

### Middleware vs Guards vs Interceptors vs Pipes vs Filters (Comparison Matrix)

| Enhancer | Interface to Implement | Has `ExecutionContext`? | Primary Responsibility | Global DI-Aware Registration (`AppModule`) |
| --- | --- | --- | --- | --- |
| **Middleware** | `NestMiddleware` (`use(req, res, next)`) or function | **No** (doesn't know target handler) | Raw HTTP preprocessing: CORS, Helmet, cookie parsing, request logging | `AppModule.configure(consumer)` `.forRoutes('*')` (`app.use()` has no DI) |
| **Guard** | `CanActivate` (`canActivate(ctx)`) | **Yes** (`getClass()`, `getHandler()`) | Authentication & RBAC/ABAC authorization; returns `boolean` (or throws `403`) | `{ provide: APP_GUARD, useClass: RolesGuard }` |
| **Interceptor** | `NestInterceptor` (`intercept(ctx, next)`) | **Yes** + `CallHandler` (`next.handle()`) | AOP wrapping **before & after** handler via RxJS `Observable` (transform, cache, timeout, logging) | `{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }` |
| **Pipe** | `PipeTransform` (`transform(value, meta)`) | Receives `ArgumentMetadata` (`type`, `metatype`, `data`) | DTO validation (`class-validator`), type coercion (`ParseIntPipe`), defaults (`DefaultValuePipe`) | `{ provide: APP_PIPE, useClass: ValidationPipe }` |
| **Exception Filter** | `ExceptionFilter` (`catch(exception, host)`) | Receives `ArgumentsHost` (`http`/`rpc`/`ws`/`graphql`) | Catches thrown exceptions and formats standardized HTTP/RPC error responses | `{ provide: APP_FILTER, useClass: AllExceptionsFilter }` |

> **Global registration scope**: `app.useGlobalGuards(new RolesGuard())`
> constructs the instance outside Nest DI, so constructor injection is
> unavailable for *that instance*. Register `APP_GUARD` (or other
> `APP_*` tokens) for DI-managed global enhancers. Global HTTP
> enhancers do not automatically carry over to hybrid microservice
> listeners; configure `inheritAppConfig: true` if inheritance is
> intended. Check each transport's context before assuming an
> HTTP-specific guard/filter works for WebSockets or RPC.

### Concrete Code Patterns for Each Pipeline Stage

```typescript
// 1. Middleware Configuration with Route Exclusions
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors(), helmet(), LoggerMiddleware)
      .exclude({ path: 'cats', method: RequestMethod.POST }, 'cats/(.*)')
      .forRoutes(CatsController);
  }
}

// 2. RBAC Guard using Reflector.createDecorator (or @SetMetadata)
export const Roles = Reflector.createDecorator<string[]>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}

// 3. AOP Interceptor (Pointcut = next.handle() returning RxJS Observable)
@Injectable()
export class TransformAndLogInterceptor<T> implements NestInterceptor<T, { data: T; statusCode: number }> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<{ data: T; statusCode: number }> {
    const started = Date.now();
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      tap(() => console.log(`Executed in ${Date.now() - started}ms`)),
      map((data) => ({ data, statusCode: res.statusCode })),
    );
  }
}

// 4. Built-in & Custom Pipes (Validation, Transformation & DefaultValuePipe)
// Route usage:
// @Get(':id') findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number)
// @Get() findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number)
// Global Hardened ValidationPipe:
new ValidationPipe({
  whitelist: true,            // strip properties not decorated in the DTO class (prevents mass-assignment!)
  forbidNonWhitelisted: true, // reject requests containing unknown properties with 400 Bad Request
  transform: true,            // auto-transform payloads to DTO class instances and primitive types
});

// 5. Multi-Context Exception Filter with ArgumentsHost & HttpException cause
// Throwing with internal cause (not serialized to client, preserved for server logs):
// throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Custom msg' }, HttpStatus.FORBIDDEN, { cause: err });
@Catch() // catch-all; this example handles HTTP only
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // Use a transport-specific filter rather than silently swallowing
      // errors in RPC or WebSocket contexts.
      throw exception;
    }
  }
}
```

---

## 7. Application Lifecycle Hooks & Graceful Shutdown

```text
Bootstrap:
  1. onModuleInit()                ──▶ Called per module once its host dependencies are resolved
  2. onApplicationBootstrap()      ──▶ Called after ALL modules have initialized, before listening for connections

Shutdown (requires app.enableShutdownHooks() in main.ts for K8s SIGTERM!):
  3. onModuleDestroy()             ──▶ Called when SIGTERM/SIGINT is received; stop accepting new work
  4. beforeApplicationShutdown(sig)──▶ Called after onModuleDestroy(); HTTP server closes active connections
  5. onApplicationShutdown(sig)    ──▶ Called after connections drain; close DB pools, Kafka producers, Redis
```

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, OnApplicationShutdown {
  async onModuleInit() { await this.connectPool(); }
  onApplicationBootstrap() { console.log('All modules ready'); }
  async onModuleDestroy() { await this.stopBackgroundConsumers(); }
  async onApplicationShutdown(signal?: string) { await this.closePool(); }
}
```

---

## 8. Enterprise NestJS Interview Q&A (Testing, Auth, DB, Microservices, WebSockets)

### Q28 & Q29. How do you perform Unit Testing and E2E Testing in NestJS?

- **Unit Testing**: Use `@nestjs/testing` `Test.createTestingModule()` to compile an isolated DI container where repositories/external clients are replaced with `useValue` mocks (or auto-mocked with `@golevelup/ts-jest`).
- **E2E Testing**: Bootstrap the full module (or `AppModule`) with `moduleFixture.createNestApplication()`, apply the exact same global pipes/guards/interceptors, override external auth/DB providers if needed via `.overrideProvider(ExternalService).useValue(mock)`, call `await app.init()`, and drive HTTP assertions with **`supertest` (`request(app.getHttpServer())`)**.

```typescript
// Unit Test
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [{ provide: CatsService, useValue: { findAll: jest.fn().mockResolvedValue(['Bengal']) } }],
}).compile();
const controller = moduleRef.get(CatsController);

// E2E Test
const app = moduleRef.createNestApplication();
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
await app.init();
await request(app.getHttpServer()).get('/cats').expect(200).expect(['Bengal']);
```

### Q30 & Q31. How do you implement Authentication and Authorization in NestJS?

- **Authentication (Who are you?)**: Implemented with `@nestjs/passport` + `PassportStrategy(Strategy, 'jwt')` and `@nestjs/jwt`. `JwtAuthGuard extends AuthGuard('jwt')` validates the Bearer JWT signature/expiration and attaches the decoded payload to `request.user`. Routes can opt out of a global `JwtAuthGuard` using a `@Public()` metadata decorator checked via `Reflector`.
- **Authorization (What are you allowed to do?)**: Enforced in **Guards** (never inside controllers!) combining `@Roles(...)` / `@Permissions(...)` metadata with `Reflector` (RBAC) or policy engines like **CASL** / OPA for resource-level ABAC.

### Q32 & Q33. How do you integrate SQL/NoSQL Databases, and what do `@nestjs/typeorm` and `@nestjs/mongoose` do?

- **`@nestjs/typeorm`**: Integrates TypeORM for relational databases (PostgreSQL, MySQL, Oracle). `TypeOrmModule.forRootAsync()` configures the connection pool at the root using `ConfigService`, and `TypeOrmModule.forFeature([UserEntity])` registers scoped repositories injected via `@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>`.
- **`@nestjs/mongoose`**: Integrates Mongoose for MongoDB. `MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])` registers the model injected via `@InjectModel(Cat.name) private readonly catModel: Model<CatDocument>`.
- **Architecture Rule**: Feature modules must **export their `Service`, never their ORM `Repository`/`Model`**, so database queries stay encapsulated inside the owning domain module.

### Q34 & Q35. How does NestJS support Microservices, and what is the role of `@nestjs/microservices`?

- `@nestjs/microservices` abstracts distributed transport layers (**TCP, Redis Pub/Sub, Kafka, RabbitMQ, NATS, MQTT, gRPC**) behind the same Controller/Guard/Interceptor/Pipe/Filter programming model (`host.switchToRpc()`).
- A **Hybrid Application** runs both an HTTP server and one or more microservice listeners in the same process via `app.connectMicroservice<MicroserviceOptions>({ transport: Transport.KAFKA, options: { ... } })` followed by `await app.startAllMicroservices()`.
- Supports two messaging styles:
  1. **Request–Response (`@MessagePattern('orders.create')`)**: Producer calls `client.send(pattern, payload)` and awaits a reply.
  2. **Event-Driven (`@EventPattern('order.created')`)**: Producer calls `client.emit(pattern, payload)` (fire-and-forget event publication).

### Q36 & Q37. How are WebSockets implemented in NestJS, and how do you build a scalable real-time chat app?

- `@nestjs/websockets` wraps **Socket.io** (`@nestjs/platform-socket.io`) or native **`ws`** (`@nestjs/platform-ws`) inside **`@WebSocketGateway()`** classes that support Guards, Interceptors, Pipes, and Exception Filters (`host.switchToWs()`).
- **Horizontal Scaling across Kubernetes Pods**: Because WebSocket connections are stateful in memory, a user on Pod A messaging a room with users on Pod B requires a custom **`IoAdapter` backed by `@socket.io/redis-adapter` (Redis Pub/Sub)** so `server.to(room).emit()` broadcasts across all pods.

```typescript
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) { /* verify JWT in client.handshake.auth.token */ }
  handleDisconnect(client: Socket) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDto) {
    this.server.to(dto.roomId).emit('newMessage', { senderId: client.data.userId, text: dto.text });
    return { event: 'ack', data: { delivered: true } };
  }
}
```

### Dynamic Modules (`forRoot` vs `forRootAsync` vs `forFeature`) & Kubernetes Health Probes (`@nestjs/terminus`)

- **Dynamic Module Conventions**:
- **`forRoot(options)` / `forRootAsync({ inject: [ConfigService], useFactory: ... })`**: Configures shared infrastructure; neither convention implies `@Global()` visibility unless the module is actually global/exported.
  - **`forFeature(entitiesOrQueues)`**: Registers feature-scoped providers (e.g., a specific repository or BullMQ queue) inside a domain module while reusing the root connection.
  - **`ConfigurableModuleBuilder` (Nest v9+)**: Generates type-safe `register`, `registerAsync`, `forRoot`, and `OPTIONS_TYPE` boilerplate automatically.
- **Kubernetes Readiness vs Liveness Probes (`@nestjs/terminus`)**:
  - **`GET /health/live` (`livenessProbe`)**: Checks only if the Node.js event loop is responsive (never check external DB/Redis in liveness — a temporary DB blip would restart all pods!).
  - **`GET /health/ready` (`readinessProbe`)**: Checks whether this pod can
    accept work. Include critical dependency checks only when failing
    them should remove this replica from traffic; checking a shared DB
    in every pod can remove the entire Service during a DB outage.

---

## 9. Top 6 NestJS Anti-Patterns & Common Production Mistakes

1. **Circular Module/Service Dependencies (`forwardRef(() => ...)` abuse)**: Instead of masking circular imports with `forwardRef`, extract the shared contract into a dedicated third module or decouple via domain events (`@nestjs/event-emitter`).
2. **Putting Business Logic Inside Controllers**: Controllers should only extract/validate HTTP inputs, invoke a Service, and return the result — keeping services transport-agnostic (reusable across HTTP, gRPC, Kafka, and Cron).
3. **Bypassing Module Boundaries by Exporting Repositories**: Exporting `TypeOrmModule` repositories directly couples every module to another domain's table schema; export the domain `Service` instead.
4. **Overusing `Scope.REQUEST` Providers**: Causes the entire upstream injection tree to re-instantiate on every HTTP request; use Singleton services + Node `AsyncLocalStorage` (`nestjs-cls`) for request-scoped context.
5. **Using `app.useGlobalGuards(new ...)` for DI-dependent guards**:
   The manually constructed instance has no Nest injection. Use
   `APP_GUARD`, and configure hybrid transport inheritance separately.
6. **Omitting `whitelist: true` on `ValidationPipe`**: Allows attackers to inject undeclared fields (`isAdmin: true`) directly into DTO payloads (mass-assignment vulnerability).
