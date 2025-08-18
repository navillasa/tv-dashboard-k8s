#!/bin/bash

# Vault auto-unseal script for demo environment
# This script automatically unseals Vault if it's sealed
# In production, this would be handled by cloud KMS auto-unseal

set -e

VAULT_POD=$(kubectl get pods -n vault -l app=vault -o jsonpath='{.items[0].metadata.name}')

UNSEAL_KEY="${VAULT_UNSEAL_KEY}"

if [ -z "$UNSEAL_KEY" ]; then
    echo "❌ ERROR: VAULT_UNSEAL_KEY environment variable not set!"
    echo "Usage: VAULT_UNSEAL_KEY='your-key-here' ./vault-auto-unseal.sh"
    exit 1
fi

echo "🔍 Checking Vault status..."

# Check if Vault is sealed
SEALED=$(kubectl exec -n vault $VAULT_POD -- vault status -format=json | jq -r '.sealed')

if [ "$SEALED" = "true" ]; then
    echo "🔓 Vault is sealed, unsealing now..."
    kubectl exec -n vault $VAULT_POD -- vault operator unseal "$UNSEAL_KEY"
    echo "✅ Vault unsealed successfully!"
    
    # Verify External Secrets can sync
    echo "🔄 Waiting for External Secrets to sync..."
    sleep 10
    
    # Check External Secret status
    kubectl get externalsecrets -n tv-dashboard-dev
    
    echo "🎉 Vault auto-unseal completed!"
else
    echo "✅ Vault is already unsealed"
fi

echo "📊 Current status:"
kubectl get applications -n argocd
