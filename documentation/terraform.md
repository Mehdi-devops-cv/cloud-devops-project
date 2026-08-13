# Terraform - AppBTP DevOps Lab

## Usage

```bash
cd terraform

# Initialiser
terraform init

# Planifier
terraform plan

# Appliquer
terraform apply -auto-approve

# Detruire
terraform destroy -auto-approve
```

## Modules

- **namespace**: Cree le namespace Kubernetes appbtp
- **configmap**: Configuration non-sensible
- **secret**: Secrets (MongoDB URI, JWT secret, RabbitMQ URL)
- **deployment**: Deployment + Service pour chaque composant
