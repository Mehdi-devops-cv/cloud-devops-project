# Ansible - AppBTP DevOps Lab

## Usage

```bash
cd ansible

# Playbook complet
ansible-playbook -i inventory/hosts.ini playbook.yml

# Un seul role
ansible-playbook -i inventory/hosts.ini playbook.yml --tags "docker"
ansible-playbook -i inventory/hosts.ini playbook.yml --tags "security"
ansible-playbook -i inventory/hosts.ini playbook.yml --tags "monitoring"
ansible-playbook -i inventory/hosts.ini playbook.yml --tags "deployment"
```

## Roles

- **docker**: Verification Docker, reseau, containers
- **security**: JWT, permissions MongoDB, variables d'env
- **monitoring**: Verification Prometheus, Grafana, Loki
- **deployment**: Verification Backend, Worker, MongoDB, RabbitMQ, Jenkins
