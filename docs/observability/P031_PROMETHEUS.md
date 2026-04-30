# Phase P031 — Prometheus Installation

## Status: Pending

**Title:** Prometheus Installation  
**Stack:** Helm, Prometheus  
**Deliverable:** Prometheus deployed in lmg-monitoring namespace

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus \
  --namespace lmg-monitoring \
  --create-namespace \
  --set server.retention=15d \
  --set server.storageSize=50Gi
```

**Config:** Retention 15 days, Storage 50Gi, scrape interval 15s

## Next: [P032](./P032_SERVICEMONITOR_CRDS.md)
