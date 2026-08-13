#!/bin/bash
# Datadog agent setup for AppBTP EC2 (Amazon Linux 2023)
# Usage: DD_API_KEY="votre_cle" bash datadog-setup.sh

set -euo pipefail

if [ -z "${DD_API_KEY:-}" ]; then
  echo "Erreur : DD_API_KEY non definie"
  echo "1. Creez un compte Datadog gratuit sur https://www.datadoghq.com"
  echo "2. Allez dans Integrations > APIs > API Keys"
  echo "3. Relancez : DD_API_KEY=\"votre_cle\" bash $0"
  exit 1
fi

DD_SITE="${DD_SITE:-datadoghq.eu}"

# Installer l'agent
DD_API_KEY="$DD_API_KEY" DD_SITE="$DD_SITE" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Configurer les integrations K3s
cat > /etc/datadog-agent/conf.d/kubelet.d/conf.yaml << 'KUBELET'
instances:
  - host: 127.0.0.1
    port: 10250
    kubelet_client_crt: /var/lib/kubelet/pki/kubelet-client-current.pem
    kubelet_client_key: /var/lib/kubelet/pki/kubelet-client-current.pem
    kubelet_crt: /var/lib/kubelet/pki/kubelet.crt
KUBELET

# Activer les integrations de base
for check in cpu memory disk io network; do
  datadog-agent check "$check" > /dev/null 2>&1 || true
done

# Configurer les tags
sed -i "s/^# tags:/tags:/" /etc/datadog-agent/datadog.yaml
sed -i "/^tags:/a\  - env:production\n  - service:appbtp\n  - team:devops" /etc/datadog-agent/datadog.yaml

systemctl restart datadog-agent
echo "Agent installe et configure"
echo "Site : $DD_SITE"
echo "Pour verifier : datadog-agent status"