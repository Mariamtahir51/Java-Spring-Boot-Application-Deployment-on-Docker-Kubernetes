# Movie App — Docker & Kubernetes Deployment

A full-stack movie catalog application — built with **Spring Boot**, **MongoDB**, and **React** — containerized with **Docker** and deployed to a **Kubernetes** cluster (via Minikube).

Users can browse movies, watch trailers, and leave reviews. The backend exposes a REST API backed by MongoDB; the frontend is a React single-page application served through Nginx, which also acts as a reverse proxy to the backend.

This project began as a manual deployment on a bare Linux server (see [Java-Spring-Boot-Application-Deployment-on-Linux](https://github.com/Mariamtahir51/Java-Spring-Boot-Application-Deployment-on-Linux)), using systemd services and a hand-configured Nginx setup. This repository takes that same application through two further stages: containerizing it with **Docker Compose**, and then deploying those same containers to a **Kubernetes** cluster.

## Architecture

```
Browser
   │
   ▼
Nginx (frontend container/pod, port 80)
   ├── serves the React production build
   └── reverse-proxies /api/**  ──▶  Spring Boot (backend container/pod, port 8081)
                                            │
                                            ▼
                                     MongoDB (container/pod, port 27017)
```

Three services, each with a single responsibility:

| Service    | Image                             | Responsibility                            |
|------------|-------------------------------------|---------------------------------------------|
| `mongo`    | `mongo:8.0` (official)              | Stores movies, users, and reviews            |
| `backend`  | `eclipse-temurin:21-jre-alpine`     | Spring Boot REST API                         |
| `frontend` | `nginx:alpine`                      | Serves the React build, proxies API calls    |

Both `backend` and `frontend` use **multi-stage Dockerfiles** — one stage builds the application, a second, smaller stage runs it. This keeps the final images lean and avoids shipping build tools (Maven, Node.js) into runtime images.

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
├── k8s/
│   ├── mongo.yaml
│   ├── backend.yaml
│   └── frontend.yaml
├── docker-compose.yml
└── README.md
```

---

## Part 1: Running with Docker Compose

### Prerequisites

- Docker Engine
- Docker Compose plugin
- Git

### Getting Started

```bash
git clone https://github.com/Mariamtahir51/Java-Spring-Boot-Application-Deployment-on-Docker-Kubernetes.git
cd Java-Spring-Boot-Application-Deployment-on-Docker-Kubernetes

docker compose up --build
```

Once running, open:

```
http://localhost/
```

API requests to `/api/**` are transparently proxied by Nginx to the Spring Boot backend — port 8081 is never exposed directly to the browser.

Run detached:

```bash
docker compose up -d
```

### Loading Sample Data

```bash
docker cp movies.json mongo:/movies.json
docker exec -it mongo mongoimport --db movie-api-db --collection movies --file /movies.json --jsonArray
```

### Data Persistence

MongoDB's data is stored in a named Docker volume, so it survives container restarts:

```yaml
volumes:
  - mongo-data:/data/db
```

`docker compose down` stops and removes containers but keeps this volume. To wipe the database entirely:

```bash
docker compose down -v
```

### Useful Commands

```bash
docker compose ps                # view container status
docker compose logs -f backend   # tail logs for a specific service
docker compose down              # stop and remove containers (volume persists)
docker compose up --build -d     # rebuild and restart after code changes
```

---

## Part 2: Running on Kubernetes (via Minikube)

### Prerequisites

- `kubectl`
- `minikube`
- Docker (used by Minikube's `docker` driver)

### 1. Start the cluster

```bash
minikube start --driver=docker
kubectl get nodes
```

### 2. Build the application images

```bash
docker build -t movie-backend:latest ./backend
docker build -t movie-frontend:latest ./frontend
```

### 3. Load the images into Minikube

Minikube runs its own internal image store, separate from the host's Docker daemon:

```bash
minikube image load movie-backend:latest
minikube image load movie-frontend:latest
```

### 4. Apply the Kubernetes manifests

```bash
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

Check status:

```bash
kubectl get pods
kubectl get svc
```

All three pods (`mongo`, `backend`, `frontend`) should reach `Running` status.

### 5. Load sample data

```bash
kubectl get pods   # note the mongo pod's name

kubectl cp movies.json <mongo-pod-name>:/movies.json
kubectl exec -it <mongo-pod-name> -- mongoimport --db movie-api-db --collection movies --file /movies.json --jsonArray
```

### 6. Access the application

**Option A — Minikube's built-in URL (reachable from the same machine running Minikube):**

```bash
minikube service frontend --url
```

**Option B — Port-forward, bound to all interfaces (reachable from other machines on the network, e.g. testing from a host machine when Minikube runs inside a VM):**

```bash
kubectl port-forward --address 0.0.0.0 service/frontend 8080:80
```

Then browse to `http://<vm-ip>:8080`.

### How the Manifests Fit Together

- **`mongo.yaml`** — a `PersistentVolumeClaim` (so data survives pod restarts), a `Deployment` running the official `mongo:8.0` image, and a `Service` giving it a stable internal DNS name (`mongo`).
- **`backend.yaml`** — a `Deployment` running the locally built `movie-backend:latest` image with `imagePullPolicy: Never` (so Kubernetes uses the image already loaded into Minikube instead of trying to pull it from a registry), and a `Service` exposing it internally on port 8081.
- **`frontend.yaml`** — a `Deployment` running `movie-frontend:latest`, and a `NodePort` `Service` (unlike the internal-only `ClusterIP` services for `mongo` and `backend`) so it can be reached from outside the cluster.

Just like in Docker Compose, the backend connects to MongoDB using the **Service name**, not `localhost`:

```properties
spring.mongodb.uri=mongodb://mongo:27017/movie-api-db
```

Kubernetes' internal DNS resolves `mongo` to the right pod(s) automatically, the same way Docker Compose's networking did.

---

## Configuration Notes

**Frontend → Backend connectivity**

The frontend never hardcodes a backend hostname — it calls the API using relative paths:

```javascript
export default axios.create({
    headers: { "ngrok-skip-browser-warning": "true" }
})
```

A relative request like `/api/v1/movies` resolves against whatever host is currently serving the page. Nginx then proxies any `/api/` request to the backend:

```nginx
location /api/ {
    proxy_pass http://backend:8081/api/;
}
```

This means the same built frontend image works unchanged whether it's accessed via `localhost`, a Docker Compose host, or a Kubernetes NodePort/Ingress — no rebuild needed per environment.

## Known Issue: MongoDB on Kernel 6.19+

MongoDB 8.0's bundled memory allocator (TCMalloc) has a known incompatibility with Linux kernel versions **6.19 through 7.0.13** — see [MongoDB SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912). Since both Docker containers and Kubernetes pods share the host's kernel rather than running their own, this affects MongoDB identically in both environments.

**Workaround**, applied in both `docker-compose.yml` and `k8s/mongo.yaml`:

```yaml
environment:
  - GLIBC_TUNABLES=glibc.pthread.rseq=1
```

The permanent fix is upgrading the host machine to kernel 7.0.14 or later.

## Redeploying After Code Changes

**Docker Compose:**

```bash
git pull
docker compose up --build -d
```

**Kubernetes:**

```bash
git pull
docker build -t movie-backend:latest ./backend
docker build -t movie-frontend:latest ./frontend
minikube image load movie-backend:latest
minikube image load movie-frontend:latest
kubectl rollout restart deployment backend
kubectl rollout restart deployment frontend
```

## Roadmap

- [x] Containerize the backend (multi-stage Dockerfile: Maven build → JRE runtime)
- [x] Containerize the frontend (multi-stage Dockerfile: Node build → Nginx runtime)
- [x] Orchestrate all services with Docker Compose
- [x] Persist MongoDB data with a named volume
- [x] Deploy to Kubernetes (Deployments, Services, PersistentVolumeClaim)
- [ ] Set up a CI/CD pipeline (GitHub Actions) to build and push images automatically on push
- [ ] Replace `kubectl port-forward` with a proper Ingress controller
