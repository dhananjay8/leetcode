# Docker & Containers

## Container vs VM
| Aspect | Container | VM |
|--------|-----------|-----|
| Isolation | Process-level (shared kernel) | Full OS (hypervisor) |
| Startup | Seconds | Minutes |
| Size | MBs | GBs |
| Overhead | Minimal | Significant |
| Portability | High (runs anywhere Docker runs) | Lower (needs hypervisor) |

## Docker Architecture
```
Docker Client (CLI) → Docker Daemon (dockerd) → Container Runtime (containerd → runc)
                                                         ↓
                                              Images (read-only layers)
                                              Containers (writable layer on top)
```

## Essential Commands

### Images
```bash
docker build -t myapp:1.0 .         # build image from Dockerfile
docker images                         # list images
docker pull nginx:latest              # pull from registry
docker tag myapp:1.0 registry/myapp:1.0  # tag for push
docker push registry/myapp:1.0       # push to registry
docker rmi <image_id>                 # remove image
docker image prune -a                 # remove all unused images
```

### Containers
```bash
docker run -d -p 8080:80 --name web nginx   # run detached, map port
docker run -it ubuntu bash                    # interactive shell
docker ps                                     # running containers
docker ps -a                                  # all containers (including stopped)
docker logs -f web                            # follow container logs
docker exec -it web bash                      # exec into running container
docker stop web                               # graceful stop (SIGTERM → SIGKILL)
docker rm web                                 # remove stopped container
docker inspect web                            # detailed container info (JSON)
docker stats                                  # real-time resource usage
```

### Volumes & Networking
```bash
docker volume create mydata               # create named volume
docker run -v mydata:/app/data nginx      # mount volume
docker run -v $(pwd):/app nginx           # bind mount (host dir → container)

docker network create mynet               # create network
docker run --network mynet nginx          # attach to network
docker network ls                          # list networks
```

## Dockerfile — Best Practices

```dockerfile
# 1. Use specific base image (not :latest)
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependency files first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# 4. Copy source code (changes frequently → later layer)
COPY . .

# 5. Don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 6. Expose port (documentation)
EXPOSE 3000

# 7. Use exec form for CMD (proper signal handling)
CMD ["node", "server.js"]
```

### Multi-stage Build (reduce image size)
```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Stage 2: Production (only copy built files)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

## Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      retries: 3

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  pgdata:
```

```bash
docker-compose up -d        # start all services
docker-compose down         # stop and remove
docker-compose logs -f web  # follow logs for 'web' service
docker-compose ps           # list running services
```

## Image Layer Caching
```
Each Dockerfile instruction creates a layer.
If a layer hasn't changed, Docker uses cached version.

Order matters:
  ✅ COPY package.json → RUN npm install → COPY . .
  ❌ COPY . . → RUN npm install (cache busted on every code change)
```

## Interview Questions

**Q: Difference between CMD and ENTRYPOINT?**
- `CMD`: Default command, can be overridden by `docker run <image> <new-cmd>`
- `ENTRYPOINT`: Always runs, CMD becomes arguments. Use for wrapper scripts.
- Combined: `ENTRYPOINT ["python"]` + `CMD ["app.py"]` → `python app.py`

**Q: How do you reduce Docker image size?**
1. Multi-stage builds
2. Use Alpine base images
3. Combine RUN commands (fewer layers)
4. `.dockerignore` to exclude unnecessary files
5. Don't install dev dependencies in production

**Q: Difference between COPY and ADD?**
`COPY` — straightforward copy. `ADD` — also supports URL downloads and tar extraction. **Prefer COPY** (more explicit).

**Q: What are Docker networking modes?**
- **bridge** (default): Containers on same bridge can communicate
- **host**: Container shares host's network namespace
- **none**: No networking
- **overlay**: Multi-host networking (Docker Swarm / K8s)

**Q: How do you persist data in Docker?**
- **Volumes** (managed by Docker, best for production)
- **Bind mounts** (host directory, good for development)
- **tmpfs** (in-memory, ephemeral)
