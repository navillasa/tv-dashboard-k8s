# 📺 TV Hub

> **A modern TV show dashboard to demo production-ready DevOps practices**

[![CI/CD Pipeline](https://github.com/navillasa/tv-dashboard-k8s/actions/workflows/ci.yml/badge.svg)](https://github.com/navillasa/tv-dashboard-k8s/actions)
[![Infrastructure as Code](https://img.shields.io/badge/IaC-Terraform-7B42BC)](./infra/)
[![Container Security](https://img.shields.io/badge/Security-Multi--stage%20Builds-green)](./backend/Dockerfile)

![TV Hub Dashboard](docs/images/tv-hub-screenshot2.png)
*Live dashboard showing popular shows across Netflix, Disney+, Prime Video, and more streaming platforms*

A comprehensive TV show aggregation platform built to demonstrate enterprise-level DevOps engineering practices. While the application itself is intentionally simple (displaying trending TV shows from multiple platforms), the infrastructure and deployment pipeline showcase advanced concepts including GitOps, observability, security, and cloud-native architecture patterns.

---

## 🌟 **Key Features**

### ⛴️  **Production-Ready Deployment**
- **Production Deployment**: Live at [tv-hub.navillasa.dev](http://tv-hub.navillasa.dev)
- **GKE Autopilot**: Cost-effective Kubernetes with auto-scaling
- **Custom Domain + SSL**: Automatic certificate management
- **GitOps with ArgoCD**: Continuous deployment from Git

### 🔧 **DevOps Infrastructure** 
- **Infrastructure as Code**: Full Terraform deployment on GKE Autopilot
- **Multi-Environment GitOps**: Automated dev deployment, manual prod promotion via ArgoCD
- **Complete CI/CD Pipeline**: GitHub Actions builds, tests, and deploys with semantic versioning
- **Container Registry**: Google Container Registry integration
- **Observability**: Prometheus metrics + Grafana dashboards with custom business KPIs
- **Production Security**: HashiCorp Vault + External Secrets for sensitive data management

---

## 🌐 **Live Application Access**

### 📱 **TV Hub Dashboard** 
- **URL**: [http://tv-hub.navillasa.dev](http://tv-hub.navillasa.dev)
- **Features**: Multi-platform TV show aggregation with trending rankings
- **Data Sources**: TMDB + TVmaze APIs with real-time updates
- **UI**: Responsive React frontend with platform filtering and detailed modals

### 📊 **Live Business Intelligence Dashboard**
- **URL**: [TV Hub Business Intelligence Dashboard](https://monitoring.navillasa.dev/d/e633cf5f-2c8b-483b-90a1-aaa85bddd4d9/tv-hub-business-intelligence-dashboard?orgId=1&refresh=15s)
- **Features**: Comprehensive business analytics and production monitoring
- **Analytics**: Platform-specific popularity rankings, real-time user activity, API performance metrics
- **Security**: Attack detection, system resource monitoring, response time analysis
- **Business Insights**: E.g. "Netflix leads with 37 requests, 4,284+ total API calls, 100% API success rate"

![Business Intelligence Dashboard](./docs/images/dashboard-screenshot.png)
*Interactive dashboard showing streaming platform analytics and production metrics*

### 🚀 **Automated Deployment Pipeline**
- **CI/CD Flow**: `git push → GitHub Actions → Container Registry → ArgoCD → Kubernetes`
- **Development**: Auto-deploys every successful build from main branch within 5-10 minutes
- **Production**: Manual promotion via `./scripts/promote-to-prod.sh <version>` after dev testing
- **Versioning**: Date-based semantic tags (e.g., `v20250819-abc123`) for clear traceability
- **Safety**: Comprehensive test suite + manual production gate prevents untested deployments

---

## 🏗️ **Architecture Overview**

### 🎯 **Application Architecture**
```
┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Node.js Backend │    │   PostgreSQL    │
│   (Nginx)        │◄──►│  (Express API)  │◄──►│   Database      │
│   Port: 80       │    │  Port: 4000     │    │   Port: 5432    │
└──────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                     ┌─────────────────┐
                     │  External APIs  │
                     │  • TMDB         │
                     │  • TVmaze       │ 
                     └─────────────────┘
```

### ☸️ **Infrastructure Architecture**
```mermaid
graph TB
    subgraph "🌐 External Access"
        Users[👥 Users]
        DNS[🌍 Cloud DNS<br/>navillasa.dev]
    end
    
    subgraph "🔒 Security Layer"
        Ingress[⚡ GKE Ingress<br/>Load Balancer]
        Certs[🔐 Managed SSL<br/>Certificates]
    end
    
    subgraph "☸️ GKE Autopilot Cluster"
        subgraph "📦 tv-dashboard-dev"
            DevFE[🎨 Frontend<br/>React/Nginx]
            DevBE[⚙️ Backend<br/>Node.js API]
            DevDB[🗄️ PostgreSQL<br/>Database]
        end
        
        subgraph "📦 tv-dashboard-prod"
            ProdFE[🎨 Frontend<br/>React/Nginx]
            ProdBE[⚙️ Backend<br/>Node.js API]
            ProdDB[🗄️ PostgreSQL<br/>Database]
        end
        
        subgraph "📊 monitoring"
            Grafana[📈 Grafana<br/>Dashboards]
            Prometheus[📊 Prometheus<br/>Metrics]
        end
        
        subgraph "🔐 vault-system"
            Vault[🏦 HashiCorp Vault<br/>Secrets Engine]
            ESO[🔑 External Secrets<br/>Operator]
        end
        
        subgraph "🚀 argocd"
            ArgoCD[🔄 ArgoCD<br/>GitOps]
            ArgoDash[🎛️ ArgoCD UI]
        end
    end
    
    subgraph "📱 GitOps Repository"
        GitRepo[📝 GitHub Repo<br/>k8s-gitops/]
        Manifests[📋 K8s Manifests<br/>base/ + overlays/]
    end
    
    subgraph "🏗️ CI/CD Pipeline"
        Actions[⚙️ GitHub Actions<br/>Build & Test]
        GCR[📦 Google Container<br/>Registry]
    end
    
    subgraph "🌍 External APIs"
        TMDB[🎬 TMDB API<br/>Movie Database]
        TVMaze[📺 TVMaze API<br/>TV Shows]
    end
    
    %% User Flow
    Users --> DNS
    DNS --> Ingress
    Ingress --> Certs
    
    %% Application Flow
    Ingress --> DevFE
    Ingress --> ProdFE
    Ingress --> Grafana
    Ingress --> ArgoDash
    
    DevFE --> DevBE
    DevBE --> DevDB
    ProdFE --> ProdBE
    ProdBE --> ProdDB
    
    %% External API Integration
    DevBE --> TMDB
    DevBE --> TVMaze
    ProdBE --> TMDB
    ProdBE --> TVMaze
    
    %% Monitoring
    Prometheus --> DevBE
    Prometheus --> ProdBE
    Prometheus --> DevDB
    Prometheus --> ProdDB
    Grafana --> Prometheus
    
    %% Secrets Management
    Vault --> ESO
    ESO --> DevDB
    ESO --> ProdDB
    ESO --> DevBE
    ESO --> ProdBE
    
    %% GitOps Flow
    GitRepo --> ArgoCD
    Manifests --> ArgoCD
    ArgoCD --> DevFE
    ArgoCD --> DevBE
    ArgoCD --> DevDB
    ArgoCD --> ProdFE
    ArgoCD --> ProdBE
    ArgoCD --> ProdDB
    ArgoCD --> Vault
    ArgoCD --> Grafana
    ArgoCD --> Prometheus
    
    %% CI/CD Flow
    Actions --> GCR
    GCR --> GitRepo
    
    style Users fill:#e1f5fe
    style Vault fill:#fff3e0
    style ArgoCD fill:#f3e5f5
    style Grafana fill:#e8f5e8
    style Prometheus fill:#e8f5e8
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Vite | Modern SPA with responsive design |
| **Backend** | Node.js + Express + TypeScript | RESTful API with data aggregation |
| **Database** | PostgreSQL | Persistent storage with ACID compliance |
| **Containerization** | Docker + Multi-stage builds | Optimized, secure container images |
| **Orchestration** | Kubernetes (GKE Autopilot) | Container orchestration and auto-scaling |
| **Infrastructure** | Terraform on GCP | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Monitoring** | Prometheus + Grafana | Observability and alerting |
| **Secrets** | HashiCorp Vault + External Secrets | Secure secrets management |
| **GitOps** | ArgoCD | Declarative deployments and promotion |
| **DNS/SSL** | Cloud DNS + Managed Certificates | Automatic HTTPS and domain management |

---

## 📁 **Project Structure**

```
tv-dashboard-k8s/
├── 🎨 frontend/              # React + TypeScript SPA
│   ├── src/App.tsx          # Main app with instant loading
│   ├── public/images/       # Optimized poster cache
│   ├── Dockerfile           # Multi-stage production build
│   └── nginx.conf           # Optimized serving config
├── ⚙️  backend/              # Node.js + Express API  
│   ├── src/
│   │   ├── clients/         # TMDB & TVMaze integrations
│   │   ├── services/        # Business logic & aggregation
│   │   ├── routes/          # REST API endpoints
│   │   ├── metrics.ts       # Prometheus metrics
│   │   └── db/              # Database operations
│   └── Dockerfile           # Optimized backend image
├── 🏗️  infra/                # Terraform Infrastructure as Code
│   ├── main.tf              # GKE Autopilot cluster
│   ├── variables.tf         # Environment configuration
│   └── kubeconfig.yaml      # Cluster access
├── ☸️  k8s-gitops/           # GitOps Kubernetes manifests
│   ├── base/                # Base configurations
│   │   ├── monitoring/      # Prometheus + Grafana stack
│   │   └── vault/           # HashiCorp Vault setup
│   ├── overlays/
│   │   ├── dev/             # Development environment
│   │   └── prod/            # Production environment
│   └── argocd/              # ArgoCD applications
├── 📊 monitoring/            # Dashboard configurations
│   └── tv-dashboard-grafana.json
├── 🔧 scripts/               # Automation scripts
│   ├── promote-to-prod.sh   # Production deployment
│   └── vault-auto-unseal.sh # Vault management
├── 🔄 .github/workflows/     # CI/CD pipeline
│   └── ci.yml               # Build, test, deploy automation
└── 🐳 docker-compose.yml     # Local development stack
```

---

## 🛠️ **Quick Start**

### **🌐 View Live Deployment**
- **Production**: [tv-hub.navillasa.dev](https://tv-hub.navillasa.dev) 
- **Monitoring**: [monitoring.navillasa.dev](https://monitoring.navillasa.dev/d/e633cf5f-2c8b-483b-90a1-aaa85bddd4d9/tv-hub-business-intelligence-dashboard?orgId=1&refresh=15s)

### **💻 Local Development**
```bash
# 1. Clone & Start
git clone https://github.com/navillasa/tv-dashboard-k8s.git
cd tv-dashboard-k8s
docker compose up -d

# 2. Access locally
open http://localhost:3000    # Frontend
open http://localhost:4000    # Backend API
```

### **☸️ Deploy to GKE**
```bash
# 1. Infrastructure (one-time setup)
cd infra && terraform apply

# 2. GitOps deployment via ArgoCD
# Pushes to 'main' branch auto-deploy to dev
# Production requires manual promotion:
./scripts/promote-to-prod.sh v20250819-abc123

# 3. Monitor deployment
kubectl get applications -n argocd
```

### **🔧 Prerequisites**
- Docker & Docker Compose (local dev)
- kubectl + gcloud CLI (deployment)
- GCP project with billing enabled

---

## ✅ **Production Features**
- [x] **Multi-platform aggregation**: TMDB + TVMaze APIs with intelligent deduplication
- [x] **GitOps deployment**: ArgoCD with dev auto-sync + manual prod promotion  
- [x] **Observability stack**: Prometheus metrics + custom Grafana dashboards
- [x] **Security**: HashiCorp Vault + External Secrets Operator
- [x] **Performance**: Instant loading, cached images, progressive enhancement
- [x] **Infrastructure**: Terraform on GKE Autopilot with managed SSL/DNS

### **✅ Recently Completed**

#### **GitOps Foundation**
- [x] Multi-environment setup with Kustomize overlays (dev/prod)
- [x] ArgoCD deployment with automated GitOps workflows
- [x] Environment promotion pipeline with manual approval gates
- [x] Automated CI/CD with GitHub Actions integration

#### **Observability Stack**
- [x] Prometheus + Grafana deployment via GitOps
- [x] Custom business metrics (platform popularity, API performance, user activity)
- [x] Public monitoring dashboard with streaming analytics
- [x] Infrastructure monitoring (memory, CPU, response times)

#### **Security & Secrets**
- [x] HashiCorp Vault integration for secrets management
- [x] External Secrets Operator for K8s secret synchronization
- [x] Production-ready security with service account isolation

### **🚧 Future Enhancements**

#### **Performance & Scale**  
- [x] Frontend performance optimization with instant mock data loading
- [ ] Redis caching layer for API response optimization
- [ ] Horizontal Pod Autoscaling based on demand
- [ ] Cost optimization dashboard with resource usage insights

---

## 📊 **DevOps Metrics & KPIs**

This project demonstrates measurable DevOps improvements:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Deployment Time** | Manual (30+ min) | Automated (3-5 min) | 85% faster |
| **Environment Consistency** | Manual setup | IaC + GitOps | 100% reproducible |
| **Security Posture** | Env file secrets | Vault integration | Enterprise-grade |
| **Monitoring Coverage** | None | Full observability | Complete visibility |

---

## 🧿 **Getting Started for Reviewers**

### **🌐 Live Applications** 
1. **TV Hub Production**: [tv-hub.navillasa.dev](http://tv-hub.navillasa.dev) - Full application with instant loading
2. **Business Intelligence Dashboard**: [monitoring.navillasa.dev](https://monitoring.navillasa.dev/d/e633cf5f-2c8b-483b-90a1-aaa85bddd4d9/tv-hub-business-intelligence-dashboard?orgId=1&refresh=15s) - Real-time metrics

### **🔍 Technical Deep Dive**
3. **CI/CD Pipeline**: [GitHub Actions](https://github.com/navillasa/tv-dashboard-k8s/actions) - Automated build/test/deploy
4. **Infrastructure Code**: [Terraform configs](./infra/) - GKE Autopilot + managed services
5. **GitOps Manifests**: [Kubernetes YAML](./k8s-gitops/) - Multi-environment with Kustomize
6. **Monitoring Setup**: [Grafana dashboards](./k8s-gitops/base/monitoring/) - Custom business metrics

---

## 📞 **Contact**

- 📧 **Email**: navillasa.dev@gmail.com
- 💼 **LinkedIn**: [linkedin.com/in/natalievillasana](https://www.linkedin.com/in/natalievillasana)
- 🌐 **Portfolio**: [navillasa.dev](https://navillasa.dev)
