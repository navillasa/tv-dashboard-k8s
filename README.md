# 📺 TV Hub

> **A modern TV show dashboard to demo production-ready DevOps practices**

[![CI/CD Pipeline](https://github.com/navillasa/tv-dashboard-k8s/actions/workflows/ci.yml/badge.svg)](https://github.com/navillasa/tv-dashboard-k8s/actions)
[![Infrastructure as Code](https://img.shields.io/badge/IaC-Terraform-7B42BC)](./infra/)
[![Container Security](https://img.shields.io/badge/Security-Multi--stage%20Builds-green)](./backend/Dockerfile)

![TV Hub Dashboard](docs/images/tv-hub-screenshot.png)
*Live dashboard showing popular shows across Netflix, Disney+, Prime Video, and more streaming platforms*

A comprehensive TV show aggregation platform built to demonstrate enterprise-level DevOps engineering practices. While the application itself is intentionally simple (displaying trending TV shows from multiple platforms), the infrastructure and deployment pipeline showcase advanced concepts including GitOps, observability, security, and cloud-native architecture patterns.

---

## 🌟 **Key Features**

### 👾 **Production-Ready Deployment**
- **Live Application**: [tv-hub.navillasa.dev](http://tv-hub.navillasa.dev)
- **GKE Autopilot**: Cost-effective Kubernetes with auto-scaling
- **Custom Domain + SSL**: Automatic certificate management
- **GitOps with ArgoCD**: Continuous deployment from Git

### 🔧 **DevOps Infrastructure** 
- **Infrastructure as Code**: Terraform for GCP resources
- **Multi-Environment Setup**: Dev/staging/prod with Kustomize overlays  
- **CI/CD Pipeline**: GitHub Actions with testing and security
- **Container Registry**: Google Container Registry integration
- **Secrets Management**: HashiCorp Vault with External Secrets Operator
- **GitOps Deployment**: ArgoCD with automated sync and rollback
- **Observability**: Prometheus + Grafana monitoring stack

### 🎯 **Current Capabilities**
- ✅ **Production Deployment**: Live at [tv-hub.navillasa.dev](http://tv-hub.navillasa.dev)
- ✅ **Multi-Environment GitOps**: Automated dev deployment, manual prod promotion via ArgoCD
- ✅ **Complete CI/CD Pipeline**: GitHub Actions builds, tests, and deploys with semantic versioning
- ✅ **Advanced Monitoring**: Business intelligence dashboard with streaming analytics
- ✅ **Instant Loading UX**: Mock data eliminates loading states, real data fetches in background
- ✅ **Production Security**: HashiCorp Vault + External Secrets for sensitive data management
- ✅ **Infrastructure as Code**: Full Terraform deployment on GKE Autopilot
- ✅ **Comprehensive Observability**: Prometheus metrics + Grafana dashboards with custom business KPIs

---

## 🌐 **Live Application Access**

### 📱 **TV Hub Dashboard** 
- **URL**: [http://tv-hub.navillasa.dev](http://tv-hub.navillasa.dev)
- **Features**: Multi-platform TV show aggregation with trending rankings
- **Data Sources**: TMDB + TVmaze APIs with real-time updates
- **UI**: Responsive React frontend with platform filtering and detailed modals

### 📊 **Live Business Intelligence Dashboard**
- **URL**: [TV Hub Business Intelligence Dashboard](https://monitoring.navillasa.dev/d/e0c978bd-6077-403e-ab3b-ba03f4b34962/tv-hub-business-intelligence-dashboard)
- **Access**: Basic auth (`demo` / `password`)
- **Features**: Comprehensive business analytics and production monitoring
- **Analytics**: Platform popularity rankings, real-time user activity, API performance metrics
- **Security**: Attack detection, system resource monitoring, response time analysis
- **Business Insights**: Netflix leads with 37 requests, 4,284+ total API calls, 100% API success rate

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

### **Application Features**
- **Multi-platform TV show aggregation** from TMDB and TVmaze APIs
- **Instant loading** with placeholder data while real data fetches
- **Trending rankings** with platform-specific popularity scores  
- **Responsive UI** with platform-branded color schemes
- **Detailed show modals** with cast, seasons, and watch links
- **Intelligent caching** and API rate limiting strategies
- **Real-time updates** with graceful error handling

---

## 📁 **Project Structure**

```
tv-dashboard-k8s/
├── 🎨 frontend/              # React + TypeScript SPA
│   ├── src/App.tsx          # Main application component
│   ├── Dockerfile           # Multi-stage build
│   └── healthcheck.sh       # Health monitoring
├── ⚙️  backend/              # Node.js + Express API
│   ├── src/
│   │   ├── clients/         # External API integrations
│   │   ├── services/        # Business logic & aggregation
│   │   ├── routes/          # REST API endpoints
│   │   └── db/              # Database operations
│   ├── Dockerfile           # Optimized backend image
│   └── jest.config.js       # Testing configuration
├── 🗄️  db/                   # PostgreSQL setup
│   └── init.sql             # Database schema
├── 🏗️  infra/                # Terraform Infrastructure
│   ├── main.tf              # GKE cluster configuration
│   ├── variables.tf         # Configurable parameters
│   └── outputs.tf           # Infrastructure outputs
├── ☸️  k8s/                   # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-deployment.yaml
│   └── ingress.yaml
├── 🔧 .github/workflows/     # CI/CD pipeline
│   └── ci.yml               # Automated testing & deployment
├── 🐳 docker-compose.yml     # Local development
├── 📋 Makefile              # Automation scripts
└── 📊 monitoring/           # [Coming Soon] Observability stack
```

---

## 🛠️ **Quick Start**

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+
- kubectl
- Terraform (for infrastructure)
- gcloud CLI (for GCP deployment)

### **Local Development**
```bash
# 1. Clone the repository
git clone https://github.com/your-username/tv-dashboard-k8s.git
cd tv-dashboard-k8s

# 2. Start local environment
docker compose up -d

# 3. Visit the application
open http://localhost:3000
```

### **Kubernetes Deployment**
```bash
# 1. Set up infrastructure
make infra-apply PROJECT_ID=your-gcp-project

# 2. Build and push images
make docker-build docker-push PROJECT_ID=your-gcp-project

# 3. Deploy to Kubernetes
make k8s-deploy

# 4. Check status
make k8s-status
```

---

## ✅ **Implemented**
- [x] Full-stack application with React frontend and Node.js backend
- [x] Multi-API integration aggregating data from TMDB and TVmaze
- [x] Comprehensive CI/CD with automated testing and deployment
- [x] Infrastructure as Code with Terraform on GCP
- [x] Container orchestration with Kubernetes manifests
- [x] Security best practices with secrets management and environment isolation
- [x] Advanced data aggregation with deduplication and platform ranking

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
| **Cost Transparency** | Unknown | Real-time tracking | Full cost tracking |

---

## 🧿 **Getting Started for Reviewers**

### **🌐 Live Applications** 
1. **TV Hub Production**: [tv-hub.navillasa.dev](http://tv-hub.navillasa.dev) - Full application with instant loading
2. **Business Intelligence Dashboard**: [monitoring.navillasa.dev](https://monitoring.navillasa.dev) - Real-time metrics (demo/password)

### **🔍 Technical Deep Dive**
3. **CI/CD Pipeline**: [GitHub Actions](https://github.com/navillasa/tv-dashboard-k8s/actions) - Automated build/test/deploy
4. **Infrastructure Code**: [Terraform configs](./infra/) - GKE Autopilot + managed services
5. **GitOps Manifests**: [Kubernetes YAML](./k8s-gitops/) - Multi-environment with Kustomize
6. **Monitoring Setup**: [Grafana dashboards](./k8s-gitops/base/monitoring/) - Custom business metrics

### **💡 Key Highlights for Employers**
- **Production-ready**: Real users, 100% uptime, professional monitoring
- **Full GitOps workflow**: Automated dev deployment + manual prod promotion  
- **Security-first**: Vault secrets management + service account isolation
- **Performance optimized**: Instant loading, comprehensive caching strategy
- **Business intelligence**: Custom metrics showing platform analytics and API performance

---

## 📞 **Contact & Collab**

**Interested in discussing DevOps strategies or potential collaboration?**
- 📧 **Email**: [navillasa.dev@gmail.com]
- 💼 **LinkedIn**: [www.linkedin.com/in/natalievillasana]
- 🌐 **Portfolio Site**: [https://navillasa.dev]
