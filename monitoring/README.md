# Monitoring AppBTP (Datadog)

## Prerequisites

1. Creer un compte Datadog gratuit sur https://www.datadoghq.com
2. Aller dans Integrations > APIs > API Keys
3. Generer une cle d'API

## Installation

```bash
DD_API_KEY="votre_cle_ici" bash monitoring/datadog-setup.sh
```

L'agent est installe sur l'EC2 avec les integrations :
- CPU, Memory, Disk, Network
- Kubelet (K3s)
- Tags : env:production, service:appbtp, team:devops

## Dashboard

Le fichier `dashboard.json` contient la definition du dashboard Datadog.
Pour l'importer :
1. Aller dans Dashboards > New Dashboard > Import JSON
2. Copier le contenu de dashboard.json
3. Les metriques commenceront a apparaitre ~5min apres l'installation de l'agent

## Metriques disponibles

| Metrique | Description |
|----------|-------------|
| system.cpu.user | CPU utilisateur |
| system.mem.used | Memoire utilisee |
| system.disk.pct_used | Disque utilise (%) |
| system.net.bytes_rcvd | Trafic entrant |
| system.net.bytes_sent | Trafic sortant |
| kubernetes_state.node.ready | Sante du noeud K3s |
