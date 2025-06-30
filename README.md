# TV Show Dashboard

A modern dashboard to track new TV shows across platforms, deployed using Kubernetes.  
**Tech:** Vite + React + TypeScript (frontend), Node.js + Express + TypeScript (backend), Postgres (database), Docker, Kubernetes (K8s), GitOps-ready.

---

## Features

- Aggregates TV show data from two public APIs (stubbed for easy extension)
- Modern, responsive dashboard UI
- Built as microservices: frontend, backend, and database, each Dockerized
- Kubernetes manifests for easy deployment
- Ready for GitOps with ArgoCD/Flux

---

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/tv-dashboard-k8s.git
cd tv-dashboard-k8s
```

### 2. Local Dev (no K8s)

- Start **Postgres**:  
  ```bash
  docker compose up -d
  ```
- Start **backend**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- Start **frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 3. Docker Compose (optional)

_Coming soon: docker-compose setup for quick local runs!_

### 4. Kubernetes (minikube example)

- Make sure Docker images for frontend & backend are built and pushed (or use local registry).
- Apply manifests:
  ```bash
  kubectl apply -f k8s/
  ```

---

## Project Structure

- `/frontend` — Vite + React + TS app (dashboard)
- `/backend` — Express + TS API (aggregates TV show APIs & talks to Postgres)
- `/db` — Postgres DB with init script
- `/k8s` — K8s manifests: Deployments, Services, Ingress

---

## Extending

- To add more TV APIs, edit `backend/src/clients/` and update aggregation logic.
- To add new features, see TODOs in code comments!

---

## TODO

- [ ] Implement real API integrations in backend
- [ ] Add monitoring setup

