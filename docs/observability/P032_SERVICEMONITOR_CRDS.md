# Phase P032 — Prometheus ServiceMonitor CRDs

## Status: Pending

ServiceMonitor configs for all namespaces to scrape metrics from services.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-gateway
  namespace: lmg-monitoring
spec:
  selector:
    matchLabels:
      app: api-gateway
  endpoints:
  - port: metrics
    interval: 15s
```

## ServiceMonitor Targets
- api-gateway, auth-service, order-service
- driver-service, fleet-service, storefront-service
- payment-service, dispatch-engine
- ai-service, blockchain-service

## Next: [P033](./P033_GRAFANA.md)
