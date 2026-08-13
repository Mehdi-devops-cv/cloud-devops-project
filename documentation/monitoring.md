# Monitoring - AppBTP DevOps Lab

## Stack

- **Prometheus**: Collecte de metriques (port 9091)
- **Grafana**: Dashboards (port 3000, admin/admin123)
- **Loki**: Centralisation de logs (port 3100)
- **Promtail**: Collecte de logs (port 9080)

## Dashboards

### API Dashboard
- Requetes/seconde
- Taux d'erreur
- Temps de reponse P95
- Logins, Uploads photos, PDF generes

### Kubernetes Dashboard
- Etat des pods
- Utilisation CPU/Memoire

## Metriques backend

| Metrique | Description |
|----------|-------------|
| appbtp_api_requests_total | Nombre total de requetes |
| appbtp_api_errors_total | Nombre total d'erreurs |
| appbtp_http_request_duration_seconds | Duree des requetes |
| appbtp_login_success_total | Logins reussis |
| appbtp_login_failed_total | Logins echoues |
| appbtp_photo_upload_success_total | Uploads photos reussis |
| appbtp_photo_upload_failed_total | Uploads photos echoues |
| appbtp_pdf_generated_total | PDF generes |
| appbtp_pdf_generation_duration_seconds | Duree generation PDF |
