# Debugging 502 Bad Gateway Errors: A Kubernetes Detective Story

*How to systematically diagnose and fix port/protocol mismatches in Kubernetes*

## The Problem Pattern

Throughout this project, I've hit the same issue repeatedly:
- **Frontend** looking for `dev-backend-service` instead of `prod-backend-service`
- **ArgoCD ingress** using port 443 instead of port 80
- **Vault** connection errors due to service discovery issues
- **External Secrets** pointing to wrong Vault paths

**The common thread**: **502 Bad Gateway errors caused by communication mismatches.**

## The 502 Error: What It Really Means

```
502 Bad Gateway = "I can reach something, but it's not responding correctly"
```

**This is different from:**
- **404**: "I can't find anything at this path"
- **503**: "Service is temporarily unavailable"  
- **Connection timeout**: "I can't reach anything at all"

**502 specifically means**: The proxy/load balancer reached a backend, but the backend response was invalid.

## The Systematic Debugging Approach

### Step 1: Identify the Communication Chain

**Every 502 has a path like this:**
```
Client → Load Balancer → Service → Pod
```

**Find where it breaks by checking each link.**

### Step 2: Check Backend Health in Load Balancer

```bash
# Get detailed ingress status
kubectl describe ingress <ingress-name> -n <namespace>

# Look for backend health status
# Example output:
ingress.kubernetes.io/backends: {
  "k8s1-backend-service-443":"UNHEALTHY"  # ← The smoking gun!
}
```

**Key indicators:**
- `UNHEALTHY` = Backend isn't responding on expected port/protocol
- `HEALTHY` = Backend is fine, look elsewhere

### Step 3: Compare Expected vs Actual Ports

```bash
# Check what the ingress expects
kubectl get ingress <name> -o yaml | grep -A 10 "backend:"

# Check what the service actually provides  
kubectl get service <service-name> -o yaml | grep -A 5 "ports:"

# Check what the pod is actually listening on
kubectl get pod <pod-name> -o yaml | grep -A 5 "ports:"
```

**Common mismatches:**
- Ingress expects port 443, service serves port 80
- Service targets port 8080, container listens on port 3000
- Protocol mismatch: HTTP vs HTTPS vs GRPC

### Step 4: Verify Service Discovery

```bash
# Check if service resolves within cluster
kubectl exec -it <any-pod> -- nslookup <service-name>

# Test connectivity to service
kubectl exec -it <any-pod> -- curl http://<service-name>:<port>/health

# Check service endpoints
kubectl get endpoints <service-name>
```

### Step 5: Check Protocol and Annotations

```bash
# Look for protocol-specific annotations
kubectl describe ingress <name> | grep -i "grpc\|http\|protocol"

# Common problematic annotations:
nginx.ingress.kubernetes.io/backend-protocol: GRPC  # ← Often wrong
nginx.ingress.kubernetes.io/ssl-redirect: true     # ← Can cause loops
```

## Examples from This Project

### Example 1: ArgoCD 502 Error

**Symptoms:**
```bash
curl https://argocd.navillasa.dev
# HTTP/2 502 Bad Gateway
```

**Diagnosis:**
```bash
kubectl describe ingress argocd-server-ingress -n argocd
# Backend: "k8s1-argocd-server-443":"UNHEALTHY"
```

**Root cause:**
```yaml
# Ingress configuration
backend:
  service:
    name: argocd-server
    port:
      number: 443  # ← Wrong! Load balancer needs HTTP

# Service configuration  
ports:
- port: 80   # ← This is what load balancer should use
- port: 443  # This is for direct HTTPS access
```

**Solution:**
```bash
kubectl patch ingress argocd-server-ingress -n argocd \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/port/number", "value": 80}]'
```

### Example 2: Frontend Can't Find Backend

**Symptoms:**
```bash
kubectl logs frontend-pod
# nginx: [emerg] host not found in upstream "dev-backend-service"
```

**Root cause:** Hardcoded service name in nginx config pointing to wrong environment.

