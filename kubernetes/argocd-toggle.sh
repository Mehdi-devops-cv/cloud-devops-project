#!/bin/bash
# Activation/desactivation d'ArgoCD (t3.micro friendly)
# Usage: bash kubernetes/argocd-toggle.sh start|stop

set -euo pipefail

CMD="${1:-status}"

# IP publique de l'instance EC2 hebergeant K3s, resolue a l'execution.
EC2_PUBLIC_IP="${EC2_PUBLIC_IP:-$(curl -s --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 || echo '<ec2-public-ip>')}"

case "$CMD" in
  start)
    echo "Arret de Jenkins pour liberer de la memoire..."
    sudo docker stop btp-jenkins 2>/dev/null || true

    echo "Installation d'ArgoCD..."
    sudo kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml 2>/dev/null

    echo "Attente du serveur ArgoCD..."
    sleep 30

    echo "Application du repo GitHub..."
    sudo kubectl apply -f /tmp/argocd-repo.yaml 2>/dev/null || true
    sudo kubectl apply -f /tmp/argocd-app.yaml 2>/dev/null || true

    echo "ArgoCD demarre sur https://${EC2_PUBLIC_IP}:30443"
    echo "Mot de passe : $(sudo kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' 2>/dev/null | base64 -d)"
    ;;

  stop)
    echo "Arret d'ArgoCD..."
    sudo kubectl delete namespace argocd 2>/dev/null || true
    echo "Redemarrage de Jenkins..."
    sudo docker start btp-jenkins 2>/dev/null || true
    echo "ArgoCD arrete, Jenkins relance"
    ;;

  status)
    if sudo kubectl get ns argocd >/dev/null 2>&1; then
      echo "ArgoCD : actif"
      sudo kubectl get pods -n argocd 2>/dev/null | head -5
      echo "URL : https://${EC2_PUBLIC_IP}:30443"
    else
      echo "ArgoCD : inactif"
    fi
    ;;
esac
