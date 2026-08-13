# Kubernetes - AppBTP DevOps Lab

## Setup k3d

```bash
# Creer le cluster k3d
k3d cluster create appbtp --servers 1 --agents 2

# Verifier
kubectl cluster-info
kubectl get nodes
```

## Deploiement

```bash
# Namespace
kubectl apply -f kubernetes/namespace.yaml

# ConfigMap et Secrets
kubectl apply -f kubernetes/appbtp-configmap.yaml
kubectl apply -f kubernetes/appbtp-secret.yaml

# MongoDB
kubectl apply -f kubernetes/mongodb/

# RabbitMQ
kubectl apply -f kubernetes/rabbitmq/

# Backend
kubectl apply -f kubernetes/backend/

# Worker
kubectl apply -f kubernetes/worker/

# Monitoring
kubectl apply -f kubernetes/monitoring/
```

## Commandes utiles

```bash
# Pods
kubectl get pods -n appbtp
kubectl describe pod <pod-name> -n appbtp
kubectl logs -f <pod-name> -n appbtp

# Services
kubectl get svc -n appbtp

# Port forwarding
kubectl port-forward svc/backend 8081:8081 -n appbtp
kubectl port-forward svc/grafana 3000:3000 -n appbtp

# Debug
kubectl exec -it <pod-name> -n appbtp -- /bin/sh
```
