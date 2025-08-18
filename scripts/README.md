# Scripts Directory

## vault-auto-unseal.sh

**Purpose**: Demo environment script to automatically unseal Vault after pod restarts.

### Usage

```bash
# Export the unseal key as an environment variable
export VAULT_UNSEAL_KEY="your-unseal-key-here"

# Run the script
./scripts/vault-auto-unseal.sh
```

### Alternative: Use .env file (gitignored)

```bash
# Create a .env file (add to .gitignore!)
echo "VAULT_UNSEAL_KEY=your-key-here" > .env

# Source it before running
source .env && ./scripts/vault-auto-unseal.sh
```

### Production Alternative

In production, use cloud KMS auto-unseal instead:

```yaml
# vault-config.yaml
seal "gcpkms" {
  project     = "my-project"
  region      = "global"
  key_ring    = "vault"
  crypto_key  = "vault-key"
}
```

### What This Script Does

1. ✅ Checks if Vault is sealed
2. ✅ Unseals using environment variable (secure)
3. ✅ Verifies External Secrets can sync
4. ✅ Shows ArgoCD application status
