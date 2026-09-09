# Movie App — Dockerized Deployment

A full-stack movie catalog application — built with **Spring Boot**, **MongoDB**, and **React** — containerized with **Docker** and orchestrated with **Docker Compose**.

Users can browse movies, watch trailers, and leave reviews. The backend exposes a REST API backed by MongoDB; the frontend is a React single-page application served through Nginx, which also acts as a reverse proxy to the backend.

This project began as a manual deployment on a bare Linux server (see [Java-Spring-Boot-Application-Deployment-on-Linux](https://github.com/Mariamtahir51/Java-Spring-Boot-Application-Deployment-on-Linux)), using systemd services and a hand-configured Nginx setup. This repository takes that same application and containerizes it, so the entire stack can be built and run consistently on any machine with Docker installed — no manual JRE/MongoDB/Nginx installation required.

## Architecture

```
Browser
   │
   ▼
Nginx container (port 80)
   ├── serves the React production build
   └── reverse-proxies /api/**  ──▶  Spring Boot container (port 8081)
                                            │
                                            ▼
                                     MongoDB container (port 27017)
```

Three containers, each with a single responsibility:

| Service    | Base image                       | Responsibility                            |
|------------|-----------------------------------|--------------------------------------------|
| `mongo`    | `mongo:8.0` (official)            | Stores movies, users, and reviews          |
| `backend`  | `eclipse-temurin:21-jre-alpine`   | Spring Boot REST API                       |
| `frontend` | `nginx:alpine`                    | Serves the React build, proxies API calls  |

Both `backend` and `frontend` use **multi-stage Dockerfiles** — one stage compiles/builds the application, a second, much smaller stage contains only what's needed to *run* it. This keeps the final images small and avoids shipping build tools (Maven, Node.js) into production images.

## Prerequisites

- Docker Engine
- Docker Compose plugin
- Git

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Mariamtahir51/Java-Spring-Boot-Application-Deployment-on-Docker-Kubernetes.git
cd Java-Spring-Boot-Application-Deployment-on-Docker-Kubernetes
```

Build and start the full stack:

```bash
docker compose up --build
```

Once all three containers are running, open:

```
http://localhost/
```

The React app loads from Nginx, and any API calls it makes to `/api/**` are transparently forwarded to the Spring Boot backend — the backend's port is never exposed directly to the browser.

To run everything in the background:

```bash
docker compose up -d
```

## Loading Sample Data

MongoDB starts with an empty database. To load sample movie data:

```bash
docker cp movies.json mongo:/movies.json
docker exec -it mongo mongoimport --db movie-api-db --collection movies --file /movies.json --jsonArray
```

## How the Pieces Connect

**Backend → MongoDB**

Inside Docker's internal network, containers reach each other by service name rather than `localhost`. The backend's `application.properties` reflects this:

```properties
spring.mongodb.uri=mongodb://mongo:27017/movie-api-db
```

**Frontend → Backend**

The frontend never hardcodes a backend hostname. It calls the API using relative paths:

```javascript
export default axios.create({
    headers: { "ngrok-skip-browser-warning": "true" }
})
```

A relative request like `/api/v1/movies` resolves against whatever host is currently serving the page. Nginx's configuration (`frontend/nginx.conf`) then proxies any `/api/` request to the backend container:

```nginx
location /api/ {
    proxy_pass http://backend:8081/api/;
}
```

This means the same build works whether it's accessed via `localhost`, a VM's IP address, or a real domain — no rebuild needed for different environments.

## Data Persistence

MongoDB's data is stored in a named Docker volume, so it survives container restarts and rebuilds:

```yaml
volumes:
  - mongo-data:/data/db
```

Running `docker compose down` stops and removes the containers but keeps this volume intact. To wipe the database entirely, remove the volume explicitly:

```bash
docker compose down -v
```

## Known Issue: MongoDB on Kernel 6.19+

MongoDB 8.0's bundled memory allocator (TCMalloc) has a known incompatibility with Linux kernel versions **6.19 through 7.0.13** — see [MongoDB SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912). Since Docker containers share the host's kernel rather than running their own, this affects the containerized `mongo` service exactly as it would a native install.

The workaround, already applied in `docker-compose.yml`:

```yaml
mongo:
  environment:
    - GLIBC_TUNABLES=glibc.pthread.rseq=1
```

The permanent fix is upgrading the host machine to kernel 7.0.14 or later; this environment variable is a stable interim workaround.

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── src/...
├── docker-compose.yml
└── README.md
```

## Useful Commands

```bash
docker compose ps                # view container status
docker compose logs -f backend   # tail logs for a specific service
docker compose down              # stop and remove containers (volume persists)
docker compose up --build -d     # rebuild images and restart after code changes
```

## Redeploying After Code Changes

```bash
git pull
docker compose up --build -d
```

## Roadmap

- [x] Containerize the backend (multi-stage Dockerfile: Maven build → JRE runtime)
- [x] Containerize the frontend (multi-stage Dockerfile: Node build → Nginx runtime)
- [x] Orchestrate all services with Docker Compose
- [x] Persist MongoDB data with a named volume
- [ ] Deploy to Kubernetes (Deployments, Services, PersistentVolumeClaim)
- [ ] Set up a CI/CD pipeline (GitHub Actions) to build and push images automatically on push