**Diagnosis process:**
```bash
# Check what services exist in the namespace
kubectl get services -n tv-dashboard-prod
# No "dev-backend-service", only "prod-backend-service"!

# Check nginx configuration
kubectl exec frontend-pod -- cat /etc/nginx/conf.d/default.conf
# upstream backend { server dev-backend-service:4000; }  ← Wrong namespace!
```

**Solution:** Create environment-specific nginx configurations.

### Example 3: External Secrets Can't Reach Vault

**Symptoms:**
```bash
kubectl describe externalsecret api-secrets-from-vault
# Error: cannot read secret data from Vault: connection refused
```

**Diagnosis:**
```bash
# Check if Vault service exists
kubectl get service vault -n vault
# NAME: vault, PORT: 8200

# Check ClusterSecretStore configuration
kubectl get clustersecretstore vault-backend -o yaml
# server: "http://vault.vault.svc.cluster.local:8200"  ← URL looks right

# Test connectivity from External Secrets pod
kubectl exec -n external-secrets external-secrets-pod -- \
  curl http://vault.vault.svc.cluster.local:8200/v1/sys/health
# Connection timeout ← Vault is sealed!
```

**Root cause:** Vault was sealed after restart, not a port issue but similar debugging process.

## The Generalized Debugging Checklist

### 🔍 **Information Gathering**
```bash
# Get the error message
kubectl logs <failing-pod>
kubectl describe ingress <name>
kubectl get events --sort-by='.lastTimestamp'

# Map the communication path
Client → Ingress → Service → Pod
```

### 🎯 **Port Investigation**  
```bash
# Check each layer's port expectations
kubectl get ingress <name> -o yaml | grep port
kubectl get service <name> -o yaml | grep port  
kubectl get pod <name> -o yaml | grep containerPort

# Verify actual listening ports in container
kubectl exec <pod> -- netstat -tlnp
```

### 🌐 **Connectivity Testing**
```bash
# Test from outside cluster
curl -v http://<external-ip>:<port>/path

# Test from inside cluster  
kubectl exec <pod> -- curl http://<service>:<port>/path

# Check DNS resolution
kubectl exec <pod> -- nslookup <service-name>
```

### 🔧 **Configuration Verification**
```bash
# Check for conflicting annotations
kubectl describe ingress <name> | grep -i annotation

# Verify service selectors match pod labels
kubectl get service <name> -o yaml | grep selector
kubectl get pod <name> -o yaml | grep labels
```

## Pro Tips for Faster Debugging

### 1. **Use Port-Forward for Direct Testing**
```bash
# Bypass ingress/service and test pod directly
kubectl port-forward pod/<pod-name> 8080:8080
curl http://localhost:8080/health
```

### 2. **Check Multiple Namespaces**
```bash
# Service in wrong namespace is super common
kubectl get services --all-namespaces | grep <service-name>
```

### 3. **Temporary Debug Pod**
```bash
# Spin up a debug pod to test connectivity
kubectl run debug --image=busybox -it --rm -- sh
# Then: wget, nslookup, telnet from inside cluster
```

### 4. **Use Kubectl Proxy for API Access**
```bash
# Access services through kubectl proxy  
kubectl proxy &
curl http://localhost:8001/api/v1/namespaces/<ns>/services/<service>/proxy/
```

## Common Port/Protocol Patterns

### **Web Applications**
- **Frontend (nginx)**: Port 80 (HTTP)
- **Backend (Node.js)**: Port 3000, 4000, 8000  
- **Database**: PostgreSQL (5432), MySQL (3306)

### **Kubernetes Infrastructure**
- **ArgoCD**: Port 80 (HTTP) or 443 (HTTPS)
- **Grafana**: Port 3000
- **Prometheus**: Port 9090
- **Vault**: Port 8200

### **Load Balancer Patterns**
- **GKE Ingress**: Expects HTTP backends (port 80)
- **Nginx Ingress**: Can handle HTTP/HTTPS backends
- **Service Mesh**: Often uses specific ports for sidecars

The key insight: Most 502 errors are configuration mismatches, not infrastructure failures. A systematic approach beats random troubleshooting every time.
